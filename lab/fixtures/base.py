from abc import ABC, abstractmethod
from typing import Any
from lab.engine.events import EventRecorder


class BaseFixture(ABC):
    @abstractmethod
    async def execute(
        self,
        request_id: str,
        initial_state: dict[str, Any],
        recorder: EventRecorder,
    ) -> dict[str, Any]:
        ...
