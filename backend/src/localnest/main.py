from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from localnest.config import Settings
from localnest.db.engine import create_db_engine, create_session_factory
from localnest.documents import router as documents_router
from localnest.schemas import HealthResponse

from . import __version__

settings = Settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    engine = create_db_engine(settings.database_url)
    session_factory = create_session_factory(engine)
    app.state.engine = engine
    app.state.session_factory = session_factory
    yield
    engine.dispose()
    app.state.engine = None
    app.state.session_factory = None


app = FastAPI(
    title=settings.app_name,
    description=settings.description,
    version=__version__,
    lifespan=lifespan,
)


@app.get("/health")
def read_health() -> HealthResponse:
    return HealthResponse(
        status="healthy",
        application=settings.app_name,
        version=__version__,
        environment=settings.environment,
    )


app.include_router(documents_router.router)
