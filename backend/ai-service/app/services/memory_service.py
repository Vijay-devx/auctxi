"""
Chat Memory Service — Redis-backed conversational history with in-memory fallback.

Stores per-user chat history so the AI remembers previous messages
within a session. History auto-expires based on REDIS_CHAT_HISTORY_TTL.

If Redis is unavailable, falls back to a simple in-memory dict so
the application still works during development without Docker.
"""
import json
import time
from collections import defaultdict
from app.config import RedisConfig

# ─── Redis connection (lazy singleton) ───────────────────────────────────────
_redis_client = None
_use_redis = True  # will flip to False if connection fails

# ─── In-memory fallback ─────────────────────────────────────────────────────
_memory_store: dict = defaultdict(list)
_memory_timestamps: dict = {}


def _get_redis():
    global _redis_client, _use_redis
    if _redis_client is None:
        try:
            import redis
            _redis_client = redis.Redis(
                host=RedisConfig.HOST,
                port=RedisConfig.PORT,
                db=RedisConfig.DB,
                decode_responses=True,
                socket_connect_timeout=2,
            )
            _redis_client.ping()
            print("Connected to Redis for chat memory.")
        except Exception as e:
            print(f"Redis unavailable ({e}). Using in-memory fallback for chat history.")
            _use_redis = False
            _redis_client = None
    return _redis_client


def _chat_key(user_id: str) -> str:
    """Redis key for a user's chat history."""
    return f"auctxi:chat:{user_id}"


# ─── Public API ──────────────────────────────────────────────────────────────

def get_chat_history(user_id: str, max_turns: int = 10) -> list:
    """
    Retrieve the last `max_turns` messages for a user.
    Returns a list of {"role": "user"|"assistant", "content": "..."} dicts.
    """
    if _use_redis:
        try:
            r = _get_redis()
            if r:
                key = _chat_key(user_id)
                raw_messages = r.lrange(key, -max_turns * 2, -1)
                return [json.loads(msg) for msg in raw_messages]
        except Exception as e:
            print(f"Redis read error (non-fatal): {e}")

    # In-memory fallback
    _cleanup_expired(user_id)
    messages = _memory_store.get(user_id, [])
    return messages[-max_turns * 2:]


def save_message(user_id: str, role: str, content: str):
    """
    Append a message to the user's chat history.
    """
    message_dict = {"role": role, "content": content}

    if _use_redis:
        try:
            r = _get_redis()
            if r:
                key = _chat_key(user_id)
                r.rpush(key, json.dumps(message_dict))
                r.expire(key, RedisConfig.CHAT_HISTORY_TTL)
                return
        except Exception as e:
            print(f"Redis write error (non-fatal): {e}")

    # In-memory fallback
    _memory_store[user_id].append(message_dict)
    _memory_timestamps[user_id] = time.time()


def clear_chat_history(user_id: str):
    """Clear all chat history for a user."""
    if _use_redis:
        try:
            r = _get_redis()
            if r:
                r.delete(_chat_key(user_id))
                return
        except Exception as e:
            print(f"Redis delete error (non-fatal): {e}")

    # In-memory fallback
    _memory_store.pop(user_id, None)
    _memory_timestamps.pop(user_id, None)


def _cleanup_expired(user_id: str):
    """Remove expired in-memory chat history."""
    ts = _memory_timestamps.get(user_id)
    if ts and (time.time() - ts) > RedisConfig.CHAT_HISTORY_TTL:
        _memory_store.pop(user_id, None)
        _memory_timestamps.pop(user_id, None)
