from fastapi import APIRouter, Query
from app.services import thegraph, dune

router = APIRouter(prefix="/defi", tags=["defi"])


@router.get("/liquidity")
async def liquidity(
    address: str = Query(..., description="Wallet address"),
):
    positions = await thegraph.get_liquidity_positions(address)
    return {"address": address, "positions": positions}


@router.get("/stakes")
async def stakes(
    address: str = Query(..., description="Wallet address"),
):
    data = await thegraph.get_lido_stakes(address)
    return {"address": address, **data}


@router.get("/apr")
async def apr():
    data = await dune.get_lido_apr()
    if data is None:
        return {"error": "Dune API key not configured or query failed", "code": "DUNE_UNAVAILABLE"}
    return {"apr_data": data}
