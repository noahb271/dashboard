from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.services.market_summary import generate_research_summary

class ResearchRequest(BaseModel):
    symbols: Optional[List[str]] = None

router = APIRouter()

@router.post("/research-summary")
async def get_research_summary(request: ResearchRequest):
    """Generate market research summary."""
    try:
        symbols = request.symbols or ["SPY", "QQQ", "VIX"]
        result = generate_research_summary(symbols)
        # Ensure we always return a valid response
        if not isinstance(result, dict):
            result = {
                "summary": "Market analysis temporarily unavailable.",
                "market_tone": "Data loading...",
                "volatility_risk": "Data loading...",
                "commodities_rates": "Data loading...",
                "headlines": "Data loading...",
                "conclusion": "Please try again in a moment."
            }
        return result
    except Exception as e:
        # Return fallback response on any error
        return {
            "summary": "Market analysis temporarily unavailable due to technical issues.",
            "market_tone": "Unable to load market data.",
            "volatility_risk": "Unable to load volatility data.",
            "commodities_rates": "Unable to load rates data.",
            "headlines": "Unable to load news data.",
            "conclusion": "Please refresh the page or try again later."
        }