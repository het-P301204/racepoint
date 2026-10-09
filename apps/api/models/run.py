from pydantic import BaseModel
from typing import Any


class RunRecord(BaseModel):
    id: str
    scenario_id: str
    execution_mode: str
    fixture_version: str
    started_at: str
    completed_at: str | None = None
    status: str
    config: dict[str, Any] = {}
    initial_state: dict[str, Any] = {}
    final_state: dict[str, Any] = {}
    invariant_result: str | None = None
    error_message: str | None = None


class EventRecord(BaseModel):
    id: str
    run_id: str
    request_id: str
    event_type: str
    monotonic_ms: float
    wall_time: str
    metadata: dict[str, Any] = {}
