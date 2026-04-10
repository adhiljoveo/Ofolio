"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CHAIN_NAME_MAP } from "@/lib/chains"

interface AppHeaderProps {
  title?: string
  address?: string
  chain?: string
  onChainChange?: (chain: string) => void
  manualAddress?: string
  onManualAddressChange?: (address: string) => void
}

export function AppHeader({
  title = "Dashboard",
  address,
  chain,
  onChainChange,
  manualAddress,
  onManualAddressChange,
}: AppHeaderProps) {
  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ""

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <h1 className="text-sm font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        {address && (
          <Badge variant="secondary" className="font-mono text-xs">
            {shortAddr}
          </Badge>
        )}

        {chain && onChainChange && (
          <Select value={chain} onValueChange={onChainChange}>
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CHAIN_NAME_MAP).map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {onManualAddressChange && (
          <div className="relative hidden lg:block">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Paste address..."
              value={manualAddress || ""}
              onChange={(e) => onManualAddressChange(e.target.value)}
              className="h-8 w-[200px] pl-8 text-xs"
            />
          </div>
        )}

        <ThemeToggle />
      </div>
    </header>
  )
}
