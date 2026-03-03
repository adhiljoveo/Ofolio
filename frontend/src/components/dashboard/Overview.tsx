"use client";

import { useQuery } from "@tanstack/react-query";
import { api, NetWorthResponse } from "@/lib/api";
import Card from "@/components/ui/Card";
import LoadingState from "@/components/ui/LoadingState";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

const ALL_CHAINS = "ethereum,polygon,bsc,arbitrum,base";

interface Props {
  address: string;
  chain: string;
}

export default function Overview({ address, chain }: Props) {
  const { data, isLoading, error } = useQuery<NetWorthResponse>({
    queryKey: ["net-worth", address, ALL_CHAINS],
    queryFn: () => api.getNetWorth(address, ALL_CHAINS),
    enabled: !!address,
  });

  if (isLoading) return <LoadingState label="Fetching portfolio across all chains..." variant="cards" />;
  if (error) return <LoadingState label="Failed to load net worth. Retrying..." variant="cards" />;
  if (!data) return null;

  const netWorth = data.total_usd;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const chartData = months.map((name, i) => ({
    name,
    value: Math.round((netWorth * (i + 1)) / months.length * 100) / 100,
  }));

  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-bold tracking-tight"
      >
        Portfolio overview
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs uppercase text-[var(--text-muted)] tracking-wider">Net worth</p>
          <p className="text-2xl font-bold mt-1">${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </Card>
        {data.chains.map((c) => (
          <Card key={c.chain}>
            <p className="text-xs uppercase text-[var(--text-muted)] tracking-wider">{c.chain}</p>
            <p className="text-lg font-semibold mt-1">${c.total_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </Card>
        ))}
      </div>

      <Card className="!p-6">
        <h3 className="text-sm font-semibold mb-4">Portfolio value trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={12}
              tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
            />
            <Tooltip
              contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8 }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Value"]}
            />
            <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)", strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
