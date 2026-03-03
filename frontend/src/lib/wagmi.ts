"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { SUPPORTED_CHAINS } from "./chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

export const wagmiConfig = getDefaultConfig({
  appName: "OFolio",
  projectId,
  chains: SUPPORTED_CHAINS as any,
  ssr: true,
});
