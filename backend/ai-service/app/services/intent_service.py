def detect_intent(message: str) -> str:
    """
    Very basic intent detection heuristics for Phase 1.
    Categories: KNOWLEDGE, LIVE_DATA, STRATEGY
    """
    msg = message.lower()
    
    # Strategy triggers
    if any(word in msg for word in ["should i bid", "recommend", "suggest", "good value", "overpriced", "balanced"]):
        return "STRATEGY"
    
    # Live Data triggers
    if any(word in msg for word in ["my purse", "my team", "remaining slots", "current bid", "who is on block"]):
        return "LIVE_DATA"
        
    # Default to Knowledge for rules
    if any(word in msg for word in ["how does", "what is", "explain", "rules", "purse system"]):
        return "KNOWLEDGE"
        
    # Default to STRATEGY for a robust response if unclear
    return "STRATEGY"
