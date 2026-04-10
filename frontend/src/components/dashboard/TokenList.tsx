"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, TokenBalancesResponse } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEFAULT_TABLE_PAGE_SIZE, TablePagination } from "@/components/ui/table-pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { staggerContainer, staggerItem, defaultTransition, tableRowVariant } from "@/lib/animations";

interface Props {
  address: string;
  chain: string;
}

function TokenListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TokenList({ address, chain }: Props) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [address, chain]);

  const { data, isLoading, error } = useQuery<TokenBalancesResponse>({
    queryKey: ["tokens", address, chain],
    queryFn: () => api.getTokenBalances(address, chain),
    enabled: !!address,
  });

  const pageSize = DEFAULT_TABLE_PAGE_SIZE;
  const paginatedTokens = useMemo(() => {
    if (!data?.tokens.length) return [];
    const start = (page - 1) * pageSize;
    return data.tokens.slice(start, start + pageSize);
  }, [data?.tokens, page, pageSize]);

  useEffect(() => {
    if (!data?.tokens) return;
    const maxPage = Math.max(1, Math.ceil(data.tokens.length / pageSize));
    setPage((p) => (p > maxPage ? maxPage : p));
  }, [data?.tokens?.length, pageSize]);

  if (isLoading) return <TokenListSkeleton />;
  if (error)
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Failed to load tokens
        </CardContent>
      </Card>
    );
  if (!data) return null;

  const nativeSymbol =
    chain === "bsc" ? "BNB" : chain === "polygon" ? "MATIC" : "ETH";

  return (
    <motion.div
      className="space-y-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={staggerItem} transition={defaultTransition}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Native Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.native_balance.toFixed(4)} {nativeSymbol}
            </div>
            {data.native_balance_usd != null && (
              <p className="text-xs text-muted-foreground mt-1">
                ${data.native_balance_usd.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem} transition={defaultTransition}>
        <Card>
          <CardHeader>
            <CardTitle>Token Balances</CardTitle>
            <CardDescription>
              {data.tokens.length} tokens found on {chain}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTokens.map((token, i) => (
                  <motion.tr
                    key={token.contract_address}
                    className="border-b transition-colors hover:bg-muted/50"
                    variants={tableRowVariant}
                    initial="initial"
                    animate="animate"
                    transition={{ ...defaultTransition, delay: i * 0.03 }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {token.logo && <AvatarImage src={token.logo} alt={token.symbol} />}
                          <AvatarFallback className="text-xs font-bold">
                            {token.symbol.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{token.symbol}</p>
                          <p className="text-xs text-muted-foreground">{token.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {token.balance.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {token.price_usd != null
                        ? `$${token.price_usd.toFixed(2)}`
                        : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm">
                      {token.value_usd != null
                        ? `$${token.value_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                        : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                  </motion.tr>
                ))}
                {data.tokens.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No tokens found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              page={page}
              pageSize={pageSize}
              totalItems={data.tokens.length}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
