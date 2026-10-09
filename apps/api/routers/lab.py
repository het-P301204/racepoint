from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from lab.engine.run_manager import RunManager
from lab.engine.invariant import InvariantConfig
from lab.fixtures.balance_vulnerable import BalanceVulnerableFixture
from lab.fixtures.balance_hardened import BalanceHardenedFixture
from lab.scenarios.registry import SCENARIO_REGISTRY
from ..core.config import settings

router = APIRouter()
_run_manager = RunManager()


class LabRunRequest(BaseModel):
    scenario_id: str
    mode: str = Field(pattern="^(vulnerable|hardened)$")
    concurrency_level: int = Field(ge=2, le=8)
    request_limit: int = Field(ge=2, le=20)


@router.post("/run")
async def start_lab_run(req: LabRunRequest, background: BackgroundTasks) -> dict:
    if req.concurrency_level > settings.max_concurrency:
        raise HTTPException(400, f"concurrency_level exceeds maximum ({settings.max_concurrency})")
    if req.request_limit > settings.max_requests_per_run:
        raise HTTPException(400, f"request_limit exceeds maximum ({settings.max_requests_per_run})")

    scenario = next((s for s in SCENARIO_REGISTRY if s["id"] == req.scenario_id), None)
    if not scenario:
        raise HTTPException(404, f"Scenario {req.scenario_id} not found")

    run_id = _run_manager.new_run_id()

    fixture = BalanceVulnerableFixture() if req.mode == "vulnerable" else BalanceHardenedFixture()
    inv_config = InvariantConfig(
        type="minimum_balance",
        constraint={"minimum": 0, "field": "balance"},
        description="Balance must remain >= 0",
    )
    initial_state = {
        "account_id": f"lab-{run_id}",
        "initial_balance": 10,
        "withdrawal_amount": 10,
    }

    background.add_task(
        _run_manager.execute_run,
        run_id=run_id,
        fixture_fn=fixture.execute,
        initial_state=initial_state,
        concurrency=req.concurrency_level,
        invariant_config=inv_config,
    )

    return {"run_id": run_id, "status": "starting", "message": "Lab run initiated"}


@router.get("/run/{run_id}")
async def get_run_result(run_id: str) -> dict:
    result = _run_manager.get_result(run_id)
    if result is None:
        return {"run_id": run_id, "status": "running", "message": "Run in progress"}
    return result


@router.get("/status")
async def lab_status() -> dict:
    return {
        "lab_ready": True,
        "active_runs": 0,
        "max_concurrency": settings.max_concurrency,
        "platform_notes": "Windows: asyncio.Barrier requires Python 3.11+",
    }
