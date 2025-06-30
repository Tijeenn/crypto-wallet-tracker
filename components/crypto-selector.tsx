"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

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
}

export const SUPPORTED_CRYPTOCURRENCIES: CryptoCurrency[] = [
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
    apiSupported: false, // Limited support - would need different API
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
    apiSupported: false, // Would need different API
  },
]

interface CryptoSelectorProps {
  selectedCrypto: CryptoCurrency
  onCryptoChange: (crypto: CryptoCurrency) => void
}

export function CryptoSelector({ selectedCrypto, onCryptoChange }: CryptoSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-400">Cryptocurrency:</span>
      <Select
        value={selectedCrypto.id}
        onValueChange={(value) => {
          const crypto = SUPPORTED_CRYPTOCURRENCIES.find((c) => c.id === value)
          if (crypto) onCryptoChange(crypto)
        }}
      >
        <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedCrypto.icon}</span>
              <span>{selectedCrypto.name}</span>
              <span className="text-gray-400">({selectedCrypto.symbol})</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-700 border-gray-600">
          {SUPPORTED_CRYPTOCURRENCIES.map((crypto) => (
            <SelectItem key={crypto.id} value={crypto.id} className="text-white hover:bg-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-lg">{crypto.icon}</span>
                <span>{crypto.name}</span>
                <span className="text-gray-400">({crypto.symbol})</span>
                {!crypto.apiSupported && (
                  <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-400">
                    Limited
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
