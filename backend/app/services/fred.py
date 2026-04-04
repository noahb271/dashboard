import requests
from app.config import config

BASE_URL = "https://api.stlouisfed.org/fred"

def get_series_observations(series_id: str, limit: int = 10):
    """Fetch FRED series observations."""
    if not config.FRED_KEY:
        return {"error": "FRED API key not configured"}
    
    try:
        response = requests.get(f"{BASE_URL}/series/observations", params={
            "series_id": series_id,
            "api_key": config.FRED_KEY,
            "sort_order": "desc",
            "file_type": "json",
            "limit": limit
        }, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {"error": f"Failed to fetch FRED data: {str(e)}"}

def get_treasury_yields():
    """Fetch major Treasury yields."""
    series_ids = {
        "1M": "DGS1MO",
        "3M": "DGS3MO", 
        "6M": "DGS6MO",
        "1Y": "DGS1",
        "2Y": "DGS2",
        "5Y": "DGS5",
        "10Y": "DGS10",
        "30Y": "DGS30"
    }
    
    yields = {}
    for term, series_id in series_ids.items():
        data = get_series_observations(series_id, limit=1)
        if "observations" in data and data["observations"]:
            latest = data["observations"][0]
            yields[term] = {
                "value": latest.get("value", "N/A"),
                "date": latest.get("date", "")
            }
        else:
            yields[term] = {"value": "N/A", "date": ""}
    
    return yields