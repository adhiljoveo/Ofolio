"use client";

import { useQuery } from "@tanstack/react-query";
import { api, DefiStakesResponse, APRData } from "@/lib/api";
import Card from "@/components/ui/Card";
import LoadingState from "@/components/ui/LoadingState";
import Spinner from "@/components/ui/Spinner";

interface Props {
  address: string;
}

function APRDisplay() {
  const { data, isLoading, error } = useQuery<{ apr_data: APRData }>({
    queryKey: ["apr"],
    queryFn: () => api.getAPR(),
  });

  if (isLoading) return <Spinner size={24} />;
  if (error || !data?.apr_data) return <p className="text-[var(--text-muted)]">APR data unavailable</p>;

  const apr = data.apr_data;
  const fmt = (v: number | null) => (v != null ? `${v.toFixed(2)}%` : "N/A");

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <Card>
        <p className="text-xs uppercase text-[var(--text-muted)]">Instant APR</p>
        <p className="text-lg font-bold text-[var(--success)] mt-1">{fmt(apr.instant_apr)}</p>
      </Card>
      <Card>
        <p className="text-xs uppercase text-[var(--text-muted)]">7-day APR</p>
        <p className="text-lg font-bold mt-1">{fmt(apr.apr_7d)}</p>
      </Card>
      <Card>
        <p className="text-xs uppercase text-[var(--text-muted)]">30-day APR</p>
        <p className="text-lg font-bold mt-1">{fmt(apr.apr_30d)}</p>
      </Card>
    </div>
  );
}

export default function StakesAPR({ address }: Props) {
  const { data, isLoading, error } = useQuery<DefiStakesResponse>({
    queryKey: ["stakes", address],
    queryFn: () => api.getStakes(address),
    enabled: !!address,
  });

  if (isLoading) return <LoadingState label="Loading staking data..." variant="cards" />;
  if (error) return <p className="text-[var(--danger)] text-center py-8">Failed to load staking data</p>;

  const hasStakes = data && (data.total_shares > 0 || data.total_eth_transferred > 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Staking</h2>

      {hasStakes ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <p className="text-xs uppercase text-[var(--text-muted)]">Total shares</p>
            <p className="text-xl font-bold mt-1">{data!.total_shares.toLocaleString()}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase text-[var(--text-muted)]">ETH transferred</p>
            <p className="text-xl font-bold mt-1">{data!.total_eth_transferred.toFixed(6)} ETH</p>
          </Card>
        </div>
      ) : (
        <Card className="!py-12 flex flex-col items-center text-center">
          <div className="text-4xl mb-3 opacity-40">🔒</div>
          <p className="text-[var(--text-secondary)] font-medium">Not staking</p>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">
            This wallet has no Lido staking history. Stake ETH with Lido to earn rewards.
          </p>
        </Card>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">Lido APR (current network rates)</h3>
        <APRDisplay />
      </div>
    </div>
  );
}
