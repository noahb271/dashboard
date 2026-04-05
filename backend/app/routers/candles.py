from fastapi import APIRouter, HTTPException
from app.services.alpaca import get_bars

router = APIRouter()

# Map Twelve Data interval names to Alpaca timeframe strings
_INTERVAL_MAP = {
    "1day": "1Day",
    "1week": "1Week",
    "1month": "1Month",
    "1hour": "1Hour",
    "4hour": "4Hour",
}

@router.get("/candles")
async def get_candles(symbol: str, interval: str = "1day", limit: int = 30):
    """Get candle/bar data. Accepts Twelve Data-style interval names."""
    timeframe = _INTERVAL_MAP.get(interval.lower(), "1Day")
    result = get_bars(symbol.upper(), timeframe, limit)
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return result
