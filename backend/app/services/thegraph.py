import httpx
from app.config import get_settings

UNISWAP_V3_SUBGRAPH = "5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV"
LIDO_SUBGRAPH = "Sxx812XgeKyzQPaBpR5YZWmGV5fZuBaPdh7DFhzSwiQ"


def _gateway_url(subgraph_id: str) -> str:
    key = get_settings().the_graph_api_key
    if key:
        return f"https://gateway.thegraph.com/api/{key}/subgraphs/id/{subgraph_id}"
    return f"https://gateway.thegraph.com/api/subgraphs/id/{subgraph_id}"


async def get_liquidity_positions(address: str) -> list[dict]:
    url = _gateway_url(UNISWAP_V3_SUBGRAPH)
    query = """
    query($sender: String!) {
      mints(where: {sender: $sender}, first: 50) {
        amount0
        amount1
        pool {
          id
          liquidity
        }
        token0 { id name symbol }
        token1 { id name symbol }
      }
    }
    """
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, json={"query": query, "variables": {"sender": address.lower()}})

    data = resp.json()
    if "errors" in data:
        return []

    pools: dict[str, dict] = {}
    for mint in data.get("data", {}).get("mints", []):
        pool_id = mint["pool"]["id"]
        if pool_id not in pools:
            pools[pool_id] = {
                "pool_id": pool_id,
                "total_amount0": 0.0,
                "total_amount1": 0.0,
                "liquidity": 0.0,
                "token0": mint["token0"],
                "token1": mint["token1"],
            }
        pools[pool_id]["total_amount0"] += float(mint["amount0"])
        pools[pool_id]["total_amount1"] += float(mint["amount1"])
        liq = float(mint["pool"]["liquidity"])
        if liq > pools[pool_id]["liquidity"]:
            pools[pool_id]["liquidity"] = liq

    return list(pools.values())


async def get_lido_stakes(address: str) -> dict:
    url = _gateway_url(LIDO_SUBGRAPH)
    query = """
    query($sender: String!) {
      lidoSubmissions(where: {sender: $sender}, first: 100) {
        amount
        shares
        sharesAfter
        transactionHash
      }
    }
    """
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, json={"query": query, "variables": {"sender": address.lower()}})

    data = resp.json()
    submissions = data.get("data", {}).get("lidoSubmissions", [])

    total_eth = 0.0
    total_shares = 0
    for sub in submissions:
        total_eth += int(sub["amount"]) / 1e18
        total_shares = int(sub.get("sharesAfter", total_shares))

    return {"total_shares": total_shares, "total_eth_transferred": total_eth}
