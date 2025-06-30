"use client"

import { useState } from "react"
import { QrCode, Copy, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

interface QRGeneratorProps {
  address: string
  coinName: string
  coinSymbol: string
}

export function QRGenerator({ address, coinName, coinSymbol }: QRGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const generateQRCodeURL = (text: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
  }

  const shareAddress = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${coinName} Address`,
          text: `${coinName} (${coinSymbol}) Address: ${address}`,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      copyAddress()
    }
  }

  if (!address) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="h-4 w-4 mr-2" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{coinName} Address QR Code</DialogTitle>
          <DialogDescription>Scan this QR code to copy the {coinName} address</DialogDescription>
        </DialogHeader>
        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <img
              src={generateQRCodeURL(address) || "/placeholder.svg"}
              alt={`QR Code for ${coinName} address`}
              className="mb-4 rounded-lg"
              width={200}
              height={200}
            />
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground mb-2">{coinSymbol} Address:</p>
              <code className="text-xs bg-muted p-2 rounded break-all">{address}</code>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyAddress} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={shareAddress} variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
