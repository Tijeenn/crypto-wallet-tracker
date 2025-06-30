"use client"

import { BarChart3, Calendar, TrendingUp, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CryptoCurrency } from "./coin-selector"
import type { FiatCurrency } from "./currency-selector"

interface Transaction {
  hash: string
  block_height: number
  confirmed: string
  received: string
  total: number
  fees: number
  inputs: Array<{
    addresses: string[]
    output_value: number
  }>
  outputs: Array<{
    addresses: string[]
    value: number
  }>
}

interface TransactionStatsProps {
  transactions: Transaction[]
  userAddress: string
  selectedCoin: CryptoCurrency
  selectedCurrency: FiatCurrency
  exchangeRate: number
}

export function TransactionStats({
  transactions,
  userAddress,
  selectedCoin,
  selectedCurrency,
  exchangeRate,
}: TransactionStatsProps) {
  if (transactions.length === 0) return null

  const formatCrypto = (units: number): string => {
    const divisor = Math.pow(10, selectedCoin.decimals)
    return (units / divisor).toFixed(selectedCoin.decimals)
  }

  const formatFiat = (cryptoAmount: number): string => {
    if (exchangeRate === 0) return "N/A"
    const value = (cryptoAmount * exchangeRate).toFixed(2)
    return `${selectedCurrency.symbol}${value}`
  }

  const getTransactionType = (tx: Transaction): "sent" | "received" | "self" => {
    const isReceived = tx.outputs.some((output) => output.addresses?.includes(userAddress))
    const isSent = tx.inputs.some((input) => input.addresses?.includes(userAddress))

    if (isReceived && isSent) return "self"
    if (isReceived) return "received"
    return "sent"
  }

  const getTransactionAmount = (tx: Transaction): number => {
    const type = getTransactionType(tx)

    if (type === "received") {
      return tx.outputs
        .filter((output) => output.addresses?.includes(userAddress))
        .reduce((sum, output) => sum + output.value, 0)
    } else if (type === "sent") {
      return tx.inputs
        .filter((input) => input.addresses?.includes(userAddress))
        .reduce((sum, input) => sum + input.output_value, 0)
    }
    return tx.total
  }

  // Calculate statistics
  const receivedTxs = transactions.filter((tx) => getTransactionType(tx) === "received")
  const sentTxs = transactions.filter((tx) => getTransactionType(tx) === "sent")

  const avgReceivedAmount =
    receivedTxs.length > 0 ? receivedTxs.reduce((sum, tx) => sum + getTransactionAmount(tx), 0) / receivedTxs.length : 0

  const avgSentAmount =
    sentTxs.length > 0 ? sentTxs.reduce((sum, tx) => sum + getTransactionAmount(tx), 0) / sentTxs.length : 0

  const totalFees = transactions.reduce((sum, tx) => sum + tx.fees, 0)

  // Find most active day
  const dayActivity: { [key: string]: number } = {}
  transactions.forEach((tx) => {
    const date = new Date(tx.confirmed).toDateString()
    dayActivity[date] = (dayActivity[date] || 0) + 1
  })

  const mostActiveDay = Object.entries(dayActivity).reduce(
    (max, [date, count]) => (count > max.count ? { date, count } : max),
    { date: "", count: 0 },
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Received</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">
            {exchangeRate > 0
              ? formatFiat(Number.parseFloat(formatCrypto(avgReceivedAmount)))
              : `${formatCrypto(avgReceivedAmount)} ${selectedCoin.symbol}`}
          </div>
          <p className="text-xs text-muted-foreground">{receivedTxs.length} received transactions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Sent</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">
            {exchangeRate > 0
              ? formatFiat(Number.parseFloat(formatCrypto(avgSentAmount)))
              : `${formatCrypto(avgSentAmount)} ${selectedCoin.symbol}`}
          </div>
          <p className="text-xs text-muted-foreground">{sentTxs.length} sent transactions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Fees Paid</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">
            {exchangeRate > 0
              ? formatFiat(Number.parseFloat(formatCrypto(totalFees)))
              : `${formatCrypto(totalFees)} ${selectedCoin.symbol}`}
          </div>
          <p className="text-xs text-muted-foreground">Across {transactions.length} transactions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Active Day</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{mostActiveDay.count} txs</div>
          <p className="text-xs text-muted-foreground">
            {mostActiveDay.date ? new Date(mostActiveDay.date).toLocaleDateString() : "N/A"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
