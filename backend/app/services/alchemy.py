import asyncio
import logging
import httpx
from fastapi import HTTPException
from app.config import get_settings
from app.utils.chains import get_chain, ChainInfo
from app.utils.cache import BALANCE_CACHE, NFT_CACHE, NFT_DETAIL_CACHE, TX_CACHE, cache_key

logger = logging.getLogger(__name__)

_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(timeout=15)
    return _client


def _require_key() -> str:
    key = get_settings().alchemy_api_key
    if not key:
        raise HTTPException(status_code=503, detail="ALCHEMY_API_KEY is not configured")
    return key


def _base_url(chain: ChainInfo) -> str:
    return f"https://{chain.alchemy_network}.g.alchemy.com/v2/{_require_key()}"


def _parse_rpc(resp: httpx.Response, label: str = "Alchemy") -> dict:
    if resp.status_code != 200:
        logger.error("%s HTTP %s: %s", label, resp.status_code, resp.text[:300])
        raise HTTPException(status_code=502, detail=f"{label} returned HTTP {resp.status_code}")
    try:
        data = resp.json()
    except Exception:
        logger.error("%s non-JSON body: %s", label, resp.text[:300])
        raise HTTPException(status_code=502, detail=f"{label} returned non-JSON response")
    if "error" in data:
        msg = data["error"].get("message", str(data["error"]))
        logger.error("%s RPC error: %s", label, msg)
        raise HTTPException(status_code=502, detail=f"{label} RPC error: {msg}")
    return data


async def get_native_and_token_balances_light(address: str, chain_id: str) -> dict:
    """Fast path: get native + raw token balances without metadata lookups."""
    ck = cache_key("balances_light", address, chain_id)
    if ck in BALANCE_CACHE:
        return BALANCE_CACHE[ck]

    chain = get_chain(chain_id)
    url = _base_url(chain)
    client = _get_client()

    native_resp, balances_resp = await asyncio.gather(
        client.post(url, json={
            "jsonrpc": "2.0", "id": 1, "method": "eth_getBalance",
            "params": [address, "latest"],
        }),
        client.post(url, json={
            "jsonrpc": "2.0", "id": 2, "method": "alchemy_getTokenBalances",
            "params": [address, "erc20"],
        }),
    )

    native_data = _parse_rpc(native_resp, f"Alchemy({chain_id})/eth_getBalance")
    native_hex = native_data.get("result", "0x0")
    native_balance = int(native_hex, 16) / 1e18

    balances_data = _parse_rpc(balances_resp, f"Alchemy({chain_id})/getTokenBalances")
    raw_balances = balances_data.get("result", {}).get("tokenBalances", [])

    non_zero = [
        b for b in raw_balances
        if b.get("tokenBalance") and b["tokenBalance"] != "0x" and int(b["tokenBalance"], 16) > 0
    ]

    tokens = []
    for b in non_zero:
        raw_bal = int(b["tokenBalance"], 16)
        tokens.append({
            "contract_address": b["contractAddress"],
            "balance_raw": raw_bal,
        })

    result = {
        "address": address,
        "chain": chain_id,
        "native_balance": native_balance,
        "tokens": tokens,
    }
    BALANCE_CACHE[ck] = result
    return result


async def get_token_balances(address: str, chain_id: str) -> dict:
    ck = cache_key("balances", address, chain_id)
    if ck in BALANCE_CACHE:
        return BALANCE_CACHE[ck]

    chain = get_chain(chain_id)
    url = _base_url(chain)
    client = _get_client()

    native_resp, balances_resp = await asyncio.gather(
        client.post(url, json={
            "jsonrpc": "2.0", "id": 1, "method": "eth_getBalance",
            "params": [address, "latest"],
        }),
        client.post(url, json={
            "jsonrpc": "2.0", "id": 2, "method": "alchemy_getTokenBalances",
            "params": [address, "erc20"],
        }),
    )

    native_data = _parse_rpc(native_resp, f"Alchemy({chain_id})/eth_getBalance")
    native_hex = native_data.get("result", "0x0")
    native_balance = int(native_hex, 16) / 1e18

    balances_data = _parse_rpc(balances_resp, f"Alchemy({chain_id})/getTokenBalances")
    raw_balances = balances_data.get("result", {}).get("tokenBalances", [])

    non_zero = [
        b for b in raw_balances
        if b.get("tokenBalance") and b["tokenBalance"] != "0x" and int(b["tokenBalance"], 16) > 0
    ]

    # Fetch metadata in parallel batches of 10
    tokens = []
    for i in range(0, min(len(non_zero), 50), 10):
        batch = non_zero[i:i+10]
        meta_resps = await asyncio.gather(*[
            client.post(url, json={
                "jsonrpc": "2.0", "id": 3, "method": "alchemy_getTokenMetadata",
                "params": [b["contractAddress"]],
            })
            for b in batch
        ])
        for b, meta_resp in zip(batch, meta_resps):
            try:
                meta_data = _parse_rpc(meta_resp, "Alchemy/getTokenMetadata")
                meta = meta_data.get("result", {})
            except HTTPException:
                meta = {}
            decimals = meta.get("decimals", 18) or 18
            raw_bal = int(b["tokenBalance"], 16)
            tokens.append({
                "contract_address": b["contractAddress"],
                "symbol": meta.get("symbol") or "???",
                "name": meta.get("name") or "Unknown",
                "logo": meta.get("logo"),
                "decimals": decimals,
                "balance_raw": str(raw_bal),
                "balance": raw_bal / (10 ** decimals),
            })

    result = {
        "address": address,
        "chain": chain_id,
        "native_balance": native_balance,
        "tokens": tokens,
    }
    BALANCE_CACHE[ck] = result
    return result


async def get_transactions(address: str, chain_id: str, page_key: str | None = None) -> dict:
    ck = cache_key("tx", address, chain_id, page_key)
    if ck in TX_CACHE:
        return TX_CACHE[ck]

    chain = get_chain(chain_id)
    url = _base_url(chain)
    client = _get_client()

    params = {
        "fromAddress": address,
        "category": ["external", "erc20", "erc721", "erc1155"],
        "order": "desc",
        "maxCount": "0x19",
        "withMetadata": True,
    }
    if page_key:
        params["pageKey"] = page_key

    in_params = {**params}
    in_params.pop("fromAddress", None)
    in_params["toAddress"] = address

    out_resp, in_resp = await asyncio.gather(
        client.post(url, json={
            "jsonrpc": "2.0", "id": 1, "method": "alchemy_getAssetTransfers",
            "params": [params],
        }),
        client.post(url, json={
            "jsonrpc": "2.0", "id": 2, "method": "alchemy_getAssetTransfers",
            "params": [in_params],
        }),
    )

    out_data = _parse_rpc(out_resp, f"Alchemy({chain_id})/getAssetTransfers").get("result", {})
    in_data = _parse_rpc(in_resp, f"Alchemy({chain_id})/getAssetTransfers").get("result", {})

    def _parse_transfer(t: dict) -> dict:
        meta = t.get("metadata", {})
        return {
            "hash": t.get("hash", ""),
            "block_number": int(t["blockNum"], 16) if t.get("blockNum") else None,
            "timestamp": meta.get("blockTimestamp"),
            "from_address": t.get("from", ""),
            "to_address": t.get("to"),
            "value": t.get("value") or 0,
            "asset": t.get("asset") or "ETH",
            "category": t.get("category", "external"),
        }

    transfers = [_parse_transfer(t) for t in out_data.get("transfers", [])]
    transfers += [_parse_transfer(t) for t in in_data.get("transfers", [])]
    transfers.sort(key=lambda x: x["timestamp"] or "", reverse=True)

    result = {
        "address": address,
        "chain": chain_id,
        "transactions": transfers[:50],
        "page_key": out_data.get("pageKey"),
    }
    TX_CACHE[ck] = result
    return result


async def get_nfts(address: str, chain_id: str) -> dict:
    ck = cache_key("nfts", address, chain_id)
    if ck in NFT_CACHE:
        return NFT_CACHE[ck]

    chain = get_chain(chain_id)
    key = _require_key()
    nft_url = f"https://{chain.alchemy_network}.g.alchemy.com/nft/v3/{key}/getNFTsForOwner"
    client = _get_client()

    resp = await client.get(nft_url, params={
        "owner": address,
        "withMetadata": "true",
        "pageSize": "50",
    })

    if resp.status_code != 200:
        logger.error("Alchemy NFT HTTP %s: %s", resp.status_code, resp.text[:300])
        raise HTTPException(status_code=502, detail=f"Alchemy NFT API returned HTTP {resp.status_code}")

    try:
        data = resp.json()
    except Exception:
        raise HTTPException(status_code=502, detail="Alchemy NFT API returned non-JSON response")

    nfts = []
    for nft in data.get("ownedNfts", []):
        img = nft.get("image", {})
        nfts.append({
            "contract_address": nft.get("contract", {}).get("address", ""),
            "token_id": nft.get("tokenId", ""),
            "name": nft.get("name") or nft.get("title"),
            "description": nft.get("description"),
            "image_url": img.get("cachedUrl") or img.get("thumbnailUrl") or img.get("originalUrl"),
            "collection_name": nft.get("contract", {}).get("name"),
        })

    result = {
        "address": address,
        "chain": chain_id,
        "nfts": nfts,
        "total_count": data.get("totalCount", len(nfts)),
    }
    NFT_CACHE[ck] = result
    return result


async def get_nft_metadata(contract_address: str, token_id: str, chain_id: str) -> dict:
    ck = cache_key("nft_detail", contract_address, token_id, chain_id)
    if ck in NFT_DETAIL_CACHE:
        return NFT_DETAIL_CACHE[ck]

    chain = get_chain(chain_id)
    key = _require_key()
    url = f"https://{chain.alchemy_network}.g.alchemy.com/nft/v3/{key}/getNFTMetadata"
    client = _get_client()

    resp = await client.get(url, params={
        "contractAddress": contract_address,
        "tokenId": token_id,
        "refreshCache": "false",
    })

    if resp.status_code != 200:
        logger.error("Alchemy NFT metadata HTTP %s: %s", resp.status_code, resp.text[:300])
        raise HTTPException(
            status_code=502,
            detail=f"Alchemy NFT metadata API returned HTTP {resp.status_code}",
        )

    try:
        nft = resp.json()
    except Exception:
        raise HTTPException(status_code=502, detail="Alchemy NFT metadata API returned non-JSON response")

    contract = nft.get("contract", {})
    img = nft.get("image", {})
    raw_meta = nft.get("raw", {}).get("metadata", {})
    mint = nft.get("mint", {})
    collection = nft.get("collection", {})

    attributes = []
    for attr in raw_meta.get("attributes", []):
        attributes.append({
            "trait_type": str(attr.get("trait_type", "")),
            "value": str(attr.get("value", "")),
        })

    result = {
        "contract_address": contract.get("address", contract_address),
        "token_id": nft.get("tokenId", token_id),
        "name": nft.get("name") or nft.get("title"),
        "description": nft.get("description"),
        "image_url": img.get("cachedUrl") or img.get("thumbnailUrl") or img.get("originalUrl"),
        "image_original_url": img.get("originalUrl"),
        "image_content_type": img.get("contentType"),
        "collection_name": contract.get("name") or collection.get("name"),
        "token_type": nft.get("tokenType"),
        "token_uri": nft.get("tokenUri"),
        "attributes": attributes,
        "collection": {
            "name": collection.get("name") or contract.get("name"),
            "symbol": contract.get("symbol"),
            "external_url": collection.get("externalUrl") or contract.get("externalUrl"),
            "banner_image_url": collection.get("bannerImageUrl"),
        },
        "mint_timestamp": mint.get("timestamp"),
        "mint_tx_hash": mint.get("transactionHash"),
        "acquired_at": nft.get("acquiredAt", {}).get("blockTimestamp"),
        "balance": nft.get("balance"),
    }

    NFT_DETAIL_CACHE[ck] = result
    return result
