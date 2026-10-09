import pytest
import asyncio
from lab.engine.events import EventRecorder, EventType
from lab.engine.coordinator import ConcurrencyCoordinator
from lab.engine.invariant import InvariantEvaluator, InvariantConfig
from lab.fixtures.balance_vulnerable import BalanceVulnerableFixture, _balance_store
from lab.fixtures.balance_hardened import BalanceHardenedFixture, _balance_store_h


@pytest.mark.asyncio
async def test_vulnerable_records_state_reads() -> None:
    account_id = "test-read-001"
    _balance_store[account_id] = 10

    fixture = BalanceVulnerableFixture()
    recorder = EventRecorder("TEST-READ-001")
    coordinator = ConcurrencyCoordinator(2, recorder)

    await coordinator.run_coordinated(
        fixture.execute,
        {"account_id": account_id, "initial_balance": 10, "withdrawal_amount": 10},
    )

    reads = [e for e in recorder.events if e.event_type == EventType.STATE_READ]
    assert len(reads) == 2
    # Both should have observed the same initial value (race window)
    observed = [e.metadata.get("observed_value") for e in reads]
    assert observed[0] == observed[1], "Both requests should see the same stale balance"


@pytest.mark.asyncio
async def test_hardened_fixture_allows_exactly_one_success() -> None:
    account_id = "test-hard-002"
    _balance_store_h[account_id] = 10

    fixture = BalanceHardenedFixture()
    recorder = EventRecorder("TEST-HARD-002")
    coordinator = ConcurrencyCoordinator(4, recorder)

    slots = await coordinator.run_coordinated(
        fixture.execute,
        {"account_id": account_id, "initial_balance": 10, "withdrawal_amount": 10},
    )

    successes = [s for s in slots if s.result and s.result.get("status") == "success"]
    assert len(successes) == 1
    assert _balance_store_h[account_id] >= 0


@pytest.mark.asyncio
async def test_hardened_invariant_preserved() -> None:
    account_id = "test-inv-003"
    _balance_store_h[account_id] = 10

    fixture = BalanceHardenedFixture()
    recorder = EventRecorder("TEST-INV-003")
    coordinator = ConcurrencyCoordinator(4, recorder)

    await coordinator.run_coordinated(
        fixture.execute,
        {"account_id": account_id, "initial_balance": 10, "withdrawal_amount": 10},
    )

    final_balance = _balance_store_h[account_id]
    config = InvariantConfig("minimum_balance", {"minimum": 0, "field": "balance"}, "balance >= 0")
    evaluator = InvariantEvaluator()
    ok, _ = evaluator.evaluate(config, {"balance": 10}, {"balance": final_balance})
    assert ok


@pytest.mark.asyncio
async def test_vulnerable_may_produce_negative_balance() -> None:
    """Vulnerable fixture can drive balance negative under concurrent load."""
    account_id = "test-vuln-neg-004"
    _balance_store[account_id] = 10

    fixture = BalanceVulnerableFixture()
    recorder = EventRecorder("TEST-VULN-NEG-004")
    coordinator = ConcurrencyCoordinator(4, recorder)

    await coordinator.run_coordinated(
        fixture.execute,
        {"account_id": account_id, "initial_balance": 10, "withdrawal_amount": 10},
    )

    # With 4 concurrent requests all seeing balance=10 and withdrawal=10,
    # multiple may succeed, driving the balance negative.
    # We just verify the fixture ran without exception.
    received = [e for e in recorder.events if e.event_type == EventType.RESPONSE_SENT]
    assert len(received) == 4


@pytest.mark.asyncio
async def test_hardened_no_lock_contention_errors() -> None:
    """Hardened fixture must not raise under high concurrency."""
    account_id = "test-lock-005"
    _balance_store_h[account_id] = 50

    fixture = BalanceHardenedFixture()
    recorder = EventRecorder("TEST-LOCK-005")
    coordinator = ConcurrencyCoordinator(8, recorder)

    slots = await coordinator.run_coordinated(
        fixture.execute,
        {"account_id": account_id, "initial_balance": 50, "withdrawal_amount": 10},
    )

    errors = [s for s in slots if s.error is not None]
    assert len(errors) == 0, f"Unexpected errors: {[str(e.error) for e in errors]}"
    assert _balance_store_h[account_id] >= 0
