import asyncio
from typing import Any
from .base import BaseFixture
from lab.engine.events import EventRecorder, EventType

# Module-level state shared across all concurrent requests — intentionally global
_balance_store: dict[str, int] = {}

# NOT used in the vulnerable version — lock intentionally absent
_balance_lock = None


class BalanceVulnerableFixture(BaseFixture):
    """
    VULNERABLE: Check-then-act without a lock.
    A 5 ms sleep widens the race window so concurrent requests reliably
    read the same balance before either write commits.
    """

    async def execute(
        self,
        request_id: str,
        initial_state: dict[str, Any],
        recorder: EventRecorder,
    ) -> dict[str, Any]:
        account_id = initial_state.get("account_id", "default")
        initial_balance = initial_state.get("initial_balance", 10)
        withdrawal = initial_state.get("withdrawal_amount", 10)

        # Initialise account if first request
        if account_id not in _balance_store:
            _balance_store[account_id] = initial_balance

        # VULNERABLE: read without holding a lock
        balance = _balance_store[account_id]
        await recorder.record(
            request_id,
            EventType.STATE_READ,
            state_id="balance",
            observed_value=balance,
            account_id=account_id,
        )

        # Artificial delay — opens the race window so other coroutines can read first
        await asyncio.sleep(0.005)

        await recorder.record(
            request_id,
            EventType.CHECK_COMPLETED,
            check="balance_sufficient",
            result=balance >= withdrawal,
        )

        if balance >= withdrawal:
            # Stale check — another coroutine may have already withdrawn
            new_balance = balance - withdrawal
            await recorder.record(
                request_id,
                EventType.STATE_WRITE_ATTEMPTED,
                previous_value=balance,
                attempted_value=new_balance,
            )
            _balance_store[account_id] = new_balance
            await recorder.record(
                request_id,
                EventType.STATE_WRITE_COMMITTED,
                committed_value=new_balance,
            )
            status = "success"
        else:
            status = "rejected"

        await recorder.record(request_id, EventType.RESPONSE_SENT, status=status)
        return {
            "status": status,
            "final_state": {"balance": _balance_store[account_id]},
        }

    @classmethod
    def reset(cls, account_id: str) -> None:
        """Reset balance for a given account — used in tests."""
        _balance_store.pop(account_id, None)
