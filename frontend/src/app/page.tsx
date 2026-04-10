"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Shield, Zap, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { fadeInUp, staggerContainer, staggerItem, defaultTransition } from "@/lib/animations";

const chains = ["Ethereum", "Polygon", "BNB Chain", "Arbitrum", "Base"];

const features = [
  {
    icon: BarChart3,
    title: "Portfolio Tracking",
    description: "Real-time token balances and net worth across all chains.",
  },
  {
    icon: Shield,
    title: "DeFi Positions",
    description: "Monitor your liquidity pools and staking positions.",
  },
  {
    icon: Zap,
    title: "Transaction History",
    description: "Complete history of transfers, swaps, and interactions.",
  },
];

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
    <div className="min-h-screen flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="h-4 w-4" />
            </div>
            OFolio
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/portfolio">Portfolio</Link>
            </Button>
            <ThemeToggle />
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-14">
        <motion.div
          className="flex flex-col items-center text-center max-w-3xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={staggerItem} transition={defaultTransition}>
            <Badge variant="secondary" className="mb-6 px-4 py-1.5">
              Multi-chain DeFi Dashboard
            </Badge>
          </motion.div>

          <motion.h1
            variants={staggerItem}
            transition={defaultTransition}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]"
          >
            Your DeFi portfolio,{" "}
            <span className="text-primary">one dashboard</span>
          </motion.h1>

          <motion.p
            variants={staggerItem}
            transition={defaultTransition}
            className="mt-4 text-lg text-muted-foreground max-w-xl"
          >
            Track tokens, transactions, NFTs, liquidity, and staking across
            Ethereum, Polygon, BSC, Arbitrum, and Base.
          </motion.p>

          <motion.div
            variants={staggerItem}
            transition={defaultTransition}
            className="mt-8 flex flex-wrap gap-3 justify-center"
          >
            <div className="flex items-center">
              <ConnectButton label="Connect Wallet" />
            </div>
            <Button variant="outline" size="lg" asChild>
              <Link href="/portfolio" className="gap-2">
                Explore Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.form
            variants={staggerItem}
            transition={defaultTransition}
            onSubmit={handleManualLoad}
            className="mt-10 flex gap-2 w-full max-w-md"
          >
            <Input
              type="text"
              placeholder="Or paste any wallet address (0x...)..."
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              className="h-11"
            />
            <Button type="submit" size="lg" disabled={!manualAddress.trim()}>
              Go
            </Button>
          </motion.form>

          <motion.div
            variants={staggerItem}
            transition={defaultTransition}
            className="mt-8 flex flex-wrap gap-2 justify-center"
          >
            {chains.map((name) => (
              <Badge key={name} variant="outline" className="px-3 py-1">
                {name}
              </Badge>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-20 mb-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full px-4"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={staggerItem} transition={defaultTransition}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <feature.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
