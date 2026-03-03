import { mainnet, polygon, bsc, arbitrum, base } from "wagmi/chains";

export const SUPPORTED_CHAINS = [mainnet, polygon, bsc, arbitrum, base] as const;

export const CHAIN_ID_MAP: Record<number, string> = {
  1: "ethereum",
  137: "polygon",
  56: "bsc",
  42161: "arbitrum",
  8453: "base",
};

export const CHAIN_NAME_MAP: Record<string, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  bsc: "BNB Chain",
  arbitrum: "Arbitrum",
  base: "Base",
};

export function chainIdToSlug(chainId: number): string {
  return CHAIN_ID_MAP[chainId] || "ethereum";
}
