import asyncio
import time
import datetime
from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any


class EventType(StrEnum):
    RUN_STARTED = "RUN_STARTED"
    REQUEST_DISPATCHED = "REQUEST_DISPATCHED"
    REQUEST_RECEIVED = "REQUEST_RECEIVED"
    STATE_READ = "STATE_READ"
    CHECK_COMPLETED = "CHECK_COMPLETED"
    LOCK_REQUESTED = "LOCK_REQUESTED"
    LOCK_ACQUIRED = "LOCK_ACQUIRED"
    LOCK_RELEASED = "LOCK_RELEASED"
    TRANSACTION_STARTED = "TRANSACTION_STARTED"
    TRANSACTION_COMMITTED = "TRANSACTION_COMMITTED"
    TRANSACTION_ROLLED_BACK = "TRANSACTION_ROLLED_BACK"
    STATE_WRITE_ATTEMPTED = "STATE_WRITE_ATTEMPTED"
    STATE_WRITE_COMMITTED = "STATE_WRITE_COMMITTED"
    STATE_WRITE_REJECTED = "STATE_WRITE_REJECTED"
    RESPONSE_SENT = "RESPONSE_SENT"
    INVARIANT_CHECKED = "INVARIANT_CHECKED"
    RUN_COMPLETED = "RUN_COMPLETED"
    RUN_FAILED = "RUN_FAILED"


@dataclass
class RunEvent:
    request_id: str
    event_type: EventType
    monotonic_ms: float
    wall_time: str
    metadata: dict[str, Any] = field(default_factory=dict)


class EventRecorder:
    def __init__(self, run_id: str) -> None:
        self.run_id = run_id
        self._start = time.monotonic()
        self._events: list[RunEvent] = []
        self._lock = asyncio.Lock()

    async def record(
        self,
        request_id: str,
        event_type: EventType,
        **metadata: Any,
    ) -> RunEvent:
        mono = (time.monotonic() - self._start) * 1000
        wall = datetime.datetime.now(datetime.UTC).isoformat()
        event = RunEvent(
            request_id=request_id,
            event_type=event_type,
            monotonic_ms=mono,
            wall_time=wall,
            metadata=dict(metadata),
        )
        async with self._lock:
            self._events.append(event)
        return event

    @property
    def events(self) -> list[RunEvent]:
        return list(self._events)
