"use client";

import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api, TransactionsResponse } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CursorTablePagination } from "@/components/ui/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { tableRowVariant, defaultTransition, staggerContainer, staggerItem } from "@/lib/animations";

interface Props {
  address: string;
  chain: string;
}

function shortAddr(addr: string | null) {
  if (!addr) return "-";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function AddressCell({ address: addr }: { address: string | null }) {
  if (!addr) return <span className="text-muted-foreground">-</span>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="font-mono text-xs cursor-help">{shortAddr(addr)}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-mono text-xs">{addr}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function TransactionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent className="p-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16 ml-auto" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function TransactionTable({ address, chain }: Props) {
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setPageIndex(0);
  }, [address, chain]);

  const {
    data,
    error,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["transactions", address, chain],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      api.getTransactions(address, chain, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: TransactionsResponse) => lastPage.page_key ?? undefined,
    enabled: !!address,
  });

  const pages = data?.pages ?? [];
  const current = pages[pageIndex];
  const transactions = current?.transactions ?? [];

  useEffect(() => {
    if (!pages.length) return;
    if (pageIndex > pages.length - 1) {
      setPageIndex(pages.length - 1);
    }
  }, [pages.length, pageIndex]);

  const canGoPrevious = pageIndex > 0;
  const canGoNext =
    pages.length === 0
      ? false
      : pageIndex < pages.length - 1
        ? true
        : Boolean(hasNextPage);

  const goNext = async () => {
    if (pageIndex < pages.length - 1) {
      setPageIndex((i) => i + 1);
      return;
    }
    if (hasNextPage) {
      await fetchNextPage();
      setPageIndex((i) => i + 1);
    }
  };

  const goPrevious = () => setPageIndex((i) => Math.max(0, i - 1));

  if (isPending) return <TransactionSkeleton />;
  if (error)
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Failed to load transactions
        </CardContent>
      </Card>
    );
  if (!data && !error) return null;

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem} transition={defaultTransition}>
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              Recent transfers on {chain}
              {transactions.length > 0 ? ` · ${transactions.length} on this page` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hash</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx, i) => (
                    <motion.tr
                      key={`${tx.hash}-${i}`}
                      className="border-b transition-colors hover:bg-muted/50"
                      variants={tableRowVariant}
                      initial="initial"
                      animate="animate"
                      transition={{ ...defaultTransition, delay: i * 0.02 }}
                    >
                      <TableCell>
                        <AddressCell address={tx.hash} />
                      </TableCell>
                      <TableCell>
                        <AddressCell address={tx.from_address} />
                      </TableCell>
                      <TableCell>
                        <AddressCell address={tx.to_address} />
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {typeof tx.value === "number"
                          ? tx.value.toFixed(4)
                          : tx.value}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {tx.asset}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {tx.timestamp
                          ? new Date(tx.timestamp).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </motion.tr>
                  ))}
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <CursorTablePagination
              pageIndex={pageIndex}
              itemCount={transactions.length}
              canPrevious={canGoPrevious}
              canNext={canGoNext}
              isFetchingNext={isFetchingNextPage}
              onPrevious={goPrevious}
              onNext={() => void goNext()}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
