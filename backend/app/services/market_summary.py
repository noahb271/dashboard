from app.services.alpaca import get_snapshot as get_quote
from app.services.fred import get_treasury_yields
from app.services.finnhub import get_news

def generate_research_summary(symbols: list = None):
    """Generate a rule-based market research summary."""
    if symbols is None:
        symbols = ["SPY", "QQQ", "VIX"]  # Default benchmarks
    
    summary = {
        "summary": "",
        "market_tone": "",
        "volatility_risk": "",
        "commodities_rates": "",
        "headlines": "",
        "conclusion": ""
    }
    
    # Get benchmark quotes
    benchmarks = {}
    for symbol in symbols[:3]:  # Limit to 3 for summary
        quote = get_quote(symbol)
        if "error" not in quote:
            benchmarks[symbol] = quote
    
    # Get yields
    yields = get_treasury_yields()
    
    # Get news
    news_data = get_news()
    headlines = []
    if isinstance(news_data, list):
        headlines = [item.get("headline", "") for item in news_data[:5]]
    
    # Build summary sections
    summary["summary"] = "Market overview based on current data."
    
    if benchmarks:
        spy_change = benchmarks.get("SPY", {}).get("change_percent", "N/A")
        summary["market_tone"] = f"SPY is {spy_change}% today."
    else:
        summary["market_tone"] = "Market data unavailable."
    
    vix_quote = benchmarks.get("VIX", {})
    if vix_quote and "error" not in vix_quote:
        vix_value = vix_quote.get("close", "N/A")
        try:
            vix_float = float(vix_value) if vix_value != "N/A" else 0
            summary["volatility_risk"] = f"VIX at {vix_value}, indicating {'high' if vix_float > 20 else 'moderate'} volatility."
        except (ValueError, TypeError):
            summary["volatility_risk"] = f"VIX at {vix_value}, volatility level unknown."
    else:
        summary["volatility_risk"] = "Volatility data unavailable."
    
    if yields:
        ten_year = yields.get("10Y", {}).get("value", "N/A")
        summary["commodities_rates"] = f"10-year Treasury yield at {ten_year}%."
    else:
        summary["commodities_rates"] = "Yield data unavailable."
    
    summary["headlines"] = " | ".join(headlines) if headlines else "No recent headlines."
    summary["conclusion"] = "Monitor key indicators for market direction."
    
    return summary