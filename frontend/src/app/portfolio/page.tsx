"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import Navbar from "@/components/Navbar";
import ChainSelector from "@/components/ChainSelector";
import Overview from "@/components/dashboard/Overview";
import TokenList from "@/components/dashboard/TokenList";
import TransactionTable from "@/components/dashboard/TransactionTable";
import NFTGrid from "@/components/dashboard/NFTGrid";
import DefiPositions from "@/components/dashboard/DefiPositions";
import StakesAPR from "@/components/dashboard/StakesAPR";
import Spinner from "@/components/ui/Spinner";
import { motion, AnimatePresence } from "framer-motion";

const TABS = ["Overview", "Tokens", "Transactions", "NFTs", "DeFi", "Stakes"] as const;
type Tab = (typeof TABS)[number];

function PortfolioContent() {
  const { address: connectedAddress } = useAccount();
  const searchParams = useSearchParams();
  const queryAddress = searchParams.get("address");

  const [manualAddress, setManualAddress] = useState(queryAddress || "");
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [chain, setChain] = useState("ethereum");

  const effectiveAddress = manualAddress.trim() || connectedAddress || "";
  const shortAddr = effectiveAddress ? `${effectiveAddress.slice(0, 6)}...${effectiveAddress.slice(-4)}` : "";

  if (!effectiveAddress) {
    return (
      <main className="pt-24 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <h2 className="text-2xl font-bold mb-2">View portfolio</h2>
        <p className="text-[var(--text-secondary)] mb-6">Connect a wallet or paste an address to get started.</p>
        <form onSubmit={(e) => e.preventDefault()} className="flex gap-3 w-full max-w-md">
          <input
            type="text"
            placeholder="0x..."
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]
              text-sm focus:outline-none focus:border-[var(--accent)]"
          />
        </form>
      </main>
    );
  }

  return (
    <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium">
            {shortAddr}
          </div>
          <ChainSelector value={chain} onChange={setChain} />
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
          <input
            type="text"
            placeholder="Change address..."
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm w-48
              focus:outline-none focus:border-[var(--accent)]"
          />
        </form>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab
                ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "Overview" && <Overview address={effectiveAddress} chain={chain} />}
          {activeTab === "Tokens" && <TokenList address={effectiveAddress} chain={chain} />}
          {activeTab === "Transactions" && <TransactionTable address={effectiveAddress} chain={chain} />}
          {activeTab === "NFTs" && <NFTGrid address={effectiveAddress} chain={chain} />}
          {activeTab === "DeFi" && <DefiPositions address={effectiveAddress} />}
          {activeTab === "Stakes" && <StakesAPR address={effectiveAddress} />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export default function PortfolioPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Spinner /></div>}>
        <PortfolioContent />
      </Suspense>
    </>
  );
}
