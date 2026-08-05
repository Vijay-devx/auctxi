"""
Spring Boot Tool Functions — callable by the AI for live data.

URLs are read from config.py (which reads .env).
"""
import requests
from app.config import SpringBootConfig
import json


def _resolve_auction_id(user_context: dict) -> str | None:
    """
    Returns the real auction UUID from context.
    If auctionId in context looks like a name (not a UUID), 
    fetch the user's live data and resolve it from their myAuctions list.
    """
    auction_id = user_context.get("auctionId")
    if not auction_id:
        return None
    
    # UUID format check — if it's already a UUID, return as-is
    import re
    if re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', auction_id, re.IGNORECASE):
        return auction_id
    
    # It looks like a name — resolve it via the user's live data
    user_id = user_context.get("userId")
    role = user_context.get("role", "")
    if role.startswith("ROLE_"):
        role = role[5:]
    
    if not user_id or role.upper() not in ("CLIENT", "MANAGER"):
        return None
    
    headers = {"X-Internal-Token": SpringBootConfig.INTERNAL_TOKEN}
    try:
        url = f"{SpringBootConfig.URL}/api/internal/ai/client-context?userId={user_id}"
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code == 200:
            data = res.json()
            auctions = data.get("myAuctions", [])
            # Case-insensitive match on name
            query = auction_id.lower().strip()
            for a in auctions:
                name = (a.get("name") or "").lower().strip()
                aid = a.get("auctionId")
                if name == query or query in name or name in query:
                    return aid
            # If only one auction, just use that one
            if len(auctions) == 1:
                return auctions[0].get("auctionId")
    except Exception as e:
        print(f"Warning: Could not resolve auction name to ID: {e}")
    
    # Return original as last resort (will 404 if it's wrong, but at least we tried)
    return auction_id


def get_my_live_data(user_context: dict) -> str:
    """
    Fetches the live context for the current user (Client, Manager, or Admin).
    This includes their wallet balance, squad composition, auction status, etc.
    """
    user_id = user_context.get("userId")
    role = user_context.get("role")
    
    # Strip "ROLE_" prefix if it exists (Spring Security uses ROLE_CLIENT)
    if role and role.startswith("ROLE_"):
        role = role[5:]
    
    auction_id = user_context.get("auctionId")
    auction_param = f"&auctionId={auction_id}" if auction_id else ""

    headers = {"X-Internal-Token": SpringBootConfig.INTERNAL_TOKEN}

    try:
        # Determine endpoint based on role
        role_upper = role.upper() if role else ""
        if role_upper == "CLIENT":
            url = f"{SpringBootConfig.URL}/api/internal/ai/client-context?userId={user_id}{auction_param}"
        elif role_upper == "MANAGER":
            url = f"{SpringBootConfig.URL}/api/internal/ai/manager-context?userId={user_id}{auction_param}"
        elif role_upper == "ADMIN":
            url = f"{SpringBootConfig.URL}/api/internal/ai/admin-context?userId={user_id}"
        else:
            return json.dumps({"error": f"Role '{role}' is not supported for fetching live context data."})

        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            context_response = response.json()
        else:
            return json.dumps({"error": f"Failed to fetch data (status {response.status_code})"})
        
        # Also fetch wallet balance from Payment Service for clients
        if role_upper == "CLIENT":
            try:
                payment_service_url = os.getenv("PAYMENT_SERVICE_URL", "http://payment-service:8080")
                wallet_res = requests.get(f"{payment_service_url}/api/v1/payments/wallet/{user_id}")
                if wallet_res.status_code == 200:
                    wallet_data = wallet_res.json()
                    context_response["walletBalance"] = wallet_data.get("balance", 0)
            except Exception as e:
                print(f"Warning: Failed to fetch wallet balance: {e}")

        return json.dumps(context_response)
    
    except requests.exceptions.RequestException as e:
        return json.dumps({"error": f"Failed to connect to backend: {str(e)}"})

def get_recent_bids(user_context: dict) -> str:
    auction_id = _resolve_auction_id(user_context)
    if not auction_id:
        return json.dumps({"error": "No auction is currently active in context. You must provide the 'auctionId' parameter to this tool."})
        
    headers = {"X-Internal-Token": SpringBootConfig.INTERNAL_TOKEN}
    url = f"{SpringBootConfig.URL}/api/internal/ai/auction-bids?auctionId={auction_id}"
          
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            bids = response.json()
            cleaned_bids = []
            for b in bids:
                cleaned_bids.append({
                    "amount": b.get("amount"),
                    "playerName": b.get("playerName"),
                    "time": b.get("createdAt"),
                    "teamName": b.get("team", {}).get("name") if b.get("team") else "Unknown"
                })
            return json.dumps(cleaned_bids)
        return json.dumps({"error": "Failed to fetch bids."})
    except Exception as e:
        return json.dumps({"error": str(e)})

def get_auction_teams(user_context: dict) -> str:
    auction_id = _resolve_auction_id(user_context)
    if not auction_id:
        return json.dumps({"error": "No auction is currently active in context. You must provide the 'auctionId' parameter to this tool."})
    
    headers = {"X-Internal-Token": SpringBootConfig.INTERNAL_TOKEN}
    url = f"{SpringBootConfig.URL}/api/internal/ai/auction-teams?auctionId={auction_id}"
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            teams = response.json()
            cleaned_teams = []
            for t in teams:
                cleaned_teams.append({
                    "teamName": t.get("name"),
                    "owner": t.get("owner", {}).get("name"),
                    "totalBudget": t.get("totalBudget"),
                    "remainingPurse": t.get("remainingPurse")
                })
            return json.dumps(cleaned_teams)
        return json.dumps({"error": "Failed to fetch teams."})
    except Exception as e:
        return json.dumps({"error": str(e)})

def get_auction_players(user_context: dict) -> str:
    auction_id = _resolve_auction_id(user_context)
    if not auction_id:
        return json.dumps({"error": "No auction is currently active in context. You must provide the 'auctionId' parameter to this tool."})
    
    headers = {"X-Internal-Token": SpringBootConfig.INTERNAL_TOKEN}
    url = f"{SpringBootConfig.URL}/api/internal/ai/auction-players?auctionId={auction_id}"
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            players = response.json()
            cleaned_players = []
            for p in players:
                cleaned_players.append({
                    "name": p.get("name"),
                    "role": p.get("role"),
                    "basePrice": p.get("basePrice"),
                    "soldStatus": p.get("soldStatus"),
                    "soldPrice": p.get("soldPrice"),
                    "winningTeam": p.get("winningTeamName")
                })
            return json.dumps(cleaned_players)
        return json.dumps({"error": f"Failed to fetch players (status {response.status_code})."})
    except Exception as e:
        return json.dumps({"error": str(e)})

# Map of available tools for the LLM
AVAILABLE_TOOLS = {
    "get_my_live_data": get_my_live_data,
    "get_recent_bids": get_recent_bids,
    "get_auction_teams": get_auction_teams,
    "get_auction_players": get_auction_players
}

# JSON Schema definitions for Groq tool calling
TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_my_live_data",
            "description": "Fetch real-time platform data for the current user. Call this if the user asks about their own data, their wallet, their budget, their squad, or the auctions they are part of.",
            "parameters": { "type": "object", "properties": {}, "required": [] }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_recent_bids",
            "description": "Fetch the recent bidding history for the currently active player on the auction block. Call this if the user asks for recent bids, the current bid, or who is winning the current player.",
            "parameters": { 
                "type": "object", 
                "properties": {
                    "auctionId": { "type": "string", "description": "Optional. The ID of the auction to query, if known." }
                }, 
                "required": [] 
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_auction_teams",
            "description": "Fetch the list of all teams participating in the current auction, including their owners and remaining budgets. Call this if the user asks about teams, opponents, or team budgets.",
            "parameters": { 
                "type": "object", 
                "properties": {
                    "auctionId": { "type": "string", "description": "Optional. The ID of the auction to query, if known." }
                }, 
                "required": [] 
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_auction_players",
            "description": "Fetch the list of all players in the current auction, including their base prices and sold/unsold statuses. Call this if the user asks about available players, sold players, or player statuses.",
            "parameters": { 
                "type": "object", 
                "properties": {
                    "auctionId": { "type": "string", "description": "Optional. The ID of the auction to query, if known." }
                }, 
                "required": [] 
            }
        }
    }
]
