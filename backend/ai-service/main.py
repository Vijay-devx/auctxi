from fastapi import FastAPI
from dotenv import load_dotenv
import uvicorn
from app.api.chat import router as chat_router
from app.api.generate import router as generate_router

# Load environment variables from .env
load_dotenv()

# Initialize FastAPI application
app = FastAPI(
    title="AuctXI AI Assistant",
    description="Role-Aware RAG Chat Microservice",
    version="1.0.0"
)

# Register routers
app.include_router(chat_router, prefix="/api/v1/ai", tags=["Chat"])
app.include_router(generate_router, prefix="/ai", tags=["Generate"])

@app.get("/health")
def health_check():
    return {"status": "UP", "service": "AI Assistant"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5003, reload=True)
