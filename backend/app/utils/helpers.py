# Utility helpers for the backend

def safe_float(value, default=0.0):
    """Safely convert to float with default."""
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

def format_currency(value):
    """Format value as currency string."""
    try:
        return f"${float(value):,.2f}"
    except (ValueError, TypeError):
        return "N/A"