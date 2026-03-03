"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [manualAddress, setManualAddress] = useState("");
  const router = useRouter();

  const handleManualLoad = (e: React.FormEvent) => {
    e.preventDefault();
    const addr = manualAddress.trim();
    if (addr) {
      router.push(`/portfolio?address=${addr}`);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl"
        >
          Your DeFi portfolio,{" "}
          <span className="text-[var(--accent)]">one dashboard</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-4 text-lg text-[var(--text-secondary)] max-w-xl"
        >
          Track tokens, transactions, NFTs, liquidity, and staking across
          Ethereum, Polygon, BSC, Arbitrum, and Base.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-8 flex flex-wrap gap-4 justify-center"
        >
          <ConnectButton label="Connect Wallet" />
          <Link
            href="/portfolio"
            className="px-6 py-3 rounded-xl border border-[var(--border)] font-semibold
              hover:bg-[var(--accent-muted)] transition"
          >
            View Portfolio
          </Link>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          onSubmit={handleManualLoad}
          className="mt-10 flex gap-3 w-full max-w-md"
        >
          <input
            type="text"
            placeholder="Or paste any wallet address..."
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]
              text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold
              hover:opacity-90 transition"
          >
            Go
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-[var(--text-muted)]"
        >
          {["Ethereum", "Polygon", "BNB Chain", "Arbitrum", "Base"].map((name) => (
            <div key={name} className="px-4 py-2 rounded-lg border border-[var(--border)] text-center">
              {name}
            </div>
          ))}
        </motion.div>
      </main>
    </>
  );
}
