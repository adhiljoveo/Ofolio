"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5
        hover:border-[var(--accent-muted)] hover:shadow-lg transition-all ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
