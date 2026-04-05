import requests
import time
from app.config import config

# Alpaca market data lives at a separate URL from the trading API
DATA_URL = "https://data.alpaca.markets"

# In-memory cache (same pattern as twelve_data.py)
_cache = {}
QUOTE_CACHE_DURATION = 30   # seconds
CANDLE_CACHE_DURATION = 60  # seconds


def _headers():
    return {
        "APCA-API-KEY-ID": config.ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": config.ALPACA_SECRET_KEY,
    }


def _is_cache_valid(entry: dict, duration: int) -> bool:
    return time.time() - entry["timestamp"] < duration


def _normalize_snapshot(symbol: str, snap: dict) -> dict:
    """Convert an Alpaca snapshot payload to the frontend-compatible shape."""
    daily = snap.get("dailyBar") or {}
    prev = snap.get("prevDailyBar") or {}
    latest_trade = snap.get("latestTrade") or {}

    # Prefer last trade price; fall back to daily close
    close = latest_trade.get("p") or daily.get("c")
    prev_close = prev.get("c")

    change_pct = 0.0
    if close and prev_close and prev_close != 0:
        change_pct = round((close - prev_close) / prev_close * 100, 4)

    return {
        "symbol": symbol,
        "close": close,
        "price": close,
        "change_percent": change_pct,
        "percent_change": change_pct,
    }


def get_snapshot(symbol: str) -> dict:
    """Single-symbol snapshot with caching. Returns normalized quote dict."""
    if not config.ALPACA_API_KEY:
        return {"error": "Alpaca API key not configured"}

    cache_key = f"snapshot:{symbol}"
    if cache_key in _cache and _is_cache_valid(_cache[cache_key], QUOTE_CACHE_DURATION):
        return _cache[cache_key]["data"]

    try:
        resp = requests.get(
            f"{DATA_URL}/v2/stocks/{symbol}/snapshot",
            headers=_headers(),
            timeout=10,
        )
        resp.raise_for_status()
        normalized = _normalize_snapshot(symbol, resp.json())
        _cache[cache_key] = {"data": normalized, "timestamp": time.time()}
        return normalized
    except requests.RequestException as e:
        return {"error": f"Alpaca snapshot failed for {symbol}: {str(e)}"}


def get_snapshots(symbols: list) -> dict:
    """
    Batch snapshot fetch. Serves cached symbols without a network call,
    fetches the rest in a single request. Falls back to per-symbol calls
    if the batch request fails.
    Returns {SYMBOL: normalized_quote_dict, ...}
    """
    if not config.ALPACA_API_KEY:
        return {s: {"error": "Alpaca API key not configured"} for s in symbols}

    results = {}
    to_fetch = []

    for symbol in symbols:
        cache_key = f"snapshot:{symbol}"
        if cache_key in _cache and _is_cache_valid(_cache[cache_key], QUOTE_CACHE_DURATION):
            results[symbol] = _cache[cache_key]["data"]
        else:
            to_fetch.append(symbol)

    if not to_fetch:
        return results

    try:
        resp = requests.get(
            f"{DATA_URL}/v2/stocks/snapshots",
            headers=_headers(),
            params={"symbols": ",".join(to_fetch)},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()

        for symbol in to_fetch:
            snap = data.get(symbol)
            if not snap:
                # Symbol not found (e.g. VIX index) — mark as error so caller can fall back
                results[symbol] = {"error": f"No snapshot data for {symbol}"}
                continue
            normalized = _normalize_snapshot(symbol, snap)
            cache_key = f"snapshot:{symbol}"
            _cache[cache_key] = {"data": normalized, "timestamp": time.time()}
            results[symbol] = normalized

    except requests.RequestException:
        # Batch failed — fall back to individual fetches for uncached symbols
        for symbol in to_fetch:
            results[symbol] = get_snapshot(symbol)

    return results


def get_crypto_snapshots(symbols: list) -> dict:
    """
    Fetch snapshots for crypto pairs (e.g. BTC/USD) using Alpaca's crypto endpoint.
    Response shape is identical to stock snapshots so _normalize_snapshot reuses as-is.
    Returns {SYMBOL: normalized_quote_dict, ...}
    """
    if not config.ALPACA_API_KEY:
        return {s: {"error": "Alpaca API key not configured"} for s in symbols}

    results = {}
    to_fetch = []

    for symbol in symbols:
        cache_key = f"crypto:{symbol}"
        if cache_key in _cache and _is_cache_valid(_cache[cache_key], QUOTE_CACHE_DURATION):
            results[symbol] = _cache[cache_key]["data"]
        else:
            to_fetch.append(symbol)

    if not to_fetch:
        return results

    try:
        resp = requests.get(
            f"{DATA_URL}/v1beta3/crypto/us/snapshots",
            headers=_headers(),
            params={"symbols": ",".join(to_fetch)},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json().get("snapshots") or {}

        for symbol in to_fetch:
            snap = data.get(symbol)
            if not snap:
                results[symbol] = {"error": f"No crypto data for {symbol}"}
                continue
            normalized = _normalize_snapshot(symbol, snap)
            cache_key = f"crypto:{symbol}"
            _cache[cache_key] = {"data": normalized, "timestamp": time.time()}
            results[symbol] = normalized

    except requests.RequestException as e:
        for symbol in to_fetch:
            results[symbol] = {"error": f"Alpaca crypto failed: {str(e)}"}

    return results


def get_bars(symbol: str, timeframe: str = "1Day", limit: int = 30) -> dict:
    """
    Fetch daily (or other timeframe) bars for a symbol.
    Returns {"values": [{close, datetime}, ...]} with bars in NEWEST-FIRST order
    to match the Twelve Data shape the frontend already handles.
    """
    if not config.ALPACA_API_KEY:
        return {"error": "Alpaca API key not configured"}

    cache_key = f"bars:{symbol}:{timeframe}:{limit}"
    if cache_key in _cache and _is_cache_valid(_cache[cache_key], CANDLE_CACHE_DURATION):
        return _cache[cache_key]["data"]

    try:
        resp = requests.get(
            f"{DATA_URL}/v2/stocks/{symbol}/bars",
            headers=_headers(),
            params={
                "timeframe": timeframe,
                "limit": limit,
                "adjustment": "raw",
            },
            timeout=10,
        )
        resp.raise_for_status()
        bars = resp.json().get("bars") or []

        # Alpaca returns bars oldest-first; reverse to newest-first so the frontend
        # .reverse() call produces the correct oldest-first chart order.
        values = [
            {"close": b["c"], "datetime": b["t"][:10]}
            for b in reversed(bars)
        ]

        result = {"values": values}
        _cache[cache_key] = {"data": result, "timestamp": time.time()}
        return result
    except requests.RequestException as e:
        return {"error": f"Alpaca bars failed for {symbol}: {str(e)}"}
