from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="LOCALNEST_")

    app_name: str = "LocalNest"
    description: str = "Local-first Knowledge and Retrieval Platform"
    environment: str = "development"
