import asyncio
from typing import Any
from .base import BaseFixture
from lab.engine.events import EventRecorder, EventType

# Module-level state shared across concurrent requests
_balance_store_h: dict[str, int] = {}

# Per-account locks — created on first access via _meta_lock
_account_locks: dict[str, asyncio.Lock] = {}
_meta_lock = asyncio.Lock()


class BalanceHardenedFixture(BaseFixture):
    """
    HARDENED: asyncio.Lock wraps the read-check-write sequence.
    Only one coroutine can be inside the critical section per account at a time,
    so the balance can never go negative.
    """

    async def _get_lock(self, account_id: str) -> asyncio.Lock:
        async with _meta_lock:
            if account_id not in _account_locks:
                _account_locks[account_id] = asyncio.Lock()
            return _account_locks[account_id]

    async def execute(
        self,
        request_id: str,
        initial_state: dict[str, Any],
        recorder: EventRecorder,
    ) -> dict[str, Any]:
        account_id = initial_state.get("account_id", "default")
        initial_balance = initial_state.get("initial_balance", 10)
        withdrawal = initial_state.get("withdrawal_amount", 10)

        if account_id not in _balance_store_h:
            _balance_store_h[account_id] = initial_balance

        lock = await self._get_lock(account_id)

        await recorder.record(request_id, EventType.LOCK_REQUESTED, account_id=account_id)
        async with lock:
            await recorder.record(request_id, EventType.LOCK_ACQUIRED, account_id=account_id)

            # SAFE: read while holding the lock
            balance = _balance_store_h[account_id]
            await recorder.record(
                request_id,
                EventType.STATE_READ,
                state_id="balance",
                observed_value=balance,
                account_id=account_id,
            )

            await recorder.record(
                request_id,
                EventType.CHECK_COMPLETED,
                check="balance_sufficient",
                result=balance >= withdrawal,
            )

            if balance >= withdrawal:
                new_balance = balance - withdrawal
                await recorder.record(
                    request_id,
                    EventType.STATE_WRITE_ATTEMPTED,
                    previous_value=balance,
                    attempted_value=new_balance,
                )
                _balance_store_h[account_id] = new_balance
                await recorder.record(
                    request_id,
                    EventType.STATE_WRITE_COMMITTED,
                    committed_value=new_balance,
                )
                status = "success"
            else:
                status = "rejected"

            await recorder.record(request_id, EventType.LOCK_RELEASED, account_id=account_id)

        await recorder.record(request_id, EventType.RESPONSE_SENT, status=status)
        return {
            "status": status,
            "final_state": {"balance": _balance_store_h[account_id]},
        }

    @classmethod
    def reset(cls, account_id: str) -> None:
        """Reset balance and lock for a given account — used in tests."""
        _balance_store_h.pop(account_id, None)
        _account_locks.pop(account_id, None)
