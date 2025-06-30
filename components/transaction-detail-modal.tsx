"use client"
import { ExternalLink, Copy, Info, Clock, Shield, DollarSign, Hash, Users } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
  confirmations?: number
}

interface TransactionDetailModalProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
  userAddress: string
  selectedCoin: CryptoCurrency
  selectedCurrency: FiatCurrency
  exchangeRate: number
}

export function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
  userAddress,
  selectedCoin,
  selectedCurrency,
  exchangeRate,
}: TransactionDetailModalProps) {
  if (!transaction) return null

  const formatCrypto = (units: number): string => {
    const divisor = Math.pow(10, selectedCoin.decimals)
    return (units / divisor).toFixed(selectedCoin.decimals)
  }

  const formatFiat = (cryptoAmount: number): string => {
    const value = (cryptoAmount * exchangeRate).toFixed(2)
    return `${selectedCurrency.symbol}${value}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getTransactionType = (): "sent" | "received" | "self" => {
    const isReceived = transaction.outputs.some((output) => output.addresses?.includes(userAddress))
    const isSent = transaction.inputs.some((input) => input.addresses?.includes(userAddress))

    if (isReceived && isSent) return "self"
    if (isReceived) return "received"
    return "sent"
  }

  const getTransactionAmount = (): number => {
    const type = getTransactionType()

    if (type === "received") {
      return transaction.outputs
        .filter((output) => output.addresses?.includes(userAddress))
        .reduce((sum, output) => sum + output.value, 0)
    } else if (type === "sent") {
      return transaction.inputs
        .filter((input) => input.addresses?.includes(userAddress))
        .reduce((sum, input) => sum + input.output_value, 0)
    }
    return transaction.total
  }

  const getSenderAddresses = (): string[] => {
    return transaction.inputs.flatMap((input) => input.addresses || [])
  }

  const getReceiverAddresses = (): string[] => {
    return transaction.outputs.flatMap((output) => output.addresses || [])
  }

  const txType = getTransactionType()
  const txAmount = getTransactionAmount()
  const cryptoAmount = Number.parseFloat(formatCrypto(txAmount))
  const senderAddresses = getSenderAddresses()
  const receiverAddresses = getReceiverAddresses()

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  const getConfirmationStatus = (): {
    status: string
    variant: "default" | "secondary" | "destructive" | "outline"
  } => {
    const confirmations = transaction.confirmations || 0

    if (confirmations === 0) {
      return { status: "Unconfirmed", variant: "outline" }
    } else if (confirmations < 6) {
      return { status: `${confirmations} Confirmations`, variant: "secondary" }
    } else {
      return { status: "Confirmed", variant: "default" }
    }
  }

  const confirmationInfo = getConfirmationStatus()

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="text-2xl">{selectedCoin.icon}</span>
              <Hash className="h-5 w-5" />
              {selectedCoin.name} Transaction Details
            </DialogTitle>
            <DialogDescription>Detailed information about this {selectedCoin.name} transaction</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Transaction Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Transaction Overview
                  </span>
                  <Badge variant={confirmationInfo.variant}>{confirmationInfo.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            The amount of {selectedCoin.symbol} {txType === "received" ? "received" : "sent"} in this
                            transaction
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="text-2xl font-bold">{formatFiat(cryptoAmount)}</div>
                    <div className="text-sm text-muted-foreground">
                      {txType === "received" ? "+" : "-"}
                      {formatCrypto(txAmount)} {selectedCoin.symbol}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">Transaction Fee</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>The fee paid to miners for processing this transaction</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="text-lg font-medium">
                      {formatFiat(Number.parseFloat(formatCrypto(transaction.fees)))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCrypto(transaction.fees)} {selectedCoin.symbol}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Date & Time</span>
                    </div>
                    <div className="font-medium">{formatDateTime(transaction.confirmed)}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Block Height</span>
                    </div>
                    <div className="font-medium">#{transaction.block_height}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Hash */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Transaction Hash
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="flex-1 text-sm font-mono break-all">{transaction.hash}</code>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(transaction.hash)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-2 mt-4">
                  {selectedCoin.blockExplorer.map((explorer) => (
                    <Button
                      key={explorer.name}
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`${explorer.url}/transaction/${transaction.hash}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on {explorer.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Addresses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sender Addresses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Sender Address{senderAddresses.length > 1 ? "es" : ""}
                    <Badge variant="outline">{senderAddresses.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {senderAddresses.map((address, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <code className="flex-1 text-sm font-mono break-all">
                        {address === userAddress ? <span className="font-bold">{address} (You)</span> : address}
                      </code>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(address)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Receiver Addresses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Receiver Address{receiverAddresses.length > 1 ? "es" : ""}
                    <Badge variant="outline">{receiverAddresses.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {receiverAddresses.map((address, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <code className="flex-1 text-sm font-mono break-all">
                        {address === userAddress ? <span className="font-bold">{address} (You)</span> : address}
                      </code>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(address)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
