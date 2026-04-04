import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    FRED_KEY = os.getenv("FRED_KEY", "")
    TD_KEY = os.getenv("TD_KEY", "")
    FINNHUB_KEY = os.getenv("FINNHUB_KEY", "")

# Global config instance
config = Config()