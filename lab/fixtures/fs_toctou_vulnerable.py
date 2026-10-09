import asyncio
import os
import pathlib
import tempfile
from typing import Any
from .base import BaseFixture
from lab.engine.events import EventRecorder, EventType

_DEFAULT_LAB_DIR = str(pathlib.Path(tempfile.gettempdir()) / "racepoint-lab")


class FsToctouVulnerableFixture(BaseFixture):
    """VULNERABLE: os.path.exists() check then open() — race between check and create."""

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

        exists = os.path.exists(path)
        await recorder.record(
            request_id,
            EventType.STATE_READ,
            state_id="filesystem",
            observed_value=exists,
            path=path,
        )

        await asyncio.sleep(0.003)  # Race window

        await recorder.record(
            request_id,
            EventType.CHECK_COMPLETED,
            check="file_not_exists",
            result=not exists,
        )

        if not exists:  # Stale check — another coroutine may have created the file already
            await recorder.record(
                request_id,
                EventType.STATE_WRITE_ATTEMPTED,
                path=path,
                operation="create",
            )
            with open(path, "w") as f:
                f.write(f"claimed by {request_id}\n")
            await recorder.record(
                request_id,
                EventType.STATE_WRITE_COMMITTED,
                path=path,
                claimer=request_id,
            )
            status = "claimed"
        else:
            status = "already_claimed"

        await recorder.record(request_id, EventType.RESPONSE_SENT, status=status)
        return {
            "status": status,
            "final_state": {"file_exists": os.path.exists(path)},
        }
