"""
Centralized Configuration Manager for AuctXI AI Service.

All configurable values are loaded from the .env file and exposed here.
To change any setting (model, API key, URLs, etc.), edit the .env file.
No code changes required.
"""
import os
from dotenv import load_dotenv

# Load .env file once at import time
load_dotenv()


class LLMConfig:
    """LLM provider settings."""
    PROVIDER = os.getenv("LLM_PROVIDER", "openai")          # "openai" or "ollama"

    # OpenAI / Zhipu AI
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.z.ai/api/paas/v4/")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "GLM-4.7-Flash")
    OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.3"))
    OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "1024"))

    # Ollama (fallback)
    OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")


class SpringBootConfig:
    """Spring Boot Core Service connection settings."""
    URL = os.getenv("SPRING_BOOT_URL", "http://localhost:8080")
    INTERNAL_TOKEN = os.getenv("AI_INTERNAL_TOKEN", "secret_token_123")


class RedisConfig:
    """Redis connection and chat history settings."""
    HOST = os.getenv("REDIS_HOST", "localhost")
    PORT = int(os.getenv("REDIS_PORT", "6379"))
    DB = int(os.getenv("REDIS_DB", "0"))
    CHAT_HISTORY_TTL = int(os.getenv("REDIS_CHAT_HISTORY_TTL", "3600"))  # seconds


class RAGConfig:
    """RAG / Vector Store settings."""
    FAISS_INDEX_PATH = os.getenv("FAISS_INDEX_PATH", "./faiss_index")


class AppConfig:
    """Application-level settings."""
    PORT = int(os.getenv("AI_SERVICE_PORT", "5003"))
