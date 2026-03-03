"use client";

import { useQuery } from "@tanstack/react-query";
import { api, NFTsResponse } from "@/lib/api";
import LoadingState from "@/components/ui/LoadingState";
import { motion } from "framer-motion";

interface Props {
  address: string;
  chain: string;
}

export default function NFTGrid({ address, chain }: Props) {
  const { data, isLoading, error } = useQuery<NFTsResponse>({
    queryKey: ["nfts", address, chain],
    queryFn: () => api.getNFTs(address, chain),
    enabled: !!address,
  });

  if (isLoading) return <LoadingState label="Loading NFTs..." variant="grid" />;
  if (error) return <p className="text-[var(--danger)] text-center py-8">Failed to load NFTs</p>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">NFTs <span className="text-sm font-normal text-[var(--text-muted)]">({data.total_count})</span></h2>
      {data.nfts.length === 0 ? (
        <p className="text-[var(--text-muted)] text-center py-8">No NFTs found on this chain</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {data.nfts.map((nft, i) => (
            <motion.div
              key={`${nft.contract_address}-${nft.token_id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl overflow-hidden
                hover:border-[var(--accent-muted)] hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              {nft.image_url ? (
                <img
                  src={nft.image_url}
                  alt={nft.name || "NFT"}
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-square bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] text-xs">
                  No image
                </div>
              )}
              <div className="p-3">
                <p className="text-sm font-medium truncate">{nft.name || `#${nft.token_id}`}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{nft.collection_name || "Unknown"}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
