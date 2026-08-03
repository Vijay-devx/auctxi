import os
import sys
import json
sys.path.append('C:\\Users\\Vijay\\Desktop\\MyProjects\\Auctxi_give\\Auctxi_give\\backend\\ai-service')
from dotenv import load_dotenv
load_dotenv('C:\\Users\\Vijay\\Desktop\\MyProjects\\Auctxi_give\\Auctxi_give\\backend\\ai-service\\.env')
from app.services.memory_service import _get_redis

r = _get_redis()
if r:
    keys = r.keys("auctxi:chat:*")
    for k in keys:
        print(f"Key: {k}")
        messages = r.lrange(k, 0, -1)
        for msg in messages:
            print("  ", msg)
else:
    print("Redis not available")
