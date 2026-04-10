from typing import Annotated

from fastapi import APIRouter, Query, HTTPException, Depends
from app.services import alchemy, coingecko
from app.utils.chains import get_chain, SUPPORTED_CHAIN_IDS
from app.utils.ethereum_address import ethereum_address_query
from app.models.schemas import TokenBalancesResponse, TokenBalance

router = APIRouter(prefix="/tokens", tags=["tokens"])


@router.get("/balances", response_model=TokenBalancesResponse)
async def token_balances(
    address: Annotated[str, Depends(ethereum_address_query)],
    chain: str = Query("ethereum", description="Chain ID", enum=SUPPORTED_CHAIN_IDS),
):
    try:
        chain_info = get_chain(chain)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    raw = await alchemy.get_token_balances(address, chain)

    # Get prices from CoinGecko
    contract_addrs = [t["contract_address"] for t in raw["tokens"]]
    prices = await coingecko.get_token_prices(chain_info.coingecko_platform, contract_addrs)
    native_price = await coingecko.get_native_price(chain_info.coingecko_platform)

    tokens = []
    for t in raw["tokens"]:
        price = prices.get(t["contract_address"].lower())
        value = round(t["balance"] * price, 2) if price else None
        tokens.append(TokenBalance(
            contract_address=t["contract_address"],
            symbol=t["symbol"],
            name=t["name"],
            logo=t["logo"],
            decimals=t["decimals"],
            balance_raw=t["balance_raw"],
            balance=t["balance"],
            price_usd=price,
            value_usd=value,
        ))

    # Sort by value descending
    tokens.sort(key=lambda t: t.value_usd or 0, reverse=True)

    native_usd = round(raw["native_balance"] * native_price, 2) if native_price else None

    return TokenBalancesResponse(
        address=address,
        chain=chain,
        tokens=tokens,
        native_balance=raw["native_balance"],
        native_balance_usd=native_usd,
    )
