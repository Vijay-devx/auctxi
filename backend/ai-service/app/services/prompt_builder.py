"""
Prompt Builder — constructs the user-turn prompt for the LLM.

The system persona is now handled inside llm_client.py (as a system message).
This module builds only the user-context portion of the prompt.
"""
import json


def build_prompt(message: str, role: str, live_data: dict = None, rag_data: str = None) -> str:
    """
    Build the user-turn prompt that gets sent alongside the system message.
    """
    prompt = f"""[USER CONTEXT]
Role: {role}
Question: {message}

"""

    if live_data:
        prompt += f"""[LIVE SYSTEM CONTEXT]
The following is real-time data from the AuctXI platform:
{json.dumps(live_data, indent=2)}

"""

    if rag_data:
        prompt += f"""[PLATFORM KNOWLEDGE BASE]
Relevant platform rules from documentation:
{rag_data}

"""

    prompt += """[RESPONSE RULES]
You are interacting with the user in a chat interface. Respond naturally using Markdown. Be conversational and concise. Do NOT provide unsolicited tutorials or dump instructions.
Provide actionable recommendations based on the context. Do not use JSON schema. 
NEVER recommend breaking platform rules. NEVER approve payments or perform operations.
CRITICAL: Use Indian Rupees (₹) for all money/currency values. Never use dollars ($).
"""
    return prompt
