"""
Provider routing layer.

Alpaca is the default provider for stocks and ETFs.
Symbols in TD_SYMBOLS are routed to Twelve Data instead
(e.g. indices like VIX that Alpaca does not serve).

To add a new TD-only symbol, add its ticker to TD_SYMBOLS.
"""

from app.services import alpaca, twelve_data

# Symbols Alpaca cannot serve — routed to Twelve Data
TD_SYMBOLS = {"VIX", "XAU/USD", "XAG/USD", "USOIL"}

# Crypto pairs — routed to Alpaca's crypto endpoint instead of stocks endpoint
CRYPTO_SYMBOLS = {"BTC/USD", "ETH/USD", "XRP/USD"}

# Interval name map shared by both routed candle and bar calls
_ALPACA_INTERVAL_MAP = {
    "1day":   "1Day",
    "1week":  "1Week",
    "1month": "1Month",
    "1hour":  "1Hour",
    "4hour":  "4Hour",
}


def _normalize_td_quote(result: dict) -> dict:
    """
    Normalize a Twelve Data quote dict to the same numeric shape
    that alpaca.get_snapshot() already returns, so the frontend
    sees a consistent response regardless of provider.
    """
    def _float(val, default=None):
        try:
            return float(val) if val is not None else default
        except (ValueError, TypeError):
            return default

    close = _float(result.get("close"))
    change_pct = _float(result.get("change_percent"), default=0.0)
    return {
        "symbol": result.get("symbol", ""),
        "close": close,
        "price": close,
        "change_percent": change_pct,
        "percent_change": change_pct,
    }


def get_quote_routed(symbol: str) -> dict:
    """Return a normalized quote for any symbol, using the correct provider."""
    if symbol in TD_SYMBOLS:
        result = twelve_data.get_quote(symbol)
        if isinstance(result, dict) and "error" not in result:
            return _normalize_td_quote(result)
        return result
    if symbol in CRYPTO_SYMBOLS:
        result = alpaca.get_crypto_snapshots([symbol])
        return result.get(symbol, {"error": f"No data for {symbol}"})
    return alpaca.get_snapshot(symbol)


def get_snapshots_routed(symbols: list) -> dict:
    """
    Batch quote fetch. Routes each symbol to the correct provider:
    - TD_SYMBOLS → Twelve Data (individual calls)
    - CRYPTO_SYMBOLS → Alpaca crypto batch endpoint
    - Everything else → Alpaca stock batch endpoint
    """
    td_syms     = [s for s in symbols if s in TD_SYMBOLS]
    crypto_syms = [s for s in symbols if s in CRYPTO_SYMBOLS]
    alpaca_syms = [s for s in symbols if s not in TD_SYMBOLS and s not in CRYPTO_SYMBOLS]

    results = {}

    if alpaca_syms:
        results.update(alpaca.get_snapshots(alpaca_syms))

    if crypto_syms:
        results.update(alpaca.get_crypto_snapshots(crypto_syms))

    for symbol in td_syms:
        result = twelve_data.get_quote(symbol)
        if isinstance(result, dict) and "error" not in result:
            results[symbol] = _normalize_td_quote(result)
        else:
            results[symbol] = result

    return results


def get_bars_routed(symbol: str, interval: str = "1day", limit: int = 30) -> dict:
    """
    Return candle/bar data for any symbol, using the correct provider.
    Accepts Twelve Data-style interval names (e.g. "1day") for both paths.
    TD time_series already returns {values: [{close, datetime}]} newest-first,
    which is the shape the frontend expects.
    """
    if symbol in TD_SYMBOLS:
        # TD accepts the interval name directly
        return twelve_data.get_time_series(symbol, interval, limit)

    timeframe = _ALPACA_INTERVAL_MAP.get(interval.lower(), "1Day")
    return alpaca.get_bars(symbol, timeframe, limit)
