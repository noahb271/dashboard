import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    FRED_KEY = os.getenv("FRED_KEY", "")
    TD_KEY = os.getenv("TD_KEY", "")
    FINNHUB_KEY = os.getenv("FINNHUB_KEY", "")
    ALPACA_API_KEY = os.getenv("ALPACA_API_KEY", "")
    ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY", "")
    ALPACA_BASE_URL = os.getenv("ALPACA_BASE_URL", "https://paper-api.alpaca.markets")

# Global config instance
config = Config()