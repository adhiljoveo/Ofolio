"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[1100px] backdrop-blur-xl border border-[var(--border)]
          rounded-2xl px-5 py-3 flex items-center justify-between"
        style={{ background: "rgba(var(--bg-secondary-rgb, 24 24 28), 0.85)" }}
      >
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition shrink-0">
          <span className="text-xl">OFolio</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link href="/" className="px-3 py-2 rounded-lg hover:bg-[var(--accent-muted)] transition">
            Home
          </Link>
          <Link href="/portfolio" className="px-3 py-2 rounded-lg hover:bg-[var(--accent-muted)] transition">
            Portfolio
          </Link>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] hover:scale-105 transition text-sm w-9 h-9 flex items-center justify-center"
            title="Toggle theme"
            suppressHydrationWarning
          >
            {mounted ? (theme === "dark" ? "☀️" : "🌙") : ""}
          </button>
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
        </div>
      </motion.nav>
    </div>
  );
}
