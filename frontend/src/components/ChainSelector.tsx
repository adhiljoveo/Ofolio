"use client";

import { CHAIN_NAME_MAP } from "@/lib/chains";

interface Props {
  value: string;
  onChange: (chain: string) => void;
}

const chains = Object.entries(CHAIN_NAME_MAP);

export default function ChainSelector({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm
        focus:outline-none focus:border-[var(--accent)] cursor-pointer"
    >
      {chains.map(([id, name]) => (
        <option key={id} value={id}>{name}</option>
      ))}
    </select>
  );
}
