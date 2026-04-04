import requests
from app.config import config

BASE_URL = "https://finnhub.io/api/v1"

def get_news(category: str = "general", min_id: int = 0):
    """Fetch recent news headlines."""
    if not config.FINNHUB_KEY:
        return {"error": "Finnhub API key not configured"}
    
    try:
        response = requests.get(f"{BASE_URL}/news", params={
            "category": category,
            "token": config.FINNHUB_KEY,
            "minId": min_id
        }, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {"error": f"Failed to fetch news: {str(e)}"}