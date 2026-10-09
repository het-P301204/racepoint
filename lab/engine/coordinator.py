import asyncio
from dataclasses import dataclass, field
from typing import Any, Callable, Awaitable
from .events import EventRecorder, EventType


@dataclass
class RequestSlot:
    request_id: str
    worker_id: str
    result: Any = None
    error: Exception | None = None


class ConcurrencyCoordinator:
    """
    Uses asyncio.Barrier (Python 3.11+) to synchronize request arrival.
    All requests wait at the barrier before proceeding to the fixture,
    maximizing overlap and race condition probability.
    """

    def __init__(
        self,
        concurrency: int,
        recorder: EventRecorder,
        timeout: float = 15.0,
    ) -> None:
        self.concurrency = concurrency
        self.recorder = recorder
        self.timeout = timeout
        self._barrier = asyncio.Barrier(concurrency)

    async def run_coordinated(
        self,
        fixture_fn: Callable[..., Awaitable[Any]],
        initial_state: dict[str, Any],
    ) -> list[RequestSlot]:
        slots = [
            RequestSlot(request_id=f"REQ-{i + 1:03d}", worker_id=f"W-{i + 1}")
            for i in range(self.concurrency)
        ]

        async def execute_slot(slot: RequestSlot) -> None:
            try:
                await self.recorder.record(slot.request_id, EventType.REQUEST_DISPATCHED)
                async with asyncio.timeout(self.timeout):
                    await self._barrier.wait()
                await self.recorder.record(slot.request_id, EventType.REQUEST_RECEIVED)
                slot.result = await fixture_fn(slot.request_id, initial_state, self.recorder)
            except Exception as exc:
                slot.error = exc
                await self.recorder.record(
                    slot.request_id, EventType.RUN_FAILED, error=str(exc)
                )

        async with asyncio.timeout(self.timeout + 5):
            await asyncio.gather(*[execute_slot(s) for s in slots])

        return slots
