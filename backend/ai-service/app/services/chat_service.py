"""
Chat Service — used by the /api/v1/ai/chat endpoint.

This service is now a thin wrapper that delegates to the same
Groq-powered LLM client used by the /ai/generate endpoint.
"""
from app.services.retrieval_service import retrieval_service
from app.services.llm_client import generate_response
from app.services.memory_service import get_chat_history, save_message


class ChatService:
    def generate_response(self, question: str, role: str, user_id: str = "anonymous") -> str:
        """Generate a response using the configured LLM provider."""
        # 1. Retrieve static knowledge context
        context = retrieval_service.get_context(question, role)

        # 2. Load conversation history
        chat_history = get_chat_history(user_id)

        # 3. Build a simple prompt
        prompt = f"""[USER CONTEXT]
Role: {role}
Question: {question}

[PLATFORM KNOWLEDGE BASE]
{context}

[RESPONSE RULES]
Return ONLY a JSON object matching this schema:
{{"answer": "string", "liveDataUsed": "string", "analysis": "string", "recommendation": "string", "suggestedNextActions": ["string"]}}
"""
        # 4. Generate
        result = generate_response(prompt, chat_history=chat_history)

        # 5. Save to memory
        save_message(user_id, "user", question)
        answer = result.get("answer", "I'm sorry, I couldn't process your request.")
        save_message(user_id, "assistant", answer)

        return answer


# Singleton instance
chat_service = ChatService()
