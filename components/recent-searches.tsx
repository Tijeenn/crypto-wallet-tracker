"use client"

import { useState, useEffect } from "react"
import { History, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CryptoCurrency } from "./coin-selector"

interface SearchHistory {
  address: string
  coinId: string
  coinName: string
  coinSymbol: string
  timestamp: number
}

interface RecentSearchesProps {
  onSelectSearch: (address: string, coinId: string) => void
}

export function RecentSearches({ onSelectSearch }: RecentSearchesProps) {
  const [searches, setSearches] = useState<SearchHistory[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("crypto-address-searches")
    if (saved) {
      try {
        setSearches(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to parse search history:", error)
      }
    }
  }, [])

  const addSearch = (address: string, coin: CryptoCurrency) => {
    const newSearch: SearchHistory = {
      address,
      coinId: coin.id,
      coinName: coin.name,
      coinSymbol: coin.symbol,
      timestamp: Date.now(),
    }

    const updatedSearches = [
      newSearch,
      ...searches.filter((s) => !(s.address === address && s.coinId === coin.id)),
    ].slice(0, 10) // Keep only last 10 searches

    setSearches(updatedSearches)
    localStorage.setItem("crypto-address-searches", JSON.stringify(updatedSearches))
  }

  const removeSearch = (index: number) => {
    const updatedSearches = searches.filter((_, i) => i !== index)
    setSearches(updatedSearches)
    localStorage.setItem("crypto-address-searches", JSON.stringify(updatedSearches))
  }

  const clearAll = () => {
    setSearches([])
    localStorage.removeItem("crypto-address-searches")
  }

  // Expose addSearch function globally so it can be called from parent
  useEffect(() => {
    ;(window as any).addToSearchHistory = addSearch
  }, [searches])

  if (searches.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Searches
          </span>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {searches.map((search, index) => (
            <div
              key={`${search.address}-${search.coinId}-${index}`}
              className="flex items-center justify-between p-2 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex-1 cursor-pointer" onClick={() => onSelectSearch(search.address, search.coinId)}>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {search.coinSymbol}
                  </Badge>
                  <span className="text-sm font-medium">{search.coinName}</span>
                </div>
                <code className="text-xs text-muted-foreground">{search.address.substring(0, 20)}...</code>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeSearch(index)} className="h-8 w-8 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
