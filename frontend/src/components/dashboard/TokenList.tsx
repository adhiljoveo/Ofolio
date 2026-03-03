"use client";

import { useQuery } from "@tanstack/react-query";
import { api, TokenBalancesResponse } from "@/lib/api";
import Card from "@/components/ui/Card";
import LoadingState from "@/components/ui/LoadingState";
import { motion } from "framer-motion";

interface Props {
  address: string;
  chain: string;
}

export default function TokenList({ address, chain }: Props) {
  const { data, isLoading, error } = useQuery<TokenBalancesResponse>({
    queryKey: ["tokens", address, chain],
    queryFn: () => api.getTokenBalances(address, chain),
    enabled: !!address,
  });

  if (isLoading) return <LoadingState label="Loading token balances..." variant="table" />;
  if (error) return <p className="text-[var(--danger)] text-center py-8">Failed to load tokens</p>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Token balances</h2>

      <Card className="!p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <span className="text-sm text-[var(--text-muted)]">
            Native balance: {data.native_balance.toFixed(4)} {chain === "bsc" ? "BNB" : chain === "polygon" ? "MATIC" : "ETH"}
          </span>
          {data.native_balance_usd != null && (
            <span className="text-sm font-medium">${data.native_balance_usd.toLocaleString()}</span>
          )}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-left">
              <th className="px-5 py-3 font-medium">Token</th>
              <th className="px-5 py-3 font-medium text-right">Balance</th>
              <th className="px-5 py-3 font-medium text-right">Price</th>
              <th className="px-5 py-3 font-medium text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {data.tokens.map((token, i) => (
              <motion.tr
                key={token.contract_address}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition"
              >
                <td className="px-5 py-3 flex items-center gap-3">
                  {token.logo ? (
                    <img src={token.logo} alt="" className="w-7 h-7 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--accent-muted)] flex items-center justify-center text-xs font-bold">
                      {token.symbol.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{token.symbol}</p>
                    <p className="text-xs text-[var(--text-muted)]">{token.name}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-right">{token.balance.toFixed(4)}</td>
                <td className="px-5 py-3 text-right">
                  {token.price_usd != null ? `$${token.price_usd.toFixed(2)}` : "-"}
                </td>
                <td className="px-5 py-3 text-right font-medium">
                  {token.value_usd != null ? `$${token.value_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                </td>
              </motion.tr>
            ))}
            {data.tokens.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-[var(--text-muted)]">No tokens found</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
