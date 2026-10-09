import datetime
from typing import Any, Callable, Awaitable
from .coordinator import ConcurrencyCoordinator
from .events import EventRecorder, EventType
from .invariant import InvariantEvaluator, InvariantConfig
from .race_window import RaceWindowDetector


class RunManager:
    def __init__(self) -> None:
        self._results: dict[str, dict[str, Any]] = {}
        self._counter = 0

    def new_run_id(self) -> str:
        self._counter += 1
        year = datetime.datetime.now().year
        return f"RUN-{year}-{self._counter:04d}"

    async def execute_run(
        self,
        run_id: str,
        fixture_fn: Callable[..., Awaitable[Any]],
        initial_state: dict[str, Any],
        concurrency: int,
        invariant_config: InvariantConfig,
    ) -> dict[str, Any]:
        recorder = EventRecorder(run_id)
        await recorder.record("system", EventType.RUN_STARTED)

        coordinator = ConcurrencyCoordinator(
            concurrency=concurrency,
            recorder=recorder,
            timeout=15.0,
        )

        try:
            slots = await coordinator.run_coordinated(fixture_fn, initial_state)
        except Exception as exc:
            await recorder.record("system", EventType.RUN_FAILED, error=str(exc))
            result = {"run_id": run_id, "status": "failed", "error": str(exc)}
            self._results[run_id] = result
            return result

        final_state: dict[str, Any] = {}
        for slot in slots:
            if slot.result and isinstance(slot.result, dict):
                final_state.update(slot.result.get("final_state", {}))

        evaluator = InvariantEvaluator()
        preserved, explanation = evaluator.evaluate(invariant_config, initial_state, final_state)

        await recorder.record(
            "system",
            EventType.INVARIANT_CHECKED,
            preserved=preserved,
            explanation=explanation,
        )
        await recorder.record("system", EventType.RUN_COMPLETED, invariant_preserved=preserved)

        detector = RaceWindowDetector()
        race_windows = detector.detect(recorder.events, preserved)

        result = {
            "run_id": run_id,
            "status": "completed",
            "initial_state": initial_state,
            "final_state": final_state,
            "invariant_preserved": preserved,
            "invariant_explanation": explanation,
            "events": [
                {
                    "request_id": e.request_id,
                    "event_type": str(e.event_type),
                    "monotonic_ms": e.monotonic_ms,
                    "wall_time": e.wall_time,
                    "metadata": e.metadata,
                }
                for e in recorder.events
            ],
            "race_windows": [
                {
                    "start_ms": rw.start_ms,
                    "end_ms": rw.end_ms,
                    "requests": rw.participating_requests,
                    "observed_values": rw.observed_values,
                    "conclusion": rw.conclusion,
                    "violated_invariant": rw.violated_invariant,
                }
                for rw in race_windows
            ],
        }
        self._results[run_id] = result
        return result

    def get_result(self, run_id: str) -> dict[str, Any] | None:
        return self._results.get(run_id)
