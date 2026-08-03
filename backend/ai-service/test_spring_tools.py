import os
import sys
sys.path.append('C:\\Users\\Vijay\\Desktop\\MyProjects\\Auctxi_give\\Auctxi_give\\backend\\ai-service')
from dotenv import load_dotenv
load_dotenv('C:\\Users\\Vijay\\Desktop\\MyProjects\\Auctxi_give\\Auctxi_give\\backend\\ai-service\\.env')
from app.tools.spring_tools import get_my_live_data

try:
    print(get_my_live_data({"userId": "1", "role": "CLIENT"}))
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"\nCRASH: {e}")
