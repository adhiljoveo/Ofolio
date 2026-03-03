from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import health, tokens, transactions, nfts, portfolio, defi

app = FastAPI(
    title="OFolio API",
    description="DeFi portfolio dashboard backend",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

settings = get_settings()
origins = settings.cors_origin_list
if any("localhost" in o for o in origins):
    for port in range(3000, 3010):
        candidate = f"http://localhost:{port}"
        if candidate not in origins:
            origins.append(candidate)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(portfolio.router, prefix="/api")
app.include_router(tokens.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(nfts.router, prefix="/api")
app.include_router(defi.router, prefix="/api")


@app.get("/")
async def root():
    return {"name": "OFolio API", "version": "2.0.0", "docs": "/docs"}
