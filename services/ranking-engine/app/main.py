from __future__ import annotations

from hmac import compare_digest

from fastapi import FastAPI, Header, HTTPException, status
from fastapi.responses import JSONResponse

from .engine import RankingEngine, ScanMode
from .settings import Settings
from .storage import RankingStorage


settings = Settings.from_environment()
storage = RankingStorage(settings)
engine = RankingEngine(settings, storage)
app = FastAPI(
    title="SotaHub Community Ranking Engine",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
)


def authorize(authorization: str | None) -> None:
    expected = f"Bearer {settings.engine_secret}"
    if authorization is None or not compare_digest(authorization, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autorizado.",
        )


@app.get("/health")
def health() -> dict:
    current = engine.state()
    return {
        "status": "ok",
        "rankingStatus": current.get("status", "idle"),
        "runMode": current.get("runMode"),
    }


@app.get("/state")
def state(authorization: str | None = Header(default=None)) -> dict:
    authorize(authorization)
    return engine.state()


@app.post("/jobs/{mode}")
def start_job(
    mode: ScanMode,
    authorization: str | None = Header(default=None),
) -> JSONResponse:
    authorize(authorization)
    current, started = engine.start(mode)
    return JSONResponse(
        current,
        status_code=status.HTTP_202_ACCEPTED if started else status.HTTP_409_CONFLICT,
    )
