from dataclasses import dataclass, field
from .events import RunEvent, EventType


@dataclass
class DetectedRaceWindow:
    start_ms: float
    end_ms: float
    participating_requests: list[str]
    shared_state_id: str
    observed_values: dict[str, str]
    conclusion: str
    violated_invariant: str | None = None


class RaceWindowDetector:
    def detect(
        self,
        events: list[RunEvent],
        invariant_preserved: bool,
    ) -> list[DetectedRaceWindow]:
        reads = [e for e in events if e.event_type == EventType.STATE_READ]
        writes = [e for e in events if e.event_type == EventType.STATE_WRITE_COMMITTED]

        if len(reads) < 2:
            return []

        # Group reads by observed value
        groups: dict[str, list[RunEvent]] = {}
        for r in reads:
            key = str(r.metadata.get("observed_value", "?"))
            groups.setdefault(key, []).append(r)

        windows: list[DetectedRaceWindow] = []
        for val, group in groups.items():
            if len(group) < 2:
                continue
            first = min(group, key=lambda e: e.monotonic_ms)
            last = max(group, key=lambda e: e.monotonic_ms)
            writes_after = [w for w in writes if w.monotonic_ms > first.monotonic_ms]
            end_ms = (
                min(w.monotonic_ms for w in writes_after)
                if writes_after
                else last.monotonic_ms + 20.0
            )
            windows.append(
                DetectedRaceWindow(
                    start_ms=first.monotonic_ms,
                    end_ms=end_ms,
                    participating_requests=[r.request_id for r in group],
                    shared_state_id="primary_state",
                    observed_values={r.request_id: val for r in group},
                    conclusion="confirmed" if not invariant_preserved else "plausible",
                    violated_invariant=(
                        "Balance invariant violated" if not invariant_preserved else None
                    ),
                )
            )
        return windows
