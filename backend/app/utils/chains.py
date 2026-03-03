from dataclasses import dataclass

@dataclass(frozen=True)
class ChainInfo:
    id: str
    name: str
    alchemy_network: str
    coingecko_platform: str
    chain_id: int


CHAINS: dict[str, ChainInfo] = {
    "ethereum": ChainInfo(
        id="ethereum",
        name="Ethereum",
        alchemy_network="eth-mainnet",
        coingecko_platform="ethereum",
        chain_id=1,
    ),
    "polygon": ChainInfo(
        id="polygon",
        name="Polygon",
        alchemy_network="polygon-mainnet",
        coingecko_platform="polygon-pos",
        chain_id=137,
    ),
    "bsc": ChainInfo(
        id="bsc",
        name="BNB Smart Chain",
        alchemy_network="bnb-mainnet",
        coingecko_platform="binance-smart-chain",
        chain_id=56,
    ),
    "arbitrum": ChainInfo(
        id="arbitrum",
        name="Arbitrum One",
        alchemy_network="arb-mainnet",
        coingecko_platform="arbitrum-one",
        chain_id=42161,
    ),
    "base": ChainInfo(
        id="base",
        name="Base",
        alchemy_network="base-mainnet",
        coingecko_platform="base",
        chain_id=8453,
    ),
}

SUPPORTED_CHAIN_IDS = list(CHAINS.keys())


def get_chain(chain_id: str) -> ChainInfo:
    chain = CHAINS.get(chain_id)
    if not chain:
        raise ValueError(f"Unsupported chain: {chain_id}. Supported: {SUPPORTED_CHAIN_IDS}")
    return chain
