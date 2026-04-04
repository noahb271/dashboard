# Finance Dashboard Backend

This is the Python FastAPI backend for the finance dashboard. It provides API endpoints for market data, news, and research summaries.

## Setup

1. **Create a virtual environment:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your real API keys
   ```

4. **Run the backend:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
   ```

The backend will be available at `http://localhost:8001`.

## API Endpoints

- `GET /` - Health check
- `GET /health` - Health status
- `GET /api/quote?symbol=SPY` - Single quote
- `POST /api/quotes` - Batch quotes (body: `{"symbols": ["SPY", "QQQ"]}`)
- `GET /api/candles?symbol=SPY&interval=1day&limit=30` - Time series data
- `GET /api/news?category=general` - Market news
- `GET /api/yields` - Treasury yields
- `POST /api/research-summary` - Generate research summary (body: `{"symbols": ["SPY"]}`)

## Development

- Frontend runs on `http://localhost:8000`
- Backend runs on `http://localhost:8001`
- CORS is configured for local development
- API keys are loaded from `.env` file