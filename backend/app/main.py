from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import quotes, candles, news, yields, research

app = FastAPI(title="Finance Dashboard Backend", version="1.0.0")

allowed_origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5501",
    "http://127.0.0.1:5501",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quotes.router, prefix="/api", tags=["quotes"])
app.include_router(candles.router, prefix="/api", tags=["candles"])
app.include_router(news.router, prefix="/api", tags=["news"])
app.include_router(yields.router, prefix="/api", tags=["yields"])
app.include_router(research.router, prefix="/api", tags=["research"])

@app.get("/")
async def root():
    return {"message": "Finance Dashboard Backend API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}