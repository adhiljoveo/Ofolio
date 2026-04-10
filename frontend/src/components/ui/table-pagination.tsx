"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export const DEFAULT_TABLE_PAGE_SIZE = 10;

type Props = {
  className?: string;
  /** 1-based current page */
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  /** When false, pagination is not rendered (e.g. empty or single page) */
  show?: boolean;
};

export function TablePagination({
  className,
  page,
  pageSize,
  totalItems,
  onPageChange,
  show = true,
}: Props) {
  if (!show || totalItems === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{start}</span>–
        <span className="font-medium text-foreground">{end}</span> of{" "}
        <span className="font-medium text-foreground">{totalItems}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-xs text-muted-foreground tabular-nums">
          Page {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

type CursorProps = {
  className?: string;
  pageIndex: number;
  itemCount: number;
  canPrevious: boolean;
  canNext: boolean;
  isFetchingNext?: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

/** For cursor-based APIs (e.g. one chunk of results per request). */
export function CursorTablePagination({
  className,
  pageIndex,
  itemCount,
  canPrevious,
  canNext,
  isFetchingNext,
  onPrevious,
  onNext,
}: CursorProps) {
  if (itemCount === 0) return null;
  if (!canPrevious && !canNext && !isFetchingNext) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-xs text-muted-foreground">
        Page <span className="font-medium text-foreground">{pageIndex + 1}</span>
        <span>
          {" "}
          · {itemCount} transfer{itemCount === 1 ? "" : "s"}
        </span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!canPrevious}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!canNext || isFetchingNext}
          aria-label="Next page"
        >
          Next
          {isFetchingNext ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
