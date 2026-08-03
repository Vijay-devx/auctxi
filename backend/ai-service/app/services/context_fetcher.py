"""
Context Fetcher — pulls live data from Spring Boot internal APIs.

URLs and tokens are read from config.py (which reads .env).
"""
import requests
from app.config import SpringBootConfig


def fetch_context(user_id: str, role: str, auction_id: str = None) -> dict:
    """Fetch role-appropriate live context from the Spring Boot backend."""
    headers = {"X-Internal-Token": SpringBootConfig.INTERNAL_TOKEN}

    try:
        if role.upper() == "CLIENT":
            url = (
                f"{SpringBootConfig.URL}/api/internal/ai/client-context"
                f"?userId={user_id}&auctionId={auction_id}"
            )
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                return response.json()

        elif role.upper() == "MANAGER":
            url = (
                f"{SpringBootConfig.URL}/api/internal/ai/manager-context"
                f"?userId={user_id}&auctionId={auction_id}"
            )
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                return response.json()

        elif role.upper() == "ADMIN":
            url = f"{SpringBootConfig.URL}/api/internal/ai/admin-context?userId={user_id}"
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                return response.json()

    except Exception as e:
        print(f"Failed to fetch live context: {e}")

    return {}
