"use client";

import { useQuery } from "@tanstack/react-query";
import { api, DefiLiquidityResponse } from "@/lib/api";
import Card from "@/components/ui/Card";
import LoadingState from "@/components/ui/LoadingState";
import { motion } from "framer-motion";

interface Props {
  address: string;
}

export default function DefiPositions({ address }: Props) {
  const { data, isLoading, error } = useQuery<DefiLiquidityResponse>({
    queryKey: ["liquidity", address],
    queryFn: () => api.getLiquidity(address),
    enabled: !!address,
  });

  if (isLoading) return <LoadingState label="Loading DeFi positions..." variant="table" />;
  if (error) return <p className="text-[var(--danger)] text-center py-8">Failed to load liquidity positions</p>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Liquidity positions</h2>
      {data.positions.length === 0 ? (
        <Card className="!py-12 flex flex-col items-center text-center">
          <div className="text-4xl mb-3 opacity-40">💧</div>
          <p className="text-[var(--text-secondary)] font-medium">No liquidity positions</p>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">
            This wallet has no active Uniswap V3 liquidity positions on Ethereum mainnet.
          </p>
        </Card>
      ) : (
        <Card className="!p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-left">
                <th className="px-5 py-3 font-medium">Pool</th>
                <th className="px-5 py-3 font-medium">Token 0</th>
                <th className="px-5 py-3 font-medium text-right">Amount 0</th>
                <th className="px-5 py-3 font-medium">Token 1</th>
                <th className="px-5 py-3 font-medium text-right">Amount 1</th>
                <th className="px-5 py-3 font-medium text-right">Liquidity</th>
              </tr>
            </thead>
            <tbody>
              {data.positions.map((pos, i) => (
                <motion.tr
                  key={pos.pool_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition"
                >
                  <td className="px-5 py-3 font-mono text-xs">{pos.pool_id.slice(0, 10)}...</td>
                  <td className="px-5 py-3">{pos.token0.symbol}</td>
                  <td className="px-5 py-3 text-right">{pos.total_amount0.toFixed(4)}</td>
                  <td className="px-5 py-3">{pos.token1.symbol}</td>
                  <td className="px-5 py-3 text-right">{pos.total_amount1.toFixed(4)}</td>
                  <td className="px-5 py-3 text-right">{pos.liquidity.toLocaleString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
