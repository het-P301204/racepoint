import asyncio
from typing import Any
from .base import BaseFixture
from lab.engine.events import EventRecorder, EventType

_user_store_h: dict[str, list[str]] = {}
_reg_lock = asyncio.Lock()


class RegistrationHardenedFixture(BaseFixture):
    """HARDENED: asyncio.Lock ensures the check-then-create is atomic."""

    async def execute(
        self,
        request_id: str,
        initial_state: dict[str, Any],
        recorder: EventRecorder,
    ) -> dict[str, Any]:
        username = initial_state.get("username", "testuser")

        if username not in _user_store_h:
            _user_store_h[username] = []

        await recorder.record(request_id, EventType.LOCK_REQUESTED)
        async with _reg_lock:
            await recorder.record(request_id, EventType.LOCK_ACQUIRED)

            # SAFE: read while holding the lock
            existing = len(_user_store_h[username])
            await recorder.record(
                request_id,
                EventType.STATE_READ,
                state_id="user_store",
                observed_value=existing,
                username=username,
            )

            await recorder.record(
                request_id,
                EventType.CHECK_COMPLETED,
                check="username_available",
                result=existing == 0,
            )

            if existing == 0:
                account_id = f"acc-{request_id}"
                await recorder.record(
                    request_id,
                    EventType.STATE_WRITE_ATTEMPTED,
                    previous_value=existing,
                    attempted_value=existing + 1,
                )
                _user_store_h[username].append(account_id)
                await recorder.record(
                    request_id,
                    EventType.STATE_WRITE_COMMITTED,
                    committed_value=len(_user_store_h[username]),
                )
                status = "created"
            else:
                status = "rejected"

            await recorder.record(request_id, EventType.LOCK_RELEASED)

        await recorder.record(request_id, EventType.RESPONSE_SENT, status=status)
        return {
            "status": status,
            "final_state": {
                "account_count": len(_user_store_h[username]),
                "duplicate_count": max(0, len(_user_store_h[username]) - 1),
            },
        }

    @classmethod
    def reset(cls, username: str) -> None:
        _user_store_h[username] = []
