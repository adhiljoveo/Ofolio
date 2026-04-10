"use client";

import { useQuery } from "@tanstack/react-query";
import { api, NFTDetail } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageIcon, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractAddress: string;
  tokenId: string;
  chain: string;
}

function truncateAddress(addr: string) {
  if (addr.length <= 13) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

function getEtherscanUrl(chain: string, contractAddress: string, tokenId: string) {
  const base: Record<string, string> = {
    ethereum: "https://etherscan.io",
    polygon: "https://polygonscan.com",
    arbitrum: "https://arbiscan.io",
    optimism: "https://optimistic.etherscan.io",
    base: "https://basescan.org",
  };
  const host = base[chain] || base.ethereum;
  return `${host}/nft/${contractAddress}/${tokenId}`;
}

function getOpenSeaUrl(chain: string, contractAddress: string, tokenId: string) {
  const chainSlug: Record<string, string> = {
    ethereum: "ethereum",
    polygon: "matic",
    arbitrum: "arbitrum",
    optimism: "optimism",
    base: "base",
  };
  const slug = chainSlug[chain] || "ethereum";
  return `https://opensea.io/assets/${slug}/${contractAddress}/${tokenId}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4 p-1">
      <Skeleton className="w-full aspect-square rounded-lg" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    </div>
  );
}

function DetailContent({ data, chain }: { data: NFTDetail; chain: string }) {
  const etherscanUrl = getEtherscanUrl(chain, data.contract_address, data.token_id);
  const openSeaUrl = getOpenSeaUrl(chain, data.contract_address, data.token_id);

  return (
    <div className="space-y-6">
      {/* Image */}
      <div className="overflow-hidden rounded-lg border bg-muted">
        {data.image_url ? (
          <img
            src={data.image_url}
            alt={data.name || "NFT"}
            className="w-full aspect-square object-contain"
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Name & Collection */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold leading-tight">
          {data.name || `#${data.token_id}`}
        </h3>
        <p className="text-sm text-muted-foreground">
          {data.collection_name || "Unknown Collection"}
        </p>
        {data.token_type && (
          <Badge variant="secondary" className="mt-1">
            {data.token_type}
          </Badge>
        )}
      </div>

      {/* Description */}
      {data.description && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Description</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {data.description}
          </p>
        </div>
      )}

      {/* Attributes / Traits */}
      {data.attributes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Properties</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {data.attributes.map((attr, i) => (
              <div
                key={`${attr.trait_type}-${i}`}
                className="rounded-lg border bg-muted/50 p-2 text-center"
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-primary/70 truncate">
                  {attr.trait_type}
                </p>
                <p className="text-xs font-semibold truncate mt-0.5" title={attr.value}>
                  {attr.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Details</h4>
        <div className="rounded-lg border divide-y text-sm">
          <DetailRow
            label="Contract"
            value={truncateAddress(data.contract_address)}
            copyValue={data.contract_address}
          />
          <DetailRow label="Token ID" value={data.token_id} copyValue={data.token_id} />
          {data.token_type && (
            <DetailRow label="Standard" value={data.token_type} />
          )}
          {data.balance && data.token_type === "ERC1155" && (
            <DetailRow label="Balance" value={data.balance} />
          )}
          {data.mint_timestamp && (
            <DetailRow label="Minted" value={formatDate(data.mint_timestamp) || data.mint_timestamp} />
          )}
          {data.acquired_at && (
            <DetailRow label="Acquired" value={formatDate(data.acquired_at) || data.acquired_at} />
          )}
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-2">
        <a
          href={etherscanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Etherscan
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <a
          href={openSeaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          OpenSea
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  copyValue,
}: {
  label: string;
  value: string;
  copyValue?: string;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium flex items-center gap-1.5">
        {value}
        {copyValue && <CopyButton text={copyValue} />}
      </span>
    </div>
  );
}

export default function NFTDetailSheet({
  open,
  onOpenChange,
  contractAddress,
  tokenId,
  chain,
}: Props) {
  const { data, isLoading, error } = useQuery<NFTDetail>({
    queryKey: ["nft-detail", contractAddress, tokenId, chain],
    queryFn: () => api.getNFTDetail(contractAddress, tokenId, chain),
    enabled: open && !!contractAddress && !!tokenId,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            <SheetHeader className="mb-4">
              <SheetTitle>NFT Details</SheetTitle>
              <SheetDescription>
                {data?.collection_name || "Loading..."}
              </SheetDescription>
            </SheetHeader>

            {isLoading && <DetailSkeleton />}

            {error && (
              <div className="py-8 text-center text-destructive text-sm">
                Failed to load NFT details
              </div>
            )}

            {data && <DetailContent data={data} chain={chain} />}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
