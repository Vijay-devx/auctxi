import os
import sys
sys.path.append('C:\\Users\\Vijay\\Desktop\\MyProjects\\Auctxi_give\\Auctxi_give\\backend\\ai-service')
from dotenv import load_dotenv
load_dotenv('C:\\Users\\Vijay\\Desktop\\MyProjects\\Auctxi_give\\Auctxi_give\\backend\\ai-service\\.env')
from app.services.llm_client import _get_groq_client, LLMConfig

client = _get_groq_client()
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "assistant", "content": "Let me fetch that for you."},
    {"role": "user", "content": "The tool actually returned this real data: {\"error\": \"Failed to fetch data (status 404)\"}\nNow answer the user based ONLY on this real data."}
]

response = client.chat.completions.create(
    model=LLMConfig.GROQ_MODEL,
    messages=messages,
    temperature=LLMConfig.GROQ_TEMPERATURE,
    max_tokens=LLMConfig.GROQ_MAX_TOKENS,
)
print("LLM RESPONSE:")
print(response.choices[0].message.content)
