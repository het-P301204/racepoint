import pytest
import asyncio
from lab.engine.events import EventRecorder, EventType
from lab.engine.coordinator import ConcurrencyCoordinator


@pytest.mark.asyncio
async def test_all_requests_dispatched() -> None:
    recorder = EventRecorder("TEST-COORD-001")
    coordinator = ConcurrencyCoordinator(3, recorder)

    async def dummy_fixture(request_id, initial_state, recorder):
        await recorder.record(request_id, EventType.RESPONSE_SENT, status="ok")
        return {"status": "ok", "final_state": {}}

    slots = await coordinator.run_coordinated(dummy_fixture, {})
    dispatched = [e for e in recorder.events if e.event_type == EventType.REQUEST_DISPATCHED]
    assert len(dispatched) == 3


@pytest.mark.asyncio
async def test_correct_number_of_slots_returned() -> None:
    recorder = EventRecorder("TEST-COORD-003")
    coordinator = ConcurrencyCoordinator(4, recorder)

    async def dummy_fixture(request_id, initial_state, recorder):
        return {"status": "ok", "final_state": {}}

    slots = await coordinator.run_coordinated(dummy_fixture, {})
    assert len(slots) == 4


@pytest.mark.asyncio
async def test_barrier_synchronizes_arrival() -> None:
    recorder = EventRecorder("TEST-COORD-002")
    coordinator = ConcurrencyCoordinator(2, recorder)
    arrival_times: list[float] = []

    async def timing_fixture(request_id, initial_state, recorder):
        import time
        arrival_times.append(time.monotonic())
        await recorder.record(request_id, EventType.RESPONSE_SENT)
        return {"status": "ok", "final_state": {}}

    await coordinator.run_coordinated(timing_fixture, {})
    assert len(arrival_times) == 2
    # Both arrivals should be within 50ms of each other (barrier synchronization)
    diff = abs(arrival_times[0] - arrival_times[1])
    assert diff < 0.050, f"Requests arrived {diff * 1000:.1f}ms apart — barrier may not be working"


@pytest.mark.asyncio
async def test_slot_ids_are_unique() -> None:
    recorder = EventRecorder("TEST-COORD-004")
    coordinator = ConcurrencyCoordinator(5, recorder)

    async def dummy_fixture(request_id, initial_state, recorder):
        return {"status": "ok", "final_state": {}}

    slots = await coordinator.run_coordinated(dummy_fixture, {})
    ids = [s.request_id for s in slots]
    assert len(ids) == len(set(ids)), "Request IDs must be unique"


@pytest.mark.asyncio
async def test_fixture_receives_initial_state() -> None:
    recorder = EventRecorder("TEST-COORD-005")
    coordinator = ConcurrencyCoordinator(2, recorder)
    received_states: list[dict] = []

    async def capturing_fixture(request_id, initial_state, recorder):
        received_states.append(dict(initial_state))
        return {"status": "ok", "final_state": {}}

    initial = {"account_id": "acct-xyz", "balance": 42}
    await coordinator.run_coordinated(capturing_fixture, initial)
    assert all(s == initial for s in received_states)
