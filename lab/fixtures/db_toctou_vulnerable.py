import asyncio
import aiosqlite
from typing import Any
from .base import BaseFixture
from lab.engine.events import EventRecorder, EventType


class DbToctouVulnerableFixture(BaseFixture):
    """VULNERABLE: SELECT then UPDATE without row locking or atomic condition."""

    def __init__(self, db_path: str) -> None:
        self.db_path = db_path

    async def execute(
        self,
        request_id: str,
        initial_state: dict[str, Any],
        recorder: EventRecorder,
    ) -> dict[str, Any]:
        account_id = initial_state.get("account_id", 1)
        withdrawal = initial_state.get("withdrawal_amount", 10)

        async with aiosqlite.connect(self.db_path) as db:
            await recorder.record(request_id, EventType.TRANSACTION_STARTED)

            # VULNERABLE: plain SELECT without FOR UPDATE
            cursor = await db.execute(
                "SELECT balance FROM lab_accounts WHERE id = ?", (account_id,)
            )
            row = await cursor.fetchone()
            balance = row[0] if row else 0

            await recorder.record(
                request_id,
                EventType.STATE_READ,
                state_id="db_balance",
                observed_value=balance,
            )

            await asyncio.sleep(0.005)  # Race window

            if balance >= withdrawal:
                new_balance = balance - withdrawal
                await recorder.record(
                    request_id,
                    EventType.STATE_WRITE_ATTEMPTED,
                    previous_value=balance,
                    attempted_value=new_balance,
                )
                await db.execute(
                    "UPDATE lab_accounts SET balance = ? WHERE id = ?",
                    (new_balance, account_id),
                )
                await db.commit()
                await recorder.record(
                    request_id,
                    EventType.STATE_WRITE_COMMITTED,
                    committed_value=new_balance,
                )
                status = "success"
                final_balance = new_balance
            else:
                status = "rejected"
                final_balance = balance

        await recorder.record(request_id, EventType.RESPONSE_SENT, status=status)
        return {"status": status, "final_state": {"balance": final_balance}}
