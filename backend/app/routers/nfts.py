from fastapi import APIRouter, Query, HTTPException
from app.services import alchemy
from app.utils.chains import SUPPORTED_CHAIN_IDS
from app.models.schemas import NFTsResponse, NFT

router = APIRouter(tags=["nfts"])


@router.get("/nfts", response_model=NFTsResponse)
async def nfts(
    address: str = Query(..., description="Wallet address"),
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
