import aiosqlite
from typing import Any
from .base import BaseFixture
from lab.engine.events import EventRecorder, EventType


class DbToctouHardenedFixture(BaseFixture):
    """HARDENED: Atomic conditional UPDATE — no separate SELECT needed."""

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
            await recorder.record(
                request_id,
                EventType.STATE_WRITE_ATTEMPTED,
                operation="conditional_update",
                withdrawal=withdrawal,
            )

            # HARDENED: Atomic conditional update — succeeds only if balance >= withdrawal
            cursor = await db.execute(
                "UPDATE lab_accounts SET balance = balance - ? WHERE id = ? AND balance >= ?",
                (withdrawal, account_id, withdrawal),
            )
            await db.commit()
            affected = cursor.rowcount

            cur2 = await db.execute(
                "SELECT balance FROM lab_accounts WHERE id = ?", (account_id,)
            )
            row = await cur2.fetchone()
            final_balance = row[0] if row else 0

            if affected > 0:
                await recorder.record(
                    request_id,
                    EventType.STATE_WRITE_COMMITTED,
                    committed_value=final_balance,
                    rows_affected=affected,
                )
                status = "success"
            else:
                await recorder.record(
                    request_id,
                    EventType.STATE_WRITE_REJECTED,
                    reason="insufficient_balance",
                )
                status = "rejected"

        await recorder.record(request_id, EventType.RESPONSE_SENT, status=status)
        return {"status": status, "final_state": {"balance": final_balance}}
