"use client"

import { useState, useEffect } from "react"
import { Search, Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TransactionDetailModal } from "@/components/transaction-detail-modal"
import { CoinSelector, type CryptoCurrency, ALL_CRYPTOCURRENCIES } from "@/components/coin-selector"
import { CurrencySelector, FIAT_CURRENCIES, type FiatCurrency } from "@/components/currency-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import { AddressValidator } from "@/components/address-validator"
import { QRGenerator } from "@/components/qr-generator"
import { TransactionStats } from "@/components/transaction-stats"
import { RecentSearches } from "@/components/recent-searches"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { AnimatedCard } from "@/components/animated-card"

interface AddressInfo {
  address: string
  balance: number
  total_received: number
  total_sent: number
  n_tx: number
  unconfirmed_balance: number
  final_balance: number
}

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

interface ChartData {
  date: string
  balance: number
}

const COINGECKO_IDS: { [key: string]: string } = {
  btc: "bitcoin",
  ltc: "litecoin",
  doge: "dogecoin",
  dash: "dash",
  eth: "ethereum",
  bch: "bitcoin-cash",
}

export default function CryptoAddressChecker() {
  const [selectedCoin, setSelectedCoin] = useState<CryptoCurrency | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<FiatCurrency>(FIAT_CURRENCIES[0]) // USD
  const [address, setAddress] = useState("")
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(0)
  const [loadingRate, setLoadingRate] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (selectedCoin && selectedCoin.apiSupported) {
      fetchExchangeRate()
    }
  }, [selectedCoin, selectedCurrency])

  useEffect(() => {
    if (selectedCoin) {
      setAddress("")
      setAddressInfo(null)
      setTransactions([])
      setChartData([])
      setError("")
      setSelectedTransaction(null)
      setIsModalOpen(false)
    }
  }, [selectedCoin])

  const fetchExchangeRate = async () => {
    if (!selectedCoin) return

    setLoadingRate(true)
    try {
      const coinId = COINGECKO_IDS[selectedCoin.id]
      if (!coinId) {
        setLoadingRate(false)
        return
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${selectedCurrency.code.toLowerCase()}`,
      )
      const data = await response.json()
      setExchangeRate(data[coinId]?.[selectedCurrency.code.toLowerCase()] || 0)
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error)
      setExchangeRate(0)
    } finally {
      setLoadingRate(false)
    }
  }

  const validateAddress = (addr: string, coin: CryptoCurrency): boolean => {
    return coin.addressRegex.test(addr)
  }

  const formatCrypto = (units: number, coin: CryptoCurrency): string => {
    const divisor = Math.pow(10, coin.decimals)
    return (units / divisor).toFixed(coin.decimals)
  }

  const formatFiat = (cryptoAmount: number): string => {
    if (exchangeRate === 0) return "N/A"
    const value = (cryptoAmount * exchangeRate).toFixed(2)
    return `${selectedCurrency.symbol}${value}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  const processChartData = (txs: Transaction[], currentBalance: number, coin: CryptoCurrency): ChartData[] => {
    if (txs.length === 0) return []

    const sortedTxs = [...txs].sort((a, b) => new Date(a.confirmed).getTime() - new Date(b.confirmed).getTime())
    const data: ChartData[] = []
    let runningBalance = currentBalance

    for (let i = sortedTxs.length - 1; i >= 0; i--) {
      const tx = sortedTxs[i]
      const isReceived = tx.outputs.some((output) => output.addresses?.includes(address))
      const isSent = tx.inputs.some((input) => input.addresses?.includes(address))

      let balanceChange = 0
      if (isReceived && !isSent) {
        const receivedAmount = tx.outputs
          .filter((output) => output.addresses?.includes(address))
          .reduce((sum, output) => sum + output.value, 0)
        balanceChange = -receivedAmount
      } else if (isSent && !isReceived) {
        const sentAmount = tx.inputs
          .filter((input) => input.addresses?.includes(address))
          .reduce((sum, input) => sum + input.output_value, 0)
        balanceChange = sentAmount
      }

      runningBalance += balanceChange
    }

    runningBalance = currentBalance
    for (let i = sortedTxs.length - 1; i >= 0; i--) {
      const tx = sortedTxs[i]
      const cryptoBalance = Number.parseFloat(formatCrypto(runningBalance, coin))
      data.unshift({
        date: formatDate(tx.confirmed),
        balance: cryptoBalance * exchangeRate,
      })

      const isReceived = tx.outputs.some((output) => output.addresses?.includes(address))
      const isSent = tx.inputs.some((input) => input.addresses?.includes(address))

      if (isReceived && !isSent) {
        const receivedAmount = tx.outputs
          .filter((output) => output.addresses?.includes(address))
          .reduce((sum, output) => sum + output.value, 0)
        runningBalance -= receivedAmount
      } else if (isSent && !isReceived) {
        const sentAmount = tx.inputs
          .filter((input) => input.addresses?.includes(address))
          .reduce((sum, input) => sum + input.output_value, 0)
        runningBalance += sentAmount
      }
    }

    return data.slice(-30)
  }

  const handleRecentSearch = (searchAddress: string, coinId: string) => {
    const coin = ALL_CRYPTOCURRENCIES.find((c) => c.id === coinId)
    if (coin) {
      setSelectedCoin(coin)
      setAddress(searchAddress)

      setTimeout(() => {
        fetchAddressDataForAddress(searchAddress, coin)
      }, 100)
    }
  }

  const fetchAddressDataForAddress = async (targetAddress: string, coin: CryptoCurrency) => {
    if (!validateAddress(targetAddress, coin)) {
      setError(`Please enter a valid ${coin.name} address`)
      return
    }

    if (!coin.apiSupported) {
      setError(`${coin.name} is not supported yet. Please select Bitcoin, Litecoin, Dogecoin, or Dash.`)
      return
    }

    setLoading(true)
    setError("")

    try {
      const addressResponse = await fetch(`https://api.blockcypher.com/v1/${coin.id}/main/addrs/${targetAddress}`)
      if (!addressResponse.ok) {
        throw new Error("Address not found or API error")
      }
      const addressData: AddressInfo = await addressResponse.json()
      setAddressInfo(addressData)

      const txResponse = await fetch(
        `https://api.blockcypher.com/v1/${coin.id}/main/addrs/${targetAddress}/full?limit=50`,
      )
      if (txResponse.ok) {
        const txData = await txResponse.json()
        setTransactions(txData.txs || [])
        setChartData(processChartData(txData.txs || [], addressData.balance, coin))
      }

      if ((window as any).addToSearchHistory) {
        ;(window as any).addToSearchHistory(targetAddress, coin)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch address data")
    } finally {
      setLoading(false)
    }
  }

  // Update the original fetchAddressData function
  const fetchAddressData = async () => {
    if (!selectedCoin) {
      setError("Please select a cryptocurrency first")
      return
    }

    await fetchAddressDataForAddress(address, selectedCoin)
  }

  const getTransactionType = (tx: Transaction): "sent" | "received" | "self" => {
    const isReceived = tx.outputs.some((output) => output.addresses?.includes(address))
    const isSent = tx.inputs.some((input) => input.addresses?.includes(address))

    if (isReceived && isSent) return "self"
    if (isReceived) return "received"
    return "sent"
  }

  const getTransactionAmount = (tx: Transaction): number => {
    const type = getTransactionType(tx)

    if (type === "received") {
      return tx.outputs
        .filter((output) => output.addresses?.includes(address))
        .reduce((sum, output) => sum + output.value, 0)
    } else if (type === "sent") {
      return tx.inputs
        .filter((input) => input.addresses?.includes(address))
        .reduce((sum, input) => sum + input.output_value, 0)
    }
    return tx.total
  }

  const filterTransactions = (type: "all" | "sent" | "received"): Transaction[] => {
    if (type === "all") return transactions
    return transactions.filter((tx) => {
      const txType = getTransactionType(tx)
      return type === "sent" ? txType === "sent" : txType === "received"
    })
  }

  const openTransactionModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  const closeTransactionModal = () => {
    setSelectedTransaction(null)
    setIsModalOpen(false)
  }

  const getAddressPlaceholder = (coin: CryptoCurrency): string => {
    const examples: { [key: string]: string } = {
      btc: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      ltc: "LdP8Qox1VAhCzLJNqrr74YovaWYyNBUWvL",
      doge: "DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L",
      dash: "XuUGbU5Q8nV6C5rUHNJhbqd5QQvpqe2HXK",
    }
    return `Enter ${coin.name} address (e.g., ${examples[coin.id] || "address"})`
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div
            className={`flex items-center justify-between mb-8 ${isPageLoaded ? "animate-fade-in-up" : "animate-on-load"}`}
          >
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Cryptocurrency Address Checker
              </h1>
              <p className="text-muted-foreground">Check balances and transactions for multiple cryptocurrencies</p>
            </div>
            <div className="transition-transform duration-200 hover:scale-105">
              <ThemeToggle />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Coin Selection */}
            <div className={`space-y-6 ${isPageLoaded ? "animate-slide-in-left" : "animate-on-load"}`}>
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Cryptocurrency</h2>
                <AnimatedCard delay={100}>
                  <CoinSelector selectedCoin={selectedCoin} onCoinSelect={setSelectedCoin} />
                </AnimatedCard>
              </div>

              {selectedCoin && (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-medium mb-3">Select Currency</h3>
                  <AnimatedCard delay={200}>
                    <div className="p-4">
                      <CurrencySelector selectedCurrency={selectedCurrency} onCurrencyChange={setSelectedCurrency} />
                      {loadingRate && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                          <p className="text-sm text-muted-foreground">Loading exchange rate...</p>
                        </div>
                      )}
                      {exchangeRate > 0 && (
                        <p className="text-sm text-muted-foreground mt-2 animate-fade-in">
                          1 {selectedCoin.symbol} = {selectedCurrency.symbol}
                          {exchangeRate.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </AnimatedCard>
                </div>
              )}

              {/* Recent Searches */}
              <div className="animate-fade-in animate-delay-300">
                <RecentSearches onSelectSearch={handleRecentSearch} />
              </div>
            </div>

            {/* Right Column - Address Input and Results */}
            <div className={`lg:col-span-2 space-y-6 ${isPageLoaded ? "animate-slide-in-right" : "animate-on-load"}`}>
              {selectedCoin ? (
                <>
                  {/* Address Input */}
                  <AnimatedCard delay={100}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl transition-transform duration-200 hover:scale-110">
                          {selectedCoin.icon}
                        </span>
                        <Wallet className="h-5 w-5" />
                        {selectedCoin.name} Address Lookup
                      </CardTitle>
                      <CardDescription>
                        Enter a valid {selectedCoin.name} address to view balance and transactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Input
                          placeholder={getAddressPlaceholder(selectedCoin)}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="focus-ring transition-all duration-200"
                        />
                        <Button
                          onClick={fetchAddressData}
                          disabled={loading || !selectedCoin.apiSupported}
                          className="transition-all duration-200 hover:scale-105"
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                        {address && selectedCoin && (
                          <div className="animate-fade-in">
                            <QRGenerator
                              address={address}
                              coinName={selectedCoin.name}
                              coinSymbol={selectedCoin.symbol}
                            />
                          </div>
                        )}
                      </div>

                      <div className="transition-all duration-300">
                        <AddressValidator address={address} selectedCoin={selectedCoin} />
                      </div>

                      {error && (
                        <Alert className="mt-4 animate-fade-in" variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </AnimatedCard>

                  {/* Loading State */}
                  {loading && <LoadingSkeleton />}

                  {/* Address Info Cards */}
                  {addressInfo && !loading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                      {[
                        {
                          title: "Current Balance",
                          icon: <Wallet className="h-4 w-4 text-muted-foreground" />,
                          value:
                            exchangeRate > 0
                              ? formatFiat(Number.parseFloat(formatCrypto(addressInfo.balance, selectedCoin)))
                              : `${formatCrypto(addressInfo.balance, selectedCoin)} ${selectedCoin.symbol}`,
                          subtitle:
                            exchangeRate > 0
                              ? `${formatCrypto(addressInfo.balance, selectedCoin)} ${selectedCoin.symbol}`
                              : `${addressInfo.n_tx} transactions`,
                        },
                        {
                          title: "Total Received",
                          icon: <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />,
                          value:
                            exchangeRate > 0
                              ? formatFiat(Number.parseFloat(formatCrypto(addressInfo.total_received, selectedCoin)))
                              : `${formatCrypto(addressInfo.total_received, selectedCoin)} ${selectedCoin.symbol}`,
                          subtitle:
                            exchangeRate > 0
                              ? `${formatCrypto(addressInfo.total_received, selectedCoin)} ${selectedCoin.symbol}`
                              : "All time received",
                        },
                        {
                          title: "Total Sent",
                          icon: <ArrowUpRight className="h-4 w-4 text-muted-foreground" />,
                          value:
                            exchangeRate > 0
                              ? formatFiat(Number.parseFloat(formatCrypto(addressInfo.total_sent, selectedCoin)))
                              : `${formatCrypto(addressInfo.total_sent, selectedCoin)} ${selectedCoin.symbol}`,
                          subtitle:
                            exchangeRate > 0
                              ? `${formatCrypto(addressInfo.total_sent, selectedCoin)} ${selectedCoin.symbol}`
                              : "All time sent",
                        },
                      ].map((stat, index) => (
                        <AnimatedCard key={stat.title} delay={(index + 1) * 100} className="smooth-hover">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            {stat.icon}
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                          </CardContent>
                        </AnimatedCard>
                      ))}
                    </div>
                  )}

                  {/* Transaction Statistics */}
                  {transactions.length > 0 && !loading && (
                    <div className="space-y-4 animate-fade-in animate-delay-400">
                      <h3 className="text-lg font-semibold">Transaction Statistics</h3>
                      <TransactionStats
                        transactions={transactions}
                        userAddress={address}
                        selectedCoin={selectedCoin}
                        selectedCurrency={selectedCurrency}
                        exchangeRate={exchangeRate}
                      />
                    </div>
                  )}

                  {/* Balance Chart */}
                  {chartData.length > 0 && !loading && (
                    <AnimatedCard delay={500} className="smooth-hover">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Balance Over Time ({selectedCurrency.code})
                        </CardTitle>
                        <CardDescription>Historical balance changes (last 30 transactions)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                              <XAxis dataKey="date" className="text-muted-foreground" fontSize={12} />
                              <YAxis className="text-muted-foreground" fontSize={12} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "6px",
                                  color: "hsl(var(--card-foreground))",
                                }}
                                formatter={(value: number) => [
                                  `${selectedCurrency.symbol}${value.toFixed(2)}`,
                                  "Balance",
                                ]}
                              />
                              <Line
                                type="monotone"
                                dataKey="balance"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </AnimatedCard>
                  )}

                  {/* Transaction History */}
                  {transactions.length > 0 && !loading && (
                    <AnimatedCard delay={600} className="smooth-hover">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-lg transition-transform duration-200 hover:scale-110">
                            {selectedCoin.icon}
                          </span>
                          Transaction History
                        </CardTitle>
                        <CardDescription>View all transactions for this {selectedCoin.name} address</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="all" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="all" className="transition-all duration-200">
                              All ({transactions.length})
                            </TabsTrigger>
                            <TabsTrigger value="received" className="transition-all duration-200">
                              Received ({filterTransactions("received").length})
                            </TabsTrigger>
                            <TabsTrigger value="sent" className="transition-all duration-200">
                              Sent ({filterTransactions("sent").length})
                            </TabsTrigger>
                          </TabsList>

                          {["all", "received", "sent"].map((tabValue) => (
                            <TabsContent key={tabValue} value={tabValue} className="mt-6">
                              <div className="space-y-4 max-h-96 overflow-y-auto">
                                {filterTransactions(tabValue as "all" | "sent" | "received").map((tx, index) => {
                                  const txType = getTransactionType(tx)
                                  const amount = getTransactionAmount(tx)
                                  const cryptoAmount = Number.parseFloat(formatCrypto(amount, selectedCoin))

                                  return (
                                    <div
                                      key={tx.hash}
                                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-all duration-200 cursor-pointer smooth-hover"
                                      onClick={() => openTransactionModal(tx)}
                                      style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-muted transition-colors duration-200">
                                          {txType === "received" ? (
                                            <ArrowDownLeft className="h-4 w-4" />
                                          ) : (
                                            <ArrowUpRight className="h-4 w-4" />
                                          )}
                                        </div>
                                        <div>
                                          <div className="font-medium">{tx.hash.substring(0, 16)}...</div>
                                          <div className="text-sm text-muted-foreground">
                                            {formatDate(tx.confirmed)} • Block {tx.block_height}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-bold">
                                          {txType === "received" ? "+" : "-"}
                                          {formatFiat(cryptoAmount)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {formatCrypto(amount, selectedCoin)} {selectedCoin.symbol}
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="text-xs mt-1 transition-colors duration-200"
                                        >
                                          {tx.block_height ? "Confirmed" : "Pending"}
                                        </Badge>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </TabsContent>
                          ))}
                        </Tabs>
                      </CardContent>
                    </AnimatedCard>
                  )}
                </>
              ) : (
                <AnimatedCard delay={100}>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center animate-fade-in">
                      <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4 transition-transform duration-300 hover:scale-110" />
                      <h3 className="text-lg font-medium mb-2">Select a Cryptocurrency</h3>
                      <p className="text-muted-foreground">Choose a cryptocurrency from the list to get started</p>
                    </div>
                  </CardContent>
                </AnimatedCard>
              )}
            </div>
          </div>

          {selectedTransaction && selectedCoin && (
            <TransactionDetailModal
              transaction={selectedTransaction}
              isOpen={isModalOpen}
              onClose={closeTransactionModal}
              userAddress={address}
              selectedCoin={selectedCoin}
              selectedCurrency={selectedCurrency}
              exchangeRate={exchangeRate}
            />
          )}
        </div>
      </div>
    </div>
  )
}
