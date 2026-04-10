"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, DefiLiquidityResponse } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEFAULT_TABLE_PAGE_SIZE, TablePagination } from "@/components/ui/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";
import { staggerContainer, staggerItem, tableRowVariant, defaultTransition } from "@/lib/animations";

interface Props {
  address: string;
}

function DefiSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-56" />
      </CardHeader>
      <CardContent className="p-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-4 w-16 ml-auto" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function DefiPositions({ address }: Props) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [address]);

  const { data, isLoading, error } = useQuery<DefiLiquidityResponse>({
    queryKey: ["liquidity", address],
    queryFn: () => api.getLiquidity(address),
    enabled: !!address,
  });

  const pageSize = DEFAULT_TABLE_PAGE_SIZE;
  const paginatedPositions = useMemo(() => {
    if (!data?.positions.length) return [];
    const start = (page - 1) * pageSize;
    return data.positions.slice(start, start + pageSize);
  }, [data?.positions, page, pageSize]);

  useEffect(() => {
    if (!data?.positions) return;
    const maxPage = Math.max(1, Math.ceil(data.positions.length / pageSize));
    setPage((p) => (p > maxPage ? maxPage : p));
  }, [data?.positions?.length, pageSize]);

  if (isLoading) return <DefiSkeleton />;
  if (error)
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Failed to load liquidity positions
        </CardContent>
      </Card>
    );
  if (!data) return null;

  if (data.positions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Droplets className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No Liquidity Positions</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            This wallet has no active Uniswap V3 liquidity positions on
            Ethereum mainnet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      className="space-y-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={staggerItem} transition={defaultTransition}>
        <Card>
          <CardHeader>
            <CardTitle>Liquidity Positions</CardTitle>
            <CardDescription>
              {data.positions.length} active Uniswap V3 positions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pool</TableHead>
                    <TableHead>Token 0</TableHead>
                    <TableHead className="text-right">Amount 0</TableHead>
                    <TableHead>Token 1</TableHead>
                    <TableHead className="text-right">Amount 1</TableHead>
                    <TableHead className="text-right">Liquidity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPositions.map((pos, i) => (
                    <motion.tr
                      key={pos.pool_id}
                      className="border-b transition-colors hover:bg-muted/50"
                      variants={tableRowVariant}
                      initial="initial"
                      animate="animate"
                      transition={{ ...defaultTransition, delay: i * 0.05 }}
                    >
                      <TableCell className="font-mono text-xs">
                        {pos.pool_id.slice(0, 10)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {pos.token0.symbol}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {pos.total_amount0.toFixed(4)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {pos.token1.symbol}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {pos.total_amount1.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {pos.liquidity.toLocaleString()}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              page={page}
              pageSize={pageSize}
              totalItems={data.positions.length}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
