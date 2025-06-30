"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface FiatCurrency {
  code: string
  symbol: string
  name: string
}

export const FIAT_CURRENCIES: FiatCurrency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
]

interface CurrencySelectorProps {
  selectedCurrency: FiatCurrency
  onCurrencyChange: (currency: FiatCurrency) => void
}

export function CurrencySelector({ selectedCurrency, onCurrencyChange }: CurrencySelectorProps) {
  return (
    <Select
      value={selectedCurrency.code}
      onValueChange={(value) => {
        const currency = FIAT_CURRENCIES.find((c) => c.code === value)
        if (currency) onCurrencyChange(currency)
      }}
    >
      <SelectTrigger className="w-48">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span>{selectedCurrency.symbol}</span>
            <span>{selectedCurrency.code}</span>
            <span className="text-muted-foreground">- {selectedCurrency.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {FIAT_CURRENCIES.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            <div className="flex items-center gap-2">
              <span>{currency.symbol}</span>
              <span>{currency.code}</span>
              <span className="text-muted-foreground">- {currency.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
