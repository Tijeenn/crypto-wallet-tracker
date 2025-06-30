"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  animation?: "fadeInUp" | "slideInLeft" | "slideInRight" | "scaleIn"
}

export function AnimatedCard({ children, className, delay = 0, animation = "scaleIn" }: AnimatedCardProps) {
  const animationClass = {
    fadeInUp: "animate-fade-in-up",
    slideInLeft: "animate-slide-in-left",
    slideInRight: "animate-slide-in-right",
    scaleIn: "animate-scale-in",
  }[animation]

  const delayClass = delay > 0 ? `animate-delay-${delay}` : ""

  return <Card className={cn("animate-on-load smooth-hover", animationClass, delayClass, className)}>{children}</Card>
}
