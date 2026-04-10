from cachetools import TTLCache
import hashlib
import json


PRICE_CACHE = TTLCache(maxsize=500, ttl=300)       # 5 min
BALANCE_CACHE = TTLCache(maxsize=200, ttl=30)       # 30 sec
NFT_CACHE = TTLCache(maxsize=100, ttl=120)          # 2 min
NFT_DETAIL_CACHE = TTLCache(maxsize=200, ttl=300)   # 5 min
TX_CACHE = TTLCache(maxsize=200, ttl=30)            # 30 sec
APR_CACHE = TTLCache(maxsize=10, ttl=900)           # 15 min


def cache_key(*parts) -> str:
    raw = json.dumps(parts, sort_keys=True, default=str)
    return hashlib.md5(raw.encode()).hexdigest()
