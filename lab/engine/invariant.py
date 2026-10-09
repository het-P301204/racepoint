from dataclasses import dataclass
from typing import Any


@dataclass
class InvariantConfig:
    type: str
    constraint: dict[str, Any]
    description: str


class InvariantEvaluator:
    def evaluate(
        self,
        config: InvariantConfig,
        initial_state: dict[str, Any],
        final_state: dict[str, Any],
    ) -> tuple[bool, str]:
        """Returns (preserved: bool, explanation: str)."""
        t = config.type
        c = config.constraint

        if t == "minimum_balance":
            minimum = c.get("minimum", 0)
            field = c.get("field", "balance")
            val = final_state.get(field, 0)
            ok = val >= minimum
            return ok, f"balance={val} {'≥' if ok else '<'} minimum={minimum}"

        if t == "single_use":
            field = c.get("field", "used_count")
            val = final_state.get(field, 0)
            ok = val <= 1
            return ok, f"use_count={val} ({'OK' if ok else 'VIOLATION: used more than once'})"

        if t == "unique_account":
            field = c.get("field", "duplicate_count")
            val = final_state.get(field, 0)
            ok = val == 0
            return ok, f"duplicates={val} ({'OK' if ok else 'VIOLATION'})"

        if t == "non_negative":
            field = c.get("field", "value")
            val = final_state.get(field, 0)
            ok = val >= 0
            return ok, f"value={val} ({'≥0 OK' if ok else '<0 VIOLATION'})"

        if t == "max_count":
            field = c.get("field", "count")
            maximum = c.get("maximum", 1)
            val = final_state.get(field, 0)
            ok = val <= maximum
            return ok, f"count={val} ({'≤' if ok else '>'} maximum={maximum})"

        return False, f"Unknown invariant type: {t}"
