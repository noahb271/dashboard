import requests
import time
from app.config import config

BASE_URL = "https://api.twelvedata.com"

# Simple in-memory cache
_cache = {}
QUOTE_CACHE_DURATION = 30  # seconds
CANDLE_CACHE_DURATION = 60  # seconds

def _get_cache_key(endpoint: str, params: dict) -> str:
    """Generate cache key from endpoint and params."""
    param_str = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
    return f"{endpoint}?{param_str}"

def _is_cache_valid(cache_entry: dict, duration: int) -> bool:
    """Check if cache entry is still valid."""
    return time.time() - cache_entry['timestamp'] < duration

def _get_cached_or_fetch(url: str, params: dict, cache_duration: int):
    """Get from cache or fetch and cache."""
    cache_key = _get_cache_key(url, params)
    
    # Check cache
    if cache_key in _cache and _is_cache_valid(_cache[cache_key], cache_duration):
        return _cache[cache_key]['data']
    
    # Fetch from API
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Cache the result
        _cache[cache_key] = {
            'data': data,
            'timestamp': time.time()
        }
        
        return data
    except requests.RequestException as e:
        return {"error": f"Failed to fetch: {str(e)}"}

def get_quote(symbol: str):
    """Fetch quote data for a single symbol with caching."""
    if not config.TD_KEY:
        return {"error": "Twelve Data API key not configured"}
    
    params = {
        "symbol": symbol,
        "apikey": config.TD_KEY
    }
    
    result = _get_cached_or_fetch(f"{BASE_URL}/quote", params, QUOTE_CACHE_DURATION)
    return result

def get_time_series(symbol: str, interval: str = "1day", outputsize: int = 30):
    """Fetch time series/candle data with caching."""
    if not config.TD_KEY:
        return {"error": "Twelve Data API key not configured"}
    
    params = {
        "symbol": symbol,
        "interval": interval,
        "outputsize": outputsize,
        "apikey": config.TD_KEY
    }
    
    result = _get_cached_or_fetch(f"{BASE_URL}/time_series", params, CANDLE_CACHE_DURATION)
    return result