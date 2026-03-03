"use client";

import Spinner from "./Spinner";
import { motion } from "framer-motion";

interface Props {
  label?: string;
  variant?: "default" | "cards" | "table" | "grid";
}

function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-[var(--bg-tertiary)] ${className}`} />
  );
}

function CardsSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonPulse className="h-6 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 space-y-3">
            <SkeletonPulse className="h-3 w-20" />
            <SkeletonPulse className="h-7 w-32" />
          </div>
        ))}
      </div>
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6">
        <SkeletonPulse className="h-4 w-36 mb-4" />
        <SkeletonPulse className="h-[200px] w-full" />
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonPulse className="h-6 w-40" />
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)]">
          <SkeletonPulse className="h-4 w-48" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-5 py-3 border-b border-[var(--border)] flex gap-6">
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-4 w-16 ml-auto" />
            <SkeletonPulse className="h-4 w-16" />
            <SkeletonPulse className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonPulse className="h-6 w-24" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl overflow-hidden">
            <SkeletonPulse className="w-full aspect-square" />
            <div className="p-3 space-y-2">
              <SkeletonPulse className="h-4 w-3/4" />
              <SkeletonPulse className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoadingState({ label = "Loading data...", variant = "default" }: Props) {
  if (variant === "cards") return <CardsSkeleton />;
  if (variant === "table") return <TableSkeleton />;
  if (variant === "grid") return <GridSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 gap-4"
    >
      <Spinner size={44} />
      <p className="text-sm text-[var(--text-muted)] animate-pulse">{label}</p>
    </motion.div>
  );
}
