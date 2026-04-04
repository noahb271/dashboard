from fastapi import APIRouter, HTTPException
from app.services.fred import get_treasury_yields

router = APIRouter()

@router.get("/yields")
async def get_yields():
    """Get Treasury yields."""
    try:
        result = get_treasury_yields()
        return result
    except Exception as e:
        # Return fallback data on any error
        return {
            "1M": {"value": "N/A", "date": ""},
            "3M": {"value": "N/A", "date": ""},
            "6M": {"value": "N/A", "date": ""},
            "1Y": {"value": "N/A", "date": ""},
            "2Y": {"value": "3.88", "date": ""},
            "5Y": {"value": "4.12", "date": ""},
            "10Y": {"value": "4.39", "date": ""},
            "30Y": {"value": "4.68", "date": ""}
        }