from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_runs() -> dict:
    # Returns demo data in demo mode; real DB data in lab mode
    return {"runs": [], "total": 0, "note": "Connect local lab for real run history"}
