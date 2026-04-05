from fastapi import APIRouter, HTTPException
from typing import List
from app.services.provider_router import get_quote_routed, get_snapshots_routed

router = APIRouter()

@router.get("/quote")
async def get_single_quote(symbol: str):
    """Get quote for a single symbol."""
    result = get_quote_routed(symbol.upper())
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return result

@router.post("/quotes")
async def get_batch_quotes(symbols: List[str]):
    """Get quotes for multiple symbols efficiently."""
    return get_snapshots_routed([s.upper() for s in symbols])
