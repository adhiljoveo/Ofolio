"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, NFTsResponse, NFTItem } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { staggerContainer, scaleIn, defaultTransition } from "@/lib/animations";
import NFTDetailSheet from "./NFTDetailSheet";

interface Props {
  address: string;
  chain: string;
}

function NFTSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function NFTGrid({ address, chain }: Props) {
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, isLoading, error } = useQuery<NFTsResponse>({
    queryKey: ["nfts", address, chain],
    queryFn: () => api.getNFTs(address, chain),
    enabled: !!address,
  });

  const handleNFTClick = (nft: NFTItem) => {
    setSelectedNFT(nft);
    setSheetOpen(true);
  };

  if (isLoading) return <NFTSkeleton />;
  if (error)
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Failed to load NFTs
        </CardContent>
      </Card>
    );
  if (!data) return null;

  if (data.nfts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No NFTs Found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            This wallet has no NFTs on this chain.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold tracking-tight">NFTs</h2>
        <Badge variant="secondary">{data.total_count}</Badge>
      </div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {data.nfts.map((nft, i) => (
          <motion.div
            key={`${nft.contract_address}-${nft.token_id}`}
            variants={scaleIn}
            transition={{ ...defaultTransition, delay: i * 0.04 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => handleNFTClick(nft)}
          >
            <Card className="overflow-hidden transition-shadow hover:shadow-lg cursor-pointer">
              {nft.image_url ? (
                <img
                  src={nft.image_url}
                  alt={nft.name || "NFT"}
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-square bg-muted flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">
                  {nft.name || `#${nft.token_id}`}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {nft.collection_name || "Unknown Collection"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {selectedNFT && (
        <NFTDetailSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          contractAddress={selectedNFT.contract_address}
          tokenId={selectedNFT.token_id}
          chain={chain}
        />
      )}
    </div>
  );
}
