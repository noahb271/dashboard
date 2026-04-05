from fastapi import APIRouter, HTTPException
from typing import List
from app.services.alpaca import get_snapshot, get_snapshots

router = APIRouter()

@router.get("/quote")
async def get_single_quote(symbol: str):
    """Get quote for a single symbol."""
    result = get_snapshot(symbol.upper())
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return result

@router.post("/quotes")
async def get_batch_quotes(symbols: List[str]):
    """Get quotes for multiple symbols efficiently."""
    return get_snapshots([s.upper() for s in symbols])
