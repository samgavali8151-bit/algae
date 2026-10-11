import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = ["*"]
    
    # Firebase
    FIREBASE_DATABASE_URL: str = "https://final-methane-deb07-default-rtdb.firebaseio.com"
    FIREBASE_SERVICE_ACCOUNT_KEY: str = "./serviceAccountKey.json"
    DEFAULT_DEVICE_ID: str = "algae_pbr_01"
    
    # LLM keys
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    LLM_PROVIDER: str = "anthropic"
    
    # Bioreactor settings
    REACTOR_VOLUME_LITERS: float = 20.0
    OPTIMAL_PH_MIN: float = 7.0
    OPTIMAL_PH_MAX: float = 8.2
    OPTIMAL_TEMP_MIN: float = 22.0
    OPTIMAL_TEMP_MAX: float = 28.0

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
