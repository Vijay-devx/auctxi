import os
import sys
sys.path.append('C:\\Users\\Vijay\\Desktop\\MyProjects\\Auctxi_give\\Auctxi_give\\backend\\ai-service')
from dotenv import load_dotenv
load_dotenv('C:\\Users\\Vijay\\Desktop\\MyProjects\\Auctxi_give\\Auctxi_give\\backend\\ai-service\\.env')
from app.config import LLMConfig

print(f"LLM_PROVIDER string: '{LLMConfig.PROVIDER}'")
print(f"Length: {len(LLMConfig.PROVIDER)}")
