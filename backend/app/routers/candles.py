from fastapi import APIRouter, HTTPException
from app.services.provider_router import get_bars_routed

router = APIRouter()

@router.get("/candles")
async def get_candles(symbol: str, interval: str = "1day", limit: int = 30):
    """Get candle/bar data. Accepts Twelve Data-style interval names."""
    result = get_bars_routed(symbol.upper(), interval, limit)
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return result
