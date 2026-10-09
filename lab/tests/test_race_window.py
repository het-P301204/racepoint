from lab.engine.race_window import RaceWindowDetector
from lab.engine.events import RunEvent, EventType


def make_event(req: str, etype: EventType, ms: float, **meta) -> RunEvent:
    return RunEvent(
        request_id=req,
        event_type=etype,
        monotonic_ms=ms,
        wall_time="2026-01-01T00:00:00Z",
        metadata=meta,
    )


def test_detects_race_window_when_two_reads_same_value() -> None:
    events = [
        make_event("REQ-001", EventType.STATE_READ, 5.0, observed_value=10),
        make_event("REQ-002", EventType.STATE_READ, 5.5, observed_value=10),
        make_event("REQ-001", EventType.STATE_WRITE_COMMITTED, 10.0),
        make_event("REQ-002", EventType.STATE_WRITE_COMMITTED, 10.5),
    ]
    detector = RaceWindowDetector()
    windows = detector.detect(events, invariant_preserved=False)
    assert len(windows) == 1
    assert "REQ-001" in windows[0].participating_requests
    assert "REQ-002" in windows[0].participating_requests
    assert windows[0].conclusion == "confirmed"


def test_no_race_window_when_reads_differ() -> None:
    events = [
        make_event("REQ-001", EventType.STATE_READ, 5.0, observed_value=10),
        make_event("REQ-001", EventType.STATE_WRITE_COMMITTED, 8.0),
        make_event("REQ-002", EventType.STATE_READ, 10.0, observed_value=0),
    ]
    detector = RaceWindowDetector()
    windows = detector.detect(events, invariant_preserved=True)
    assert len(windows) == 0


def test_conclusion_plausible_when_invariant_preserved() -> None:
    events = [
        make_event("REQ-001", EventType.STATE_READ, 5.0, observed_value=10),
        make_event("REQ-002", EventType.STATE_READ, 5.2, observed_value=10),
    ]
    detector = RaceWindowDetector()
    windows = detector.detect(events, invariant_preserved=True)
    if windows:
        assert windows[0].conclusion == "plausible"


def test_no_race_window_single_read() -> None:
    events = [
        make_event("REQ-001", EventType.STATE_READ, 5.0, observed_value=10),
        make_event("REQ-001", EventType.STATE_WRITE_COMMITTED, 8.0),
    ]
    detector = RaceWindowDetector()
    windows = detector.detect(events, invariant_preserved=True)
    assert len(windows) == 0


def test_violated_invariant_field_set_on_confirmed_window() -> None:
    events = [
        make_event("REQ-001", EventType.STATE_READ, 1.0, observed_value=5),
        make_event("REQ-002", EventType.STATE_READ, 1.1, observed_value=5),
        make_event("REQ-001", EventType.STATE_WRITE_COMMITTED, 5.0),
    ]
    detector = RaceWindowDetector()
    windows = detector.detect(events, invariant_preserved=False)
    assert windows[0].violated_invariant is not None
