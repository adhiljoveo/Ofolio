"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { isAddress } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet } from "lucide-react";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import Overview from "@/components/dashboard/Overview";
import TokenList from "@/components/dashboard/TokenList";
import TransactionTable from "@/components/dashboard/TransactionTable";
import NFTGrid from "@/components/dashboard/NFTGrid";
import DefiPositions from "@/components/dashboard/DefiPositions";
import StakesAPR from "@/components/dashboard/StakesAPR";

import { pageTransition } from "@/lib/animations";

const SECTION_TITLES: Record<string, string> = {
  overview: "Overview",
  tokens: "Tokens",
  transactions: "Transactions",
  nfts: "NFTs",
  defi: "DeFi",
  stakes: "Stakes",
};

function PortfolioContent() {
  const { address: connectedAddress } = useAccount();
  const searchParams = useSearchParams();
  const queryAddress = searchParams.get("address");

  const [manualAddress, setManualAddress] = useState(queryAddress || "");
  const [activeTab, setActiveTab] = useState("overview");
  const [chain, setChain] = useState("ethereum");

  const effectiveAddress = manualAddress.trim() || connectedAddress || "";

  if (!effectiveAddress) {
    return (
      <SidebarProvider>
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <SidebarInset>
          <AppHeader title="Portfolio" />
          <div className="flex flex-1 items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>View Portfolio</CardTitle>
                <CardDescription>
                  Connect a wallet or paste an address to get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex gap-2"
                >
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!manualAddress.trim()}>
                    Load
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!isAddress(effectiveAddress)) {
    return (
      <SidebarProvider>
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <SidebarInset>
          <AppHeader title="Portfolio" />
          <div className="flex flex-1 items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle>Invalid address</CardTitle>
                <CardDescription>
                  Use a valid Ethereum address (0x followed by 40 hex characters). Terminal output or
                  other text cannot be used as a wallet address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex gap-2"
                >
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!manualAddress.trim()}>
                    Load
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <SidebarInset>
        <AppHeader
          title={SECTION_TITLES[activeTab] || "Dashboard"}
          address={effectiveAddress}
          chain={chain}
          onChainChange={setChain}
          manualAddress={manualAddress}
          onManualAddressChange={setManualAddress}
        />
        <div className="flex-1 p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={pageTransition.initial}
              animate={pageTransition.animate}
              exit={pageTransition.exit}
              transition={pageTransition.transition}
            >
              {activeTab === "overview" && (
                <Overview address={effectiveAddress} chain={chain} />
              )}
              {activeTab === "tokens" && (
                <TokenList address={effectiveAddress} chain={chain} />
              )}
              {activeTab === "transactions" && (
                <TransactionTable address={effectiveAddress} chain={chain} />
              )}
              {activeTab === "nfts" && (
                <NFTGrid address={effectiveAddress} chain={chain} />
              )}
              {activeTab === "defi" && (
                <DefiPositions address={effectiveAddress} />
              )}
              {activeTab === "stakes" && (
                <StakesAPR address={effectiveAddress} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<PortfolioSkeleton />}>
      <PortfolioContent />
    </Suspense>
  );
}
