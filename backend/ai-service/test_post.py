import requests
import json

url = "http://localhost:5003/api/v1/ai/chat"
payload = {"message": "what is my wallet balance?", "auctionId": "test"}
headers = {"X-User-Id": "123", "X-User-Roles": "ROLE_CLIENT"}
response = requests.post(url, json=payload, headers=headers, stream=True)
for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))
