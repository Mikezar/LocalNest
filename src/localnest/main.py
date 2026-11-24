from fastapi import FastAPI

from . import __version__
from .config import Settings
from .schemas import HealthResponse

settings = Settings()

app = FastAPI(title=settings.app_name, description=settings.description, version=__version__)


@app.get("/health")
def read_health() -> HealthResponse:
    return HealthResponse(
        status="healthy",
        application=settings.app_name,
        version=__version__,
        environment=settings.environment,
    )
