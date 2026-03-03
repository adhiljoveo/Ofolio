import httpx
from app.config import get_settings
from app.utils.cache import APR_CACHE, cache_key

LIDO_APR_QUERY_ID = 570874


async def get_lido_apr() -> dict | None:
    ck = cache_key("lido_apr")
    if ck in APR_CACHE:
        return APR_CACHE[ck]

    key = get_settings().dune_api_key
    if not key:
        return None

    url = f"https://api.dune.com/api/v1/query/{LIDO_APR_QUERY_ID}/results"
    headers = {"X-Dune-API-Key": key}

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(url, headers=headers)

    if resp.status_code != 200:
        return None

    data = resp.json()
    rows = data.get("result", {}).get("rows", [])
    if not rows:
        return None

    latest = sorted(rows, key=lambda r: r.get("time", ""), reverse=True)[0]
    result = {
        "date": latest.get("time"),
        "instant_apr": latest.get("Lido staking APR(instant)"),
        "apr_30d": latest.get("Lido staking APR(ma_30)"),
        "apr_7d": latest.get("Lido staking APR(ma_7)"),
        "protocol_apr_7d": latest.get("protocol APR(ma_7)"),
        "protocol_apr": latest.get("protocol_apr"),
    }
    APR_CACHE[ck] = result
    return result
