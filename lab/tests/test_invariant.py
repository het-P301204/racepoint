import pytest
from lab.engine.invariant import InvariantEvaluator, InvariantConfig


def test_minimum_balance_preserved() -> None:
    ev = InvariantEvaluator()
    config = InvariantConfig("minimum_balance", {"minimum": 0, "field": "balance"}, "balance >= 0")
    ok, msg = ev.evaluate(config, {"balance": 10}, {"balance": 0})
    assert ok
    assert "0" in msg


def test_minimum_balance_violated() -> None:
    ev = InvariantEvaluator()
    config = InvariantConfig("minimum_balance", {"minimum": 0, "field": "balance"}, "balance >= 0")
    ok, msg = ev.evaluate(config, {"balance": 10}, {"balance": -10})
    assert not ok
    assert "-10" in msg


def test_single_use_preserved() -> None:
    ev = InvariantEvaluator()
    config = InvariantConfig("single_use", {"field": "used_count"}, "used once")
    ok, _ = ev.evaluate(config, {}, {"used_count": 1})
    assert ok


def test_single_use_violated() -> None:
    ev = InvariantEvaluator()
    config = InvariantConfig("single_use", {"field": "used_count"}, "used once")
    ok, _ = ev.evaluate(config, {}, {"used_count": 3})
    assert not ok


def test_non_negative_preserved() -> None:
    ev = InvariantEvaluator()
    config = InvariantConfig("non_negative", {"field": "value"}, "non-negative")
    ok, _ = ev.evaluate(config, {}, {"value": 0})
    assert ok


def test_non_negative_violated() -> None:
    ev = InvariantEvaluator()
    config = InvariantConfig("non_negative", {"field": "value"}, "non-negative")
    ok, _ = ev.evaluate(config, {}, {"value": -1})
    assert not ok


def test_unique_account_preserved() -> None:
    ev = InvariantEvaluator()
    config = InvariantConfig("unique_account", {"field": "duplicate_count"}, "no duplicates")
    ok, _ = ev.evaluate(config, {}, {"duplicate_count": 0})
    assert ok


def test_unique_account_violated() -> None:
    ev = InvariantEvaluator()
    config = InvariantConfig("unique_account", {"field": "duplicate_count"}, "no duplicates")
    ok, _ = ev.evaluate(config, {}, {"duplicate_count": 2})
    assert not ok


def test_max_count_preserved() -> None:
    ev = InvariantEvaluator()
    config = InvariantConfig("max_count", {"field": "count", "maximum": 5}, "max 5")
    ok, _ = ev.evaluate(config, {}, {"count": 5})
    assert ok


def test_max_count_violated() -> None:
    ev = InvariantEvaluator()
    config = InvariantConfig("max_count", {"field": "count", "maximum": 5}, "max 5")
    ok, _ = ev.evaluate(config, {}, {"count": 6})
    assert not ok


def test_unknown_invariant_type_returns_false() -> None:
    ev = InvariantEvaluator()
    config = InvariantConfig("unknown_type", {}, "unknown")
    ok, msg = ev.evaluate(config, {}, {})
    assert not ok
    assert "Unknown invariant type" in msg
