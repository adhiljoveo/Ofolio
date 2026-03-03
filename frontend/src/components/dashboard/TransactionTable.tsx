"use client";

import { useQuery } from "@tanstack/react-query";
import { api, TransactionsResponse } from "@/lib/api";
import Card from "@/components/ui/Card";
import LoadingState from "@/components/ui/LoadingState";
import { motion } from "framer-motion";

interface Props {
  address: string;
  chain: string;
}

function shortAddr(addr: string | null) {
  if (!addr) return "-";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function TransactionTable({ address, chain }: Props) {
  const { data, isLoading, error } = useQuery<TransactionsResponse>({
    queryKey: ["transactions", address, chain],
    queryFn: () => api.getTransactions(address, chain),
    enabled: !!address,
  });

  if (isLoading) return <LoadingState label="Loading transactions..." variant="table" />;
  if (error) return <p className="text-[var(--danger)] text-center py-8">Failed to load transactions</p>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Transactions</h2>
      <Card className="!p-0 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-left">
              <th className="px-5 py-3 font-medium">Hash</th>
              <th className="px-5 py-3 font-medium">From</th>
              <th className="px-5 py-3 font-medium">To</th>
              <th className="px-5 py-3 font-medium text-right">Value</th>
              <th className="px-5 py-3 font-medium">Asset</th>
              <th className="px-5 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {data.transactions.map((tx, i) => (
              <motion.tr
                key={`${tx.hash}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition"
              >
                <td className="px-5 py-3 font-mono text-xs">{shortAddr(tx.hash)}</td>
                <td className="px-5 py-3 font-mono text-xs">{shortAddr(tx.from_address)}</td>
                <td className="px-5 py-3 font-mono text-xs">{shortAddr(tx.to_address)}</td>
                <td className="px-5 py-3 text-right">{typeof tx.value === "number" ? tx.value.toFixed(4) : tx.value}</td>
                <td className="px-5 py-3">{tx.asset}</td>
                <td className="px-5 py-3 text-xs text-[var(--text-muted)]">
                  {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : "-"}
                </td>
              </motion.tr>
            ))}
            {data.transactions.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-[var(--text-muted)]">No transactions found</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
