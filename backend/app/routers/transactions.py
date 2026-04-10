from typing import Annotated

from fastapi import APIRouter, Query, HTTPException, Depends
from app.services import alchemy
from app.utils.chains import SUPPORTED_CHAIN_IDS
from app.utils.ethereum_address import ethereum_address_query
from app.models.schemas import TransactionsResponse, Transaction

router = APIRouter(tags=["transactions"])


@router.get("/transactions", response_model=TransactionsResponse)
async def transactions(
    address: Annotated[str, Depends(ethereum_address_query)],
    chain: str = Query("ethereum", description="Chain ID", enum=SUPPORTED_CHAIN_IDS),
    page_key: str | None = Query(None, description="Pagination key from previous response"),
):
    try:
        raw = await alchemy.get_transactions(address, chain, page_key)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    txs = [Transaction(**t) for t in raw["transactions"]]

    return TransactionsResponse(
        address=address,
        chain=chain,
        transactions=txs,
        page_key=raw.get("page_key"),
    )
