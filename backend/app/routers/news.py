from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import time

from app.services.finnhub import get_news

router = APIRouter()

@router.get("/news")
async def get_market_news(category: Optional[str] = Query("general", description="News category")):
    """Get recent market news."""
    try:
        result = get_news(category)
        # Ensure we return an array even if API fails
        if isinstance(result, list):
            return result
        else:
            # Return fallback news on error
            return [
                {
                    "source": "Dashboard",
                    "headline": "Market data temporarily unavailable",
                    "datetime": int(time.time()),
                    "category": "general"
                }
            ]
    except Exception as e:
        return [
            {
                "source": "Dashboard", 
                "headline": "News service temporarily unavailable",
                "datetime": int(time.time()),
                "category": "general"
            }
        ]