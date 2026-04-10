"use client";

import { useQuery } from "@tanstack/react-query";
import { api, NetWorthResponse } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Layers } from "lucide-react";
import { staggerContainer, staggerItem, defaultTransition } from "@/lib/animations";

const ALL_CHAINS = "ethereum,polygon,bsc,arbitrum,base";

interface Props {
  address: string;
  chain: string;
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[260px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function Overview({ address, chain }: Props) {
  const { data, isLoading, error } = useQuery<NetWorthResponse>({
    queryKey: ["net-worth", address, ALL_CHAINS],
    queryFn: () => api.getNetWorth(address, ALL_CHAINS),
    enabled: !!address,
  });

  if (isLoading) return <OverviewSkeleton />;
  if (error) return <OverviewSkeleton />;
  if (!data) return null;

  const netWorth = data.total_usd;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const chartData = months.map((name, i) => ({
    name,
    value: Math.round(((netWorth * (i + 1)) / months.length) * 100) / 100,
  }));

  const chainCards = data.chains.filter((c) => c.total_usd > 0);
  const topChain = chainCards.length > 0 ? chainCards.reduce((a, b) => (a.total_usd > b.total_usd ? a : b)) : null;

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={staggerItem} transition={defaultTransition}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {data.chains.length} chains
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} transition={defaultTransition}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Chains</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chainCards.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                With non-zero balances
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} transition={defaultTransition}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Chain</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {topChain?.chain || "N/A"}
              </div>
              {topChain && (
                <p className="text-xs text-muted-foreground mt-1">
                  ${topChain.total_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} transition={defaultTransition}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chain Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {data.chains.map((c) => (
                  <Badge
                    key={c.chain}
                    variant={c.total_usd > 0 ? "default" : "outline"}
                    className="text-xs capitalize"
                  >
                    {c.chain}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        <motion.div
          className="lg:col-span-4"
          variants={staggerItem}
          transition={defaultTransition}
        >
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Value Trend</CardTitle>
              <CardDescription>Projected growth over 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="name"
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) =>
                      `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value: number) => [
                      `$${value.toFixed(2)}`,
                      "Value",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-3"
          variants={staggerItem}
          transition={defaultTransition}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Chain Breakdown</CardTitle>
              <CardDescription>Value per chain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.chains.map((c) => {
                const pct = netWorth > 0 ? (c.total_usd / netWorth) * 100 : 0;
                return (
                  <div key={c.chain} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium">{c.chain}</span>
                      <span className="text-muted-foreground">
                        ${c.total_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
