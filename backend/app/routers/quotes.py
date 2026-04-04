from fastapi import APIRouter, HTTPException
from typing import List
from app.services.twelve_data import get_quote

router = APIRouter()

@router.get("/quote")
async def get_single_quote(symbol: str):
    """Get quote for a single symbol."""
    result = get_quote(symbol.upper())
    # Normalize error responses
    if isinstance(result, dict) and ("error" in result or "code" in result):
        raise HTTPException(status_code=503, detail=result.get("error") or result.get("message") or "Service temporarily unavailable")
    return result

@router.post("/quotes")
async def get_batch_quotes(symbols: List[str]):
    """Get quotes for multiple symbols efficiently."""
    results = {}
    for symbol in symbols:
        result = get_quote(symbol.upper())
        # Normalize error responses for frontend compatibility
        if isinstance(result, dict) and ("error" in result or "code" in result):
            results[symbol] = {"error": result.get("error") or result.get("message") or "API error"}
        else:
            results[symbol] = result
    return results