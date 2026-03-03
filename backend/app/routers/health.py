import time
import httpx
from fastapi import APIRouter
from app.config import get_settings
from app.models.schemas import HealthResponse, HealthProvider

router = APIRouter(tags=["health"])


async def _check_provider(name: str, url: str, **kwargs) -> HealthProvider:
    start = time.monotonic()
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(url, **kwargs)
        latency = round((time.monotonic() - start) * 1000, 1)
        status = "ok" if resp.status_code < 400 else f"http_{resp.status_code}"
    except Exception as e:
        latency = round((time.monotonic() - start) * 1000, 1)
        status = f"error: {type(e).__name__}"
    return HealthProvider(name=name, status=status, latency_ms=latency)


@router.get("/health", response_model=HealthResponse)
async def health():
    settings = get_settings()
    providers = []

    # Alchemy
    if settings.alchemy_api_key:
        url = f"https://eth-mainnet.g.alchemy.com/v2/{settings.alchemy_api_key}"
        providers.append(await _check_provider("alchemy", url))
    else:
        providers.append(HealthProvider(name="alchemy", status="not_configured"))

    # CoinGecko
    providers.append(await _check_provider("coingecko", "https://api.coingecko.com/api/v3/ping"))

    # Dune
    if settings.dune_api_key:
        providers.append(HealthProvider(name="dune", status="configured"))
    else:
        providers.append(HealthProvider(name="dune", status="not_configured"))

    all_ok = all(p.status in ("ok", "configured", "not_configured") for p in providers)
    return HealthResponse(status="ok" if all_ok else "degraded", providers=providers)
