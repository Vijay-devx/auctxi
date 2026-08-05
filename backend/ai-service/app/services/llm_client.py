"""
LLM Client — talks to Groq (primary) or Ollama (fallback).

Which provider is used is controlled by LLM_PROVIDER in .env.
Model name, temperature, and max tokens are also in .env.
"""
import json
import requests
from openai import OpenAI
from app.config import LLMConfig

# ─── OpenAI client (lazy singleton) ────────────────────────────────────────────
_openai_client = None

def _get_openai_client() -> OpenAI:
    global _openai_client
    if _openai_client is None:
        _openai_client = OpenAI(
            api_key=LLMConfig.OPENAI_API_KEY,
            base_url=LLMConfig.OPENAI_BASE_URL
        )
    return _openai_client


# ─── Public API ──────────────────────────────────────────────────────────────

def generate_response(prompt: str, chat_history: list = None, user_context: dict = None) -> dict:
    """
    Send a prompt to the configured LLM and return a structured dict.
    
    Args:
        prompt: The system + user prompt string.
        chat_history: Optional list of {"role": ..., "content": ...} dicts
                      for conversational memory.
        user_context: Context about the user (id, role) for tool calling.
    """
    if LLMConfig.PROVIDER == "openai":
        return _generate_via_openai(prompt, chat_history, user_context)
    else:
        return _generate_via_ollama(prompt)


from app.tools.spring_tools import TOOL_SCHEMAS, AVAILABLE_TOOLS

def generate_stream(prompt: str, chat_history: list = None, user_context: dict = None):
    """
    Send a prompt to the configured LLM and yield chunks of text.
    """
    if LLMConfig.PROVIDER == "openai":
        yield from _generate_via_openai_stream(prompt, chat_history, user_context)
    else:
        # Fallback to Ollama (for now, just yield a single chunk since we haven't implemented stream for Ollama)
        result = _generate_via_ollama(prompt)
        yield result.get("answer", "")

def _get_system_prompt(role_description: str) -> str:
    return (
        f"You are the AuctXI Expert Auction Strategist. The user is a {role_description}. "
        "You help users with auction strategy, team building, budgeting, and platform rules. "
        "IMPORTANT: Be conversational and concise. Do NOT over-explain or provide unsolicited tutorials. "
        "If the user simply says 'hello' or greets you, greet them back warmly and ask how you can assist them today. Do NOT dump instructions on them. "
        "If the user asks about their own data, wallet, budget, recent bids, or active auctions, ALWAYS CALL the appropriate tool using the tool calling API. "
        "CRITICAL: Always format all currency values in Indian Rupees (₹) (e.g. ₹1,00,000). Never use dollars ($) or any other currency symbol. "
        "CRITICAL: NEVER output raw <tool_call>, </tool_call>, </arg_value>, or any XML tool tags in your final response to the user. Use tools silently via the API only. "
        "Respond in well-formatted Markdown. Provide actionable recommendations based on the data you have."
    )


import re as _re
_TOOL_TAG_RE = _re.compile(r'<tool_call>.*?</tool_call>', _re.DOTALL)
_ARG_VALUE_RE = _re.compile(r'</?(?:tool_call|arg_value)>', _re.DOTALL)

def _clean_chunk(text: str) -> str:
    """Strip any raw tool_call XML tags that GLM leaks into its text output."""
    text = _TOOL_TAG_RE.sub('', text)
    text = _ARG_VALUE_RE.sub('', text)
    return text

def _generate_via_openai_stream(prompt: str, chat_history: list = None, user_context: dict = None):
    try:
        client = _get_openai_client()
        messages = []

        role_description = "Team Owner/Client"
        if user_context:
            role = user_context.get("role", "")
            if role.startswith("ROLE_"):
                role = role[5:]
                
            if role == "MANAGER":
                role_description = "Auction Manager"
            elif role == "ADMIN":
                role_description = "Platform Administrator"

        messages.append({"role": "system", "content": _get_system_prompt(role_description)})

        if chat_history:
            for msg in chat_history:
                messages.append(msg)

        messages.append({"role": "user", "content": prompt})

        # 1st Call to OpenAI (might return tool_calls)
        response = client.chat.completions.create(
            model=LLMConfig.OPENAI_MODEL,
            messages=messages,
            temperature=LLMConfig.OPENAI_TEMPERATURE,
            max_tokens=LLMConfig.OPENAI_MAX_TOKENS,
            tools=TOOL_SCHEMAS,
            tool_choice="auto",
        )

        response_message = response.choices[0].message
        
        # Check if the model decided to call a tool natively
        if response_message.tool_calls:
            messages.append(response_message)
            for tool_call in response_message.tool_calls:
                function_name = tool_call.function.name
                if function_name in AVAILABLE_TOOLS:
                    try:
                        args = json.loads(tool_call.function.arguments or "{}")
                        if args is None:
                            args = {}
                    except Exception:
                        args = {}
                    
                    context_for_tool = user_context.copy() if user_context else {}
                    if "auctionId" in args and not context_for_tool.get("auctionId"):
                        context_for_tool["auctionId"] = args["auctionId"]

                    function_response = AVAILABLE_TOOLS[function_name](context_for_tool)
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": function_response,
                    })
                else:
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": '{"error": "Tool not found"}',
                    })
                    
            # Add extra instruction so GLM doesn't output tool_call XML in its final answer
            messages.append({"role": "user", "content": "Now answer the user in plain Markdown. Do NOT output any <tool_call> XML tags."})
            
            # 2nd Call to OpenAI (with tool results) - STREAMING
            stream_response = client.chat.completions.create(
                model=LLMConfig.OPENAI_MODEL,
                messages=messages,
                temperature=LLMConfig.OPENAI_TEMPERATURE,
                max_tokens=LLMConfig.OPENAI_MAX_TOKENS,
                stream=True,
            )
            for chunk in stream_response:
                if chunk.choices[0].delta.content is not None:
                    cleaned = _clean_chunk(chunk.choices[0].delta.content)
                    if cleaned:
                        yield cleaned
        else:
            # Fallback for models that output tool calls as text instead of native tool_calls
            import re
            content = response_message.content or ""

            # Pattern 1: GLM-4.7-Flash format — <tool_call>functionName{"key": "val"}</tool_call> or </arg_value>
            glm_match = re.search(
                r'<tool_call>\s*([a-zA-Z0-9_]+)\s*(\{.*?\})\s*(?:</tool_call>|</arg_value>)',
                content, re.DOTALL
            )

            # Pattern 2: Llama 3 / older format — <function=functionName>
            llama_match = re.search(r'<function=([^>]+)>', content) if not glm_match else None

            matched_function = None
            matched_args = {}
            match_start = 0

            if glm_match:
                matched_function = glm_match.group(1).strip()
                match_start = glm_match.start()
                try:
                    matched_args = json.loads(glm_match.group(2))
                except Exception:
                    matched_args = {}
            elif llama_match:
                matched_function = llama_match.group(1).strip()
                match_start = llama_match.start()

            if matched_function and matched_function in AVAILABLE_TOOLS:
                # Merge any args from the tool call (e.g. auctionId) into user_context
                context_for_tool = user_context.copy() if user_context else {}
                for k, v in matched_args.items():
                    if not context_for_tool.get(k):
                        context_for_tool[k] = v

                function_response = AVAILABLE_TOOLS[matched_function](context_for_tool)

                # Strip out the raw tool_call tag so the model doesn't echo it back
                clean_content = content[:match_start].strip()
                if not clean_content:
                    clean_content = "Let me fetch that for you."

                messages.append({"role": "assistant", "content": clean_content})
                messages.append({"role": "user", "content": f"The tool returned this real data: {function_response}\nNow answer the user based ONLY on this real data. Do NOT output any <tool_call> tags."})

                stream_response = client.chat.completions.create(
                    model=LLMConfig.OPENAI_MODEL,
                    messages=messages,
                    temperature=LLMConfig.OPENAI_TEMPERATURE,
                    max_tokens=LLMConfig.OPENAI_MAX_TOKENS,
                    stream=True,
                )
                for chunk in stream_response:
                    if chunk.choices[0].delta.content is not None:
                        cleaned = _clean_chunk(chunk.choices[0].delta.content)
                        if cleaned:
                            yield cleaned
                return

            yield _clean_chunk(content)

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"OpenAI error: {error_details}")
        yield f"I'm sorry, I am currently unable to process your request. Error details: {e}"


# ─── Ollama Implementation (fallback) ───────────────────────────────────────

def _generate_via_ollama(prompt: str) -> dict:
    url = f"{LLMConfig.OLLAMA_URL}/api/generate"
    payload = {
        "model": LLMConfig.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json",
    }

    try:
        response = requests.post(url, json=payload, timeout=60)
        if response.status_code == 200:
            result = response.json()
            response_text = result.get("response", "{}")
            return _sanitize_response(json.loads(response_text))
        else:
            print(f"Ollama error: {response.text}")
    except Exception as e:
        print(f"Failed to connect to Ollama: {e}")

    return _fallback_response()


# ─── Shared helpers ──────────────────────────────────────────────────────────

def _sanitize_response(parsed: dict) -> dict:
    """Ensure the LLM output conforms to our expected schema."""
    # answer
    answer = parsed.get("answer")
    if not answer or (isinstance(answer, str) and not answer.strip()):
        for alt in ["message", "response", "text", "recommendation"]:
            val = parsed.get(alt)
            if val and str(val).strip():
                answer = val
                break
    if isinstance(answer, list):
        answer = " ".join(str(x) for x in answer)
    if not isinstance(answer, str) or not answer.strip():
        answer = "I'm sorry, I don't have enough information to answer that right now."
    parsed["answer"] = answer

    # string fields
    for field in ("liveDataUsed", "analysis", "recommendation"):
        val = parsed.get(field)
        if isinstance(val, list):
            parsed[field] = " ".join(str(x) for x in val)
        elif val is not None and not isinstance(val, str):
            parsed[field] = str(val)
        elif val is None:
            parsed[field] = ""

    # list field
    if not isinstance(parsed.get("suggestedNextActions"), list):
        parsed["suggestedNextActions"] = []

    return parsed


def _fallback_response() -> dict:
    return {
        "answer": "I'm sorry, I am currently unable to process your request via the local Ollama service. Please check if Ollama is running.",
        "liveDataUsed": "",
        "analysis": "",
        "recommendation": "",
        "suggestedNextActions": [],
    }

