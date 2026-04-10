import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "./providers";
import "@/styles/globals.css";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "OFolio - DeFi Portfolio Dashboard",
  description: "Track assets, PNL, liquidity & staking across chains.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function(){
            var noise=["Connection interrupted","subscribe","WebSocket","Subscriber is not active","No matching key","relay"];
            function isNoise(m){return noise.some(function(p){return m&&m.indexOf(p)!==-1});}
            window.addEventListener("error",function(e){if(isNoise(e.message||"")){e.stopImmediatePropagation();e.preventDefault();}},true);
            window.addEventListener("unhandledrejection",function(e){var m=e.reason&&e.reason.message||String(e.reason||"");if(isNoise(m)){e.stopImmediatePropagation();e.preventDefault();}},true);
          })();
        `,
          }}
        />
      </head>
      <body className={`${font.variable} font-sans min-h-screen overflow-x-hidden antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
