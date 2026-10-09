from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .routers import health, scenarios, runs, evidence, lab

app = FastAPI(
    title="RACEPOINT API",
    description="Race Condition & TOCTOU Research Platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(scenarios.router, prefix="/api/scenarios", tags=["scenarios"])
app.include_router(runs.router, prefix="/api/runs", tags=["runs"])
app.include_router(evidence.router, prefix="/api/evidence", tags=["evidence"])
app.include_router(lab.router, prefix="/api/lab", tags=["lab"])


@app.on_event("startup")
async def startup() -> None:
    from lab.db.connection import init_db
    await init_db()
