"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { CryptoCurrency } from "./coin-selector"

interface AddressValidatorProps {
  address: string
  selectedCoin: CryptoCurrency | null
}

export function AddressValidator({ address, selectedCoin }: AddressValidatorProps) {
  const [validationStatus, setValidationStatus] = useState<"valid" | "invalid" | "empty" | "unknown">("empty")

  useEffect(() => {
    if (!address.trim()) {
      setValidationStatus("empty")
      return
    }

    if (!selectedCoin) {
      setValidationStatus("unknown")
      return
    }

    const isValid = selectedCoin.addressRegex.test(address)
    setValidationStatus(isValid ? "valid" : "invalid")
  }, [address, selectedCoin])

  if (validationStatus === "empty") return null

  const getStatusConfig = () => {
    switch (validationStatus) {
      case "valid":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: "Valid Address",
          variant: "default" as const,
          className: "text-green-600 dark:text-green-400",
        }
      case "invalid":
        return {
          icon: <XCircle className="h-4 w-4" />,
          text: "Invalid Address",
          variant: "destructive" as const,
          className: "text-red-600 dark:text-red-400",
        }
      case "unknown":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: "Select Coin First",
          variant: "outline" as const,
          className: "text-yellow-600 dark:text-yellow-400",
        }
      default:
        return null
    }
  }

  const config = getStatusConfig()
  if (!config) return null

  return (
    <div className="flex items-center gap-2 mt-2">
      <Badge variant={config.variant} className={`${config.className} flex items-center gap-1`}>
        {config.icon}
        {config.text}
      </Badge>
    </div>
  )
}
