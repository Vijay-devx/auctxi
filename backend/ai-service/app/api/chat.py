from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from app.services.chat_service import chat_service

router = APIRouter()

from typing import Optional

class ChatRequest(BaseModel):
    message: str
    auctionId: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    role_detected: str

from fastapi.responses import StreamingResponse
import json

@router.post("/chat")
async def chat_endpoint(request: Request, payload: ChatRequest):
    """
    Handles incoming chat requests with streaming response (SSE).
    """
    print(f"INSIDE CHAT ENDPOINT: {payload.message}")
    role_header = request.headers.get("X-User-Roles", "GUEST")
    role = role_header.replace("ROLE_", "").capitalize()
    
    # Parse auctionId from the payload
    auction_id = payload.auctionId
    
    # Get user info if available from gateway
    user_id = request.headers.get("X-User-Id", "anonymous")
    
    user_context_dict = {
        "userId": user_id,
        "role": role,
        "auctionId": auction_id,
    }
    
    from app.services.memory_service import get_chat_history, save_message
    from app.services.llm_client import generate_stream
    
    chat_history = get_chat_history(user_id)
    
    async def event_generator():
        full_text = ""
        try:
            for chunk in generate_stream(
                payload.message,
                chat_history=chat_history,
                user_context=user_context_dict
            ):
                full_text += chunk
                yield f"data: {json.dumps({'text': chunk})}\n\n"
            
            # Save conversation to memory
            save_message(user_id, "user", payload.message)
            save_message(user_id, "assistant", full_text)
            
        except Exception as e:
            print(f"Chat stream error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")
