from fastapi import APIRouter, HTTPException
from app.services.twelve_data import get_time_series

router = APIRouter()

@router.get("/candles")
async def get_candles(symbol: str, interval: str = "1day", limit: int = 30):
    """Get candle/time series data."""
    result = get_time_series(symbol.upper(), interval, limit)
    # Normalize error responses
    if isinstance(result, dict) and ("error" in result or "code" in result):
        raise HTTPException(status_code=503, detail=result.get("error") or result.get("message") or "Service temporarily unavailable")
    return result