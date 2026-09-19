from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "AI-NEXUS"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # PostgreSQL database
    DATABASE_URL: str

    # JWT security
    SECRET_KEY: str = Field(
        min_length=32,
        description="Secret key used for JWT signing",
    )

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Local Ollama configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # Local LLM model
    LLM_MODEL: str = "qwen2.5:1.5b"

    # File storage
    UPLOAD_DIR: str = "../data/uploads"

    VECTORSTORE_DIR: str = "../data/vectorstore"

    MAX_UPLOAD_SIZE_MB: int = 25

    # Frontend
    BACKEND_CORS_ORIGINS: str = (
        "http://localhost:5173"
    )

    # RAG embedding model
    EMBEDDING_MODEL: str = (
        "sentence-transformers/all-MiniLM-L6-v2"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.BACKEND_CORS_ORIGINS.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

