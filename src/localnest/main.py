from fastapi import FastAPI

from localnest.config import Settings
from localnest.documents import router as documents_router
from localnest.schemas import HealthResponse

from . import __version__

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


app.include_router(documents_router.router)
