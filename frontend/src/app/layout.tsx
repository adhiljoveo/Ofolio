import type { Metadata } from "next";
import { Providers } from "./providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "OFolio - DeFi Portfolio Dashboard",
  description: "Track assets, PNL, liquidity & staking across chains.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var noise=["Connection interrupted","subscribe","WebSocket","Subscriber is not active","No matching key","relay"];
            function isNoise(m){return noise.some(function(p){return m&&m.indexOf(p)!==-1});}
            window.addEventListener("error",function(e){if(isNoise(e.message||"")){e.stopImmediatePropagation();e.preventDefault();}},true);
            window.addEventListener("unhandledrejection",function(e){var m=e.reason&&e.reason.message||String(e.reason||"");if(isNoise(m)){e.stopImmediatePropagation();e.preventDefault();}},true);
          })();
        `}} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
