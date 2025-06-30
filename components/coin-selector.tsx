"use client"

import { useState } from "react"
import { Search, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface CryptoCurrency {
  id: string
  name: string
  symbol: string
  icon: string
  network: string
  addressRegex: RegExp
  decimals: number
  blockExplorer: {
    name: string
    url: string
  }[]
  apiSupported: boolean
  comingSoon?: boolean
}

export const ALL_CRYPTOCURRENCIES: CryptoCurrency[] = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    icon: "₿",
    network: "main",
    addressRegex: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
    decimals: 8,
    blockExplorer: [
      { name: "Blockchair", url: "https://blockchair.com/bitcoin" },
      { name: "BlockCypher", url: "https://live.blockcypher.com/btc" },
    ],
    apiSupported: true,
  },
  {
    id: "ltc",
    name: "Litecoin",
    symbol: "LTC",
    icon: "Ł",
    network: "main",
    addressRegex: /^[LM][a-km-zA-HJ-NP-Z1-9]{25,34}$|^ltc1[a-z0-9]{39,59}$/,
    decimals: 8,
    blockExplorer: [
      { name: "Blockchair", url: "https://blockchair.com/litecoin" },
      { name: "BlockCypher", url: "https://live.blockcypher.com/ltc" },
    ],
    apiSupported: true,
  },
  {
    id: "doge",
    name: "Dogecoin",
    symbol: "DOGE",
    icon: "Ð",
    network: "main",
    addressRegex: /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/,
    decimals: 8,
    blockExplorer: [
      { name: "Blockchair", url: "https://blockchair.com/dogecoin" },
      { name: "BlockCypher", url: "https://live.blockcypher.com/doge" },
    ],
    apiSupported: true,
  },
  {
    id: "dash",
    name: "Dash",
    symbol: "DASH",
    icon: "Đ",
    network: "main",
    addressRegex: /^X[1-9A-HJ-NP-Za-km-z]{33}$/,
    decimals: 8,
    blockExplorer: [
      { name: "Blockchair", url: "https://blockchair.com/dash" },
      { name: "BlockCypher", url: "https://live.blockcypher.com/dash" },
    ],
    apiSupported: true,
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    icon: "Ξ",
    network: "main",
    addressRegex: /^0x[a-fA-F0-9]{40}$/,
    decimals: 18,
    blockExplorer: [
      { name: "Etherscan", url: "https://etherscan.io" },
      { name: "Blockchair", url: "https://blockchair.com/ethereum" },
    ],
    apiSupported: false,
    comingSoon: true,
  },
  {
    id: "bch",
    name: "Bitcoin Cash",
    symbol: "BCH",
    icon: "₿",
    network: "main",
    addressRegex: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^q[a-z0-9]{41}$|^p[a-z0-9]{41}$/,
    decimals: 8,
    blockExplorer: [
      { name: "Blockchair", url: "https://blockchair.com/bitcoin-cash" },
      { name: "Bitcoin.com", url: "https://explorer.bitcoin.com/bch" },
    ],
    apiSupported: false,
    comingSoon: true,
  },
  {
    id: "xrp",
    name: "XRP",
    symbol: "XRP",
    icon: "◉",
    network: "main",
    addressRegex: /^r[0-9a-zA-Z]{24,34}$/,
    decimals: 6,
    blockExplorer: [{ name: "XRPScan", url: "https://xrpscan.com" }],
    apiSupported: false,
    comingSoon: true,
  },
  {
    id: "ada",
    name: "Cardano",
    symbol: "ADA",
    icon: "₳",
    network: "main",
    addressRegex: /^addr1[a-z0-9]+$/,
    decimals: 6,
    blockExplorer: [{ name: "Cardanoscan", url: "https://cardanoscan.io" }],
    apiSupported: false,
    comingSoon: true,
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    icon: "◎",
    network: "main",
    addressRegex: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    decimals: 9,
    blockExplorer: [{ name: "Solscan", url: "https://solscan.io" }],
    apiSupported: false,
    comingSoon: true,
  },
  {
    id: "matic",
    name: "Polygon",
    symbol: "MATIC",
    icon: "⬟",
    network: "main",
    addressRegex: /^0x[a-fA-F0-9]{40}$/,
    decimals: 18,
    blockExplorer: [{ name: "PolygonScan", url: "https://polygonscan.com" }],
    apiSupported: false,
    comingSoon: true,
  },
]

interface CoinSelectorProps {
  selectedCoin: CryptoCurrency | null
  onCoinSelect: (coin: CryptoCurrency) => void
}

export function CoinSelector({ selectedCoin, onCoinSelect }: CoinSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCoins = ALL_CRYPTOCURRENCIES.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const supportedCoins = filteredCoins.filter((coin) => coin.apiSupported)
  const comingSoonCoins = filteredCoins.filter((coin) => coin.comingSoon)

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-64">
            <div className="space-y-3">
              {/* Supported Coins */}
              {supportedCoins.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Available Now</h4>
                  {supportedCoins.map((coin) => (
                    <div
                      key={coin.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                        selectedCoin?.id === coin.id ? "bg-accent border-primary" : ""
                      }`}
                      onClick={() => onCoinSelect(coin)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{coin.icon}</span>
                        <div>
                          <div className="font-medium">{coin.name}</div>
                          <div className="text-sm text-muted-foreground">{coin.symbol}</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Coming Soon Coins */}
              {comingSoonCoins.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Coming Soon</h4>
                  {comingSoonCoins.map((coin) => (
                    <div
                      key={coin.id}
                      className="flex items-center justify-between p-3 rounded-lg border opacity-60 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{coin.icon}</span>
                        <div>
                          <div className="font-medium">{coin.name}</div>
                          <div className="text-sm text-muted-foreground">{coin.symbol}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Soon
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
