"""
/ai/generate endpoint — the main entry point called by Spring Boot.

Flow:
1. Detect intent from the user's message.
2. Fetch live context from Spring Boot (if needed).
3. Fetch RAG knowledge (if needed).
4. Load conversation history from Redis.
5. Build the prompt and call the LLM.
6. Save both the user message and AI response to Redis.
7. Return structured JSON.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.services.intent_service import detect_intent
from app.services.context_fetcher import fetch_context
from app.services.prompt_builder import build_prompt
from app.services.llm_client import generate_response
from app.services.memory_service import get_chat_history, save_message

router = APIRouter()


class AIContext(BaseModel):
    userId: str
    role: str
    auctionId: Optional[str] = None


class GenerateRequest(BaseModel):
    message: str
    context: AIContext


class GenerateResponse(BaseModel):
    answer: str
    liveDataUsed: str = ""
    analysis: str = ""
    recommendation: str = ""
    suggestedNextActions: List[str] = []


from fastapi.responses import StreamingResponse

@router.post("/generate")
async def generate_endpoint(payload: GenerateRequest):
    try:
        # 1. Detect Intent
        intent = detect_intent(payload.message)

        # 2. Fetch RAG Knowledge (if needed)
        rag_data = None
        if intent in ["KNOWLEDGE", "STRATEGY"]:
            from app.services.retrieval_service import retrieval_service
            rag_data = retrieval_service.get_context(
                payload.message, payload.context.role
            )

        # 3. Build Prompt
        user_prompt = build_prompt(
            message=payload.message,
            role=payload.context.role,
            live_data=None,  # We no longer pre-fetch live data! Tools will handle this.
            rag_data=rag_data,
        )

        # 4. Load conversation history from Redis
        chat_history = get_chat_history(payload.context.userId)

        # 5. Call LLM (with memory and user context for tool execution)
        user_context_dict = {
            "userId": payload.context.userId,
            "role": payload.context.role,
            "auctionId": payload.context.auctionId,
        }
        
        async def event_generator():
            from app.services.llm_client import generate_stream
            import json
            full_text = ""
            try:
                for chunk in generate_stream(
                    user_prompt, 
                    chat_history=chat_history, 
                    user_context=user_context_dict
                ):
                    full_text += chunk
                    # Send JSON encoded text chunk for easier parsing on the client
                    yield f"data: {json.dumps({'text': chunk})}\n\n"
                
                # 6. Save to Redis for future turns
                save_message(payload.context.userId, "user", payload.message)
                save_message(payload.context.userId, "assistant", full_text)
                
            except Exception as e:
                print(f"Generate endpoint stream error: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                
        return StreamingResponse(event_generator(), media_type="text/event-stream")

    except Exception as e:
        print(f"Generate endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
