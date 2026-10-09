from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_evidence() -> dict:
    return {"evidence": [], "total": 0}
