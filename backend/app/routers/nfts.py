from typing import Annotated

from fastapi import APIRouter, Query, HTTPException, Depends
from app.services import alchemy
from app.utils.chains import SUPPORTED_CHAIN_IDS
from app.utils.ethereum_address import ethereum_address_query
from app.models.schemas import NFTsResponse, NFT, NFTDetail

router = APIRouter(tags=["nfts"])


@router.get("/nfts", response_model=NFTsResponse)
async def nfts(
    address: Annotated[str, Depends(ethereum_address_query)],
    chain: str = Query("ethereum", description="Chain ID", enum=SUPPORTED_CHAIN_IDS),
):
    try:
        raw = await alchemy.get_nfts(address, chain)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    nft_list = [NFT(**n) for n in raw["nfts"]]

    return NFTsResponse(
        address=address,
        chain=chain,
        nfts=nft_list,
        total_count=raw["total_count"],
    )


@router.get("/nfts/detail", response_model=NFTDetail)
async def nft_detail(
    contract_address: str = Query(..., description="NFT contract address"),
    token_id: str = Query(..., description="Token ID"),
    chain: str = Query("ethereum", description="Chain ID", enum=SUPPORTED_CHAIN_IDS),
):
    try:
        raw = await alchemy.get_nft_metadata(contract_address, token_id, chain)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return NFTDetail(**raw)
