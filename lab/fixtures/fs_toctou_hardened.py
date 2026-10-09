import os
import pathlib
import tempfile
from typing import Any
from .base import BaseFixture
from lab.engine.events import EventRecorder, EventType

_DEFAULT_LAB_DIR = str(pathlib.Path(tempfile.gettempdir()) / "racepoint-lab")


class FsToctouHardenedFixture(BaseFixture):
    """HARDENED: Atomic file creation using O_CREAT | O_EXCL."""

    async def execute(
        self,
        request_id: str,
        initial_state: dict[str, Any],
        recorder: EventRecorder,
    ) -> dict[str, Any]:
        lab_dir = initial_state.get("lab_dir", _DEFAULT_LAB_DIR)
        resource_name = initial_state.get("resource_name", "claim.lock")
        path = os.path.join(lab_dir, resource_name)

        os.makedirs(lab_dir, exist_ok=True)

        await recorder.record(
            request_id,
            EventType.STATE_WRITE_ATTEMPTED,
            path=path,
            operation="O_CREAT|O_EXCL",
        )
        try:
            fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
            with os.fdopen(fd, "w") as f:
                f.write(f"claimed by {request_id}\n")
            await recorder.record(
                request_id,
                EventType.STATE_WRITE_COMMITTED,
                path=path,
                claimer=request_id,
            )
            status = "claimed"
        except FileExistsError:
            await recorder.record(
                request_id,
                EventType.STATE_WRITE_REJECTED,
                path=path,
                reason="file_exists",
            )
            status = "rejected"

        await recorder.record(request_id, EventType.RESPONSE_SENT, status=status)
        return {
            "status": status,
            "final_state": {"file_exists": os.path.exists(path)},
        }
