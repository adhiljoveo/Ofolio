import logging
import httpx
from app.config import get_settings
from app.utils.cache import PRICE_CACHE, cache_key

logger = logging.getLogger(__name__)

DEMO_BASE_URL = "https://api.coingecko.com/api/v3"
PRO_BASE_URL = "https://pro-api.coingecko.com/api/v3"


def _is_pro_key() -> bool:
    key = get_settings().coingecko_api_key
    return bool(key and key.startswith("CG-") is False and len(key) > 30)


def _get_base_url() -> str:
    if _is_pro_key():
        return PRO_BASE_URL
    return DEMO_BASE_URL


def _headers() -> dict:
    key = get_settings().coingecko_api_key
    if not key:
        return {}
    if _is_pro_key():
        return {"x-cg-pro-api-key": key}
    return {"x-cg-demo-api-key": key}


NATIVE_IDS = {
    "ethereum": "ethereum",
    "polygon-pos": "polygon-ecosystem-token",
    "binance-smart-chain": "binancecoin",
    "arbitrum-one": "ethereum",
    "base": "ethereum",
}


async def get_token_prices(
    platform: str,
    contract_addresses: list[str],
) -> dict[str, float]:
    if not contract_addresses:
        return {}

    ck = cache_key("prices", platform, sorted(contract_addresses))
    if ck in PRICE_CACHE:
        return PRICE_CACHE[ck]

    addr_str = ",".join(contract_addresses[:100])
    url = f"{_get_base_url()}/simple/token_price/{platform}"

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, params={
            "contract_addresses": addr_str,
            "vs_currencies": "usd",
        }, headers=_headers())

    prices: dict[str, float] = {}
    if resp.status_code == 200:
        data = resp.json()
        for addr in contract_addresses:
            addr_lower = addr.lower()
            if addr_lower in data and "usd" in data[addr_lower]:
                prices[addr_lower] = data[addr_lower]["usd"]
    else:
        logger.warning("CoinGecko token_price HTTP %s: %s", resp.status_code, resp.text[:200])

    PRICE_CACHE[ck] = prices
    return prices


async def get_native_price(coingecko_platform: str = "ethereum") -> float | None:
    coin_id = NATIVE_IDS.get(coingecko_platform, coingecko_platform)

    ck = cache_key("native_price", coin_id)
    if ck in PRICE_CACHE:
        return PRICE_CACHE[ck]

    url = f"{_get_base_url()}/simple/price"
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url, params={
            "ids": coin_id,
            "vs_currencies": "usd",
        }, headers=_headers())

    if resp.status_code == 200:
        data = resp.json()
        price = data.get(coin_id, {}).get("usd")
        if price is not None:
            PRICE_CACHE[ck] = price
            return price
    else:
        logger.warning("CoinGecko native_price HTTP %s: %s", resp.status_code, resp.text[:200])
    return None
