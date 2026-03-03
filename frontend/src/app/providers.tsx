"use client";

import { ReactNode, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { ThemeProvider, useTheme } from "next-themes";
import { wagmiConfig } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const WC_NOISE = [
  "Connection interrupted",
  "WebSocket connection failed",
  "Subscriber is not active",
  "No matching key",
  "Missing or invalid",
  "relay connection",
  "subscribe",
  "socket stalled",
];

function isWalletConnectNoise(msg: string): boolean {
  return WC_NOISE.some((pattern) => msg.includes(pattern));
}

function RainbowKitThemed({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  return (
    <RainbowKitProvider
      theme={resolvedTheme === "dark" ? darkTheme({ accentColor: "#6366f1" }) : lightTheme({ accentColor: "#4f46e5" })}
    >
      {children}
    </RainbowKitProvider>
  );
}

function GlobalErrorSuppressor({ children }: { children: ReactNode }) {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || String(event.reason || "");
      if (isWalletConnectNoise(msg)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      }
    };

    const onError = (event: ErrorEvent) => {
      const msg = event.message || event.error?.message || "";
      if (isWalletConnectNoise(msg)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
      }
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection, true);
    window.addEventListener("error", onError, true);

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection, true);
      window.removeEventListener("error", onError, true);
    };
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }));

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <GlobalErrorSuppressor>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitThemed>{children}</RainbowKitThemed>
          </QueryClientProvider>
        </WagmiProvider>
      </GlobalErrorSuppressor>
    </ThemeProvider>
  );
}
