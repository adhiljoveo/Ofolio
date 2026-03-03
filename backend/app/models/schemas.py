from pydantic import BaseModel


class ErrorResponse(BaseModel):
    error: str
    code: str = "UNKNOWN_ERROR"


class TokenBalance(BaseModel):
    contract_address: str
    symbol: str
    name: str
    logo: str | None = None
    decimals: int
    balance_raw: str
    balance: float
    price_usd: float | None = None
    value_usd: float | None = None


class TokenBalancesResponse(BaseModel):
    address: str
    chain: str
    tokens: list[TokenBalance]
    native_balance: float
    native_balance_usd: float | None = None


class Transaction(BaseModel):
    hash: str
    block_number: int | None = None
    timestamp: str | None = None
    from_address: str
    to_address: str | None = None
    value: float
    asset: str
    category: str


class TransactionsResponse(BaseModel):
    address: str
    chain: str
    transactions: list[Transaction]
    page_key: str | None = None


class NFT(BaseModel):
    contract_address: str
    token_id: str
    name: str | None = None
    description: str | None = None
    image_url: str | None = None
    collection_name: str | None = None


class NFTsResponse(BaseModel):
    address: str
    chain: str
    nfts: list[NFT]
    total_count: int


class ChainNetWorth(BaseModel):
    chain: str
    total_usd: float


class NetWorthResponse(BaseModel):
    address: str
    chains: list[ChainNetWorth]
    total_usd: float


class HealthProvider(BaseModel):
    name: str
    status: str
    latency_ms: float | None = None


class HealthResponse(BaseModel):
    status: str
    providers: list[HealthProvider]
