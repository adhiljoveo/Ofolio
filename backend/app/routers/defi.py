from typing import Annotated

from fastapi import APIRouter, Depends
from app.services import thegraph, dune
from app.utils.ethereum_address import ethereum_address_query

router = APIRouter(prefix="/defi", tags=["defi"])


@router.get("/liquidity")
async def liquidity(
    address: Annotated[str, Depends(ethereum_address_query)],
):
    positions = await thegraph.get_liquidity_positions(address)
    return {"address": address, "positions": positions}


@router.get("/stakes")
async def stakes(
    address: Annotated[str, Depends(ethereum_address_query)],
):
    data = await thegraph.get_lido_stakes(address)
    return {"address": address, **data}


@router.get("/apr")
async def apr():
    data = await dune.get_lido_apr()
    if data is None:
        return {"error": "Dune API key not configured or query failed", "code": "DUNE_UNAVAILABLE"}
    return {"apr_data": data}
