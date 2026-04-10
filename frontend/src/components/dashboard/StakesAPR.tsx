"use client";

import { useQuery } from "@tanstack/react-query";
import { api, DefiStakesResponse, APRData } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Lock, TrendingUp, Percent, Coins } from "lucide-react";
import { staggerContainer, staggerItem, defaultTransition } from "@/lib/animations";

interface Props {
  address: string;
}

function APRSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function APRDisplay() {
  const { data, isLoading, error } = useQuery<{ apr_data: APRData }>({
    queryKey: ["apr"],
    queryFn: () => api.getAPR(),
  });

  if (isLoading) return <APRSkeleton />;
  if (error || !data?.apr_data)
    return (
      <Card>
        <CardContent className="py-4 text-center text-muted-foreground text-sm">
          APR data unavailable
        </CardContent>
      </Card>
    );

  const apr = data.apr_data;
  const fmt = (v: number | null) => (v != null ? `${v.toFixed(2)}%` : "N/A");

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={staggerItem} transition={defaultTransition}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instant APR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {fmt(apr.instant_apr)}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem} transition={defaultTransition}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">7-Day APR</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(apr.apr_7d)}</div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem} transition={defaultTransition}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">30-Day APR</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(apr.apr_30d)}</div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function StakesAPR({ address }: Props) {
  const { data, isLoading, error } = useQuery<DefiStakesResponse>({
    queryKey: ["stakes", address],
    queryFn: () => api.getStakes(address),
    enabled: !!address,
  });

  if (isLoading)
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <APRSkeleton />
      </div>
    );

  if (error)
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Failed to load staking data
        </CardContent>
      </Card>
    );

  const hasStakes =
    data && (data.total_shares > 0 || data.total_eth_transferred > 0);

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {hasStakes ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={staggerItem} transition={defaultTransition}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Shares
                </CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data!.total_shares.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem} transition={defaultTransition}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  ETH Transferred
                </CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data!.total_eth_transferred.toFixed(6)} ETH
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} transition={defaultTransition}>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Not Staking</h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                This wallet has no Lido staking history. Stake ETH with Lido to
                earn rewards.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={staggerItem} transition={defaultTransition}>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              Lido APR
            </h3>
            <p className="text-sm text-muted-foreground">
              Current network staking rates
            </p>
          </div>
          <APRDisplay />
        </div>
      </motion.div>
    </motion.div>
  );
}
