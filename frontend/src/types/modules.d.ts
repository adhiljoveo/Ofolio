declare module "@rainbow-me/rainbowkit" {
  import { FC, ReactNode } from "react";

  interface RainbowKitProviderProps {
    children: ReactNode;
    theme?: any;
  }

  interface ConnectButtonProps {
    label?: string;
    showBalance?: boolean;
    chainStatus?: "full" | "icon" | "name" | "none";
    accountStatus?: "full" | "avatar" | "address";
  }

  export const RainbowKitProvider: FC<RainbowKitProviderProps>;
  export const ConnectButton: FC<ConnectButtonProps>;

  export function darkTheme(options?: { accentColor?: string }): any;
  export function lightTheme(options?: { accentColor?: string }): any;
  export function getDefaultConfig(config: {
    appName: string;
    projectId: string;
    chains: any;
    ssr?: boolean;
  }): any;
}

declare module "@rainbow-me/rainbowkit/styles.css";
