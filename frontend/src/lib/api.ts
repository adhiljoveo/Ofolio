const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function fetchAPI<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.detail || `API error ${res.status}`);
  }
  return res.json();
}

export interface TokenBalance {
  contract_address: string;
  symbol: string;
  name: string;
  logo: string | null;
  decimals: number;
  balance_raw: string;
  balance: number;
  price_usd: number | null;
  value_usd: number | null;
}

export interface TokenBalancesResponse {
  address: string;
  chain: string;
  tokens: TokenBalance[];
  native_balance: number;
  native_balance_usd: number | null;
}

export interface Transaction {
  hash: string;
  block_number: number | null;
  timestamp: string | null;
  from_address: string;
  to_address: string | null;
  value: number;
  asset: string;
  category: string;
}

export interface TransactionsResponse {
  address: string;
  chain: string;
  transactions: Transaction[];
  page_key: string | null;
}

export interface NFTItem {
  contract_address: string;
  token_id: string;
  name: string | null;
  description: string | null;
  image_url: string | null;
  collection_name: string | null;
}

export interface NFTsResponse {
  address: string;
  chain: string;
  nfts: NFTItem[];
  total_count: number;
}

export interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface NFTCollection {
  name: string | null;
  symbol: string | null;
  external_url: string | null;
  banner_image_url: string | null;
}

export interface NFTDetail {
  contract_address: string;
  token_id: string;
  name: string | null;
  description: string | null;
  image_url: string | null;
  image_original_url: string | null;
  image_content_type: string | null;
  collection_name: string | null;
  token_type: string | null;
  token_uri: string | null;
  attributes: NFTAttribute[];
  collection: NFTCollection | null;
  mint_timestamp: string | null;
  mint_tx_hash: string | null;
  acquired_at: string | null;
  balance: string | null;
}

export interface ChainNetWorth {
  chain: string;
  total_usd: number;
}

export interface NetWorthResponse {
  address: string;
  chains: ChainNetWorth[];
  total_usd: number;
}

export interface DefiLiquidityResponse {
  address: string;
  positions: Array<{
    pool_id: string;
    total_amount0: number;
    total_amount1: number;
    liquidity: number;
    token0: { id: string; name: string; symbol: string };
    token1: { id: string; name: string; symbol: string };
  }>;
}

export interface DefiStakesResponse {
  address: string;
  total_shares: number;
  total_eth_transferred: number;
}

export interface APRData {
  date: string | null;
  instant_apr: number | null;
  apr_30d: number | null;
  apr_7d: number | null;
  protocol_apr_7d: number | null;
  protocol_apr: number | null;
}

export const api = {
  getTokenBalances: (address: string, chain: string) =>
    fetchAPI<TokenBalancesResponse>("/tokens/balances", { address, chain }),

  getTransactions: (address: string, chain: string, pageKey?: string) =>
    fetchAPI<TransactionsResponse>("/transactions", { address, chain, ...(pageKey ? { page_key: pageKey } : {}) }),

  getNFTs: (address: string, chain: string) =>
    fetchAPI<NFTsResponse>("/nfts", { address, chain }),

  getNFTDetail: (contractAddress: string, tokenId: string, chain: string) =>
    fetchAPI<NFTDetail>("/nfts/detail", { contract_address: contractAddress, token_id: tokenId, chain }),

  getNetWorth: (address: string, chains: string) =>
    fetchAPI<NetWorthResponse>("/portfolio/net-worth", { address, chains }),

  getLiquidity: (address: string) =>
    fetchAPI<DefiLiquidityResponse>("/defi/liquidity", { address }),

  getStakes: (address: string) =>
    fetchAPI<DefiStakesResponse>("/defi/stakes", { address }),

  getAPR: () =>
    fetchAPI<{ apr_data: APRData }>("/defi/apr"),
};
