import asyncio
import logging
from typing import Annotated

from fastapi import APIRouter, Query, HTTPException, Depends
from app.services import alchemy, coingecko
from app.utils.chains import get_chain, SUPPORTED_CHAIN_IDS
from app.utils.ethereum_address import ethereum_address_query
from app.models.schemas import NetWorthResponse, ChainNetWorth

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/portfolio", tags=["portfolio"])


async def _chain_net_worth(address: str, cid: str) -> ChainNetWorth:
    try:
        chain_info = get_chain(cid)
    except ValueError:
        return ChainNetWorth(chain=cid, total_usd=0)

    try:
        raw = await alchemy.get_native_and_token_balances_light(address, cid)
    except Exception as e:
        logger.warning("Skipping chain %s: %s", cid, e)
        return ChainNetWorth(chain=cid, total_usd=0)

    native_price_task = coingecko.get_native_price(chain_info.coingecko_platform)
    contract_addrs = [t["contract_address"] for t in raw["tokens"]]
    token_prices_task = coingecko.get_token_prices(chain_info.coingecko_platform, contract_addrs)

    native_price, prices = await asyncio.gather(native_price_task, token_prices_task)
    native_price = native_price or 0

    native_usd = raw["native_balance"] * native_price
    token_usd = sum(
        (t["balance_raw"] / 1e18) * prices.get(t["contract_address"].lower(), 0)
        for t in raw["tokens"]
    )

    chain_total = round(native_usd + token_usd, 2)
    return ChainNetWorth(chain=cid, total_usd=chain_total)


@router.get("/net-worth", response_model=NetWorthResponse)
async def net_worth(
    address: Annotated[str, Depends(ethereum_address_query)],
    chains: str = Query("ethereum", description="Comma-separated chain IDs"),
):
    chain_ids = [c.strip() for c in chains.split(",") if c.strip()]

    results = await asyncio.gather(*[
        _chain_net_worth(address, cid) for cid in chain_ids
    ])

    total = sum(r.total_usd for r in results)

    return NetWorthResponse(
        address=address,
        chains=list(results),
        total_usd=round(total, 2),
    )
