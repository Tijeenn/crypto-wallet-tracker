"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="skeleton h-4 w-24 rounded"></div>
              <div className="skeleton h-4 w-4 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="skeleton h-8 w-32 rounded mb-2"></div>
              <div className="skeleton h-3 w-20 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card className="animate-scale-in animate-delay-400">
        <CardHeader>
          <div className="skeleton h-6 w-48 rounded mb-2"></div>
          <div className="skeleton h-4 w-64 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="skeleton h-80 w-full rounded"></div>
        </CardContent>
      </Card>

      {/* Transaction List Skeleton */}
      <Card className="animate-scale-in animate-delay-500">
        <CardHeader>
          <div className="skeleton h-6 w-40 rounded mb-2"></div>
          <div className="skeleton h-4 w-56 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="skeleton h-8 w-8 rounded-full"></div>
                  <div>
                    <div className="skeleton h-4 w-32 rounded mb-2"></div>
                    <div className="skeleton h-3 w-24 rounded"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="skeleton h-4 w-20 rounded mb-2"></div>
                  <div className="skeleton h-3 w-16 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
