from fastapi import APIRouter, HTTPException
from lab.scenarios.registry import SCENARIO_REGISTRY

router = APIRouter()


@router.get("/")
async def list_scenarios() -> dict:
    return {"scenarios": SCENARIO_REGISTRY, "total": len(SCENARIO_REGISTRY)}


@router.get("/{scenario_id}")
async def get_scenario(scenario_id: str) -> dict:
    scenario = next((s for s in SCENARIO_REGISTRY if s["id"] == scenario_id), None)
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario {scenario_id} not found")
    return scenario
