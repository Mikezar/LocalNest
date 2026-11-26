import os
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

APP_FOLDER = "LocalNest"
DATABASE_FILE = "localnest.db"


def default_data_dir() -> Path:
    """%LOCALAPPDATA%\\LocalNest on Windows, ~/.local/share/LocalNest elsewhere."""
    local_app_data = os.environ.get("LOCALAPPDATA")
    if local_app_data:
        return Path(local_app_data) / APP_FOLDER
    return Path.home() / ".local" / "share" / APP_FOLDER


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="LOCALNEST_")

    app_name: str = "LocalNest"
    description: str = "Local-first Knowledge and Retrieval Platform"
    environment: str = "development"
    data_dir: Path = Field(default_factory=default_data_dir)

    @property
    def database_path(self) -> Path:
        return self.data_dir / DATABASE_FILE

    @property
    def database_url(self) -> str:
        # Forward slashes: backslashes in a URL can be read as escapes.
        return f"sqlite:///{self.database_path.as_posix()}"
