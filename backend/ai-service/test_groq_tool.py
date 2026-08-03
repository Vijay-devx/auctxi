import os
import sys
sys.path.append('C:\\Users\\Vijay\\Desktop\\MyProjects\\Auctxi_give\\Auctxi_give\\backend\\ai-service')
from dotenv import load_dotenv
load_dotenv('C:\\Users\\Vijay\\Desktop\\MyProjects\\Auctxi_give\\Auctxi_give\\backend\\ai-service\\.env')
from app.services.llm_client import _get_groq_client, LLMConfig
from app.tools.spring_tools import TOOL_SCHEMAS

user_context = {"userId": "123", "role": "CLIENT"}

client = _get_groq_client()
messages = [{"role": "system", "content": "You are a helpful assistant."}]
messages.append({"role": "user", "content": "what is my wallet balance?"})

try:
    response = client.chat.completions.create(
        model=LLMConfig.GROQ_MODEL,
        messages=messages,
        temperature=LLMConfig.GROQ_TEMPERATURE,
        max_tokens=LLMConfig.GROQ_MAX_TOKENS,
        tools=TOOL_SCHEMAS,
        tool_choice="auto",
    )
    response_message = response.choices[0].message
    print("Appending response_message of type:", type(response_message))
    messages.append(response_message)
    
    # Simulate tool response
    messages.append({
        "tool_call_id": response_message.tool_calls[0].id,
        "role": "tool",
        "name": response_message.tool_calls[0].function.name,
        "content": '{"walletBalance": 1000}',
    })

    print("Making 2nd API call...")
    stream_response = client.chat.completions.create(
        model=LLMConfig.GROQ_MODEL,
        messages=messages,
        temperature=LLMConfig.GROQ_TEMPERATURE,
        max_tokens=LLMConfig.GROQ_MAX_TOKENS,
        stream=True,
    )
    for chunk in stream_response:
        if chunk.choices[0].delta.content is not None:
            print(chunk.choices[0].delta.content, end="")
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"\nCRASH: {e}")
