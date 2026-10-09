import asyncio
from typing import Any
from .base import BaseFixture
from lab.engine.events import EventRecorder, EventType

_user_store: dict[str, list[str]] = {}  # username -> list of account_ids created
_reg_check_lock = None  # NOT used in vulnerable version


class RegistrationVulnerableFixture(BaseFixture):
    """VULNERABLE: Check username existence, then create — without atomic protection."""

    async def execute(
        self,
        request_id: str,
        initial_state: dict[str, Any],
        recorder: EventRecorder,
    ) -> dict[str, Any]:
        username = initial_state.get("username", "testuser")

        if username not in _user_store:
            _user_store[username] = []

        # VULNERABLE: Check then act — no lock
        existing = len(_user_store[username])
        await recorder.record(
            request_id,
            EventType.STATE_READ,
            state_id="user_store",
            observed_value=existing,
            username=username,
        )

        await asyncio.sleep(0.005)  # Race window

        await recorder.record(
            request_id,
            EventType.CHECK_COMPLETED,
            check="username_available",
            result=existing == 0,
        )

        if existing == 0:  # Stale check — another request may have already created the account
            account_id = f"acc-{request_id}"
            await recorder.record(
                request_id,
                EventType.STATE_WRITE_ATTEMPTED,
                previous_value=existing,
                attempted_value=existing + 1,
            )
            _user_store[username].append(account_id)
            await recorder.record(
                request_id,
                EventType.STATE_WRITE_COMMITTED,
                committed_value=len(_user_store[username]),
            )
            status = "created"
        else:
            status = "rejected"

        await recorder.record(request_id, EventType.RESPONSE_SENT, status=status)
        return {
            "status": status,
            "final_state": {
                "account_count": len(_user_store[username]),
                "duplicate_count": max(0, len(_user_store[username]) - 1),
            },
        }

    @classmethod
    def reset(cls, username: str) -> None:
        _user_store[username] = []
