import { TrendingUp, DollarSign, Package, Percent } from 'lucide-react'

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value="$0" />
        <StatCard icon={TrendingUp} label="Total Profit" value="$0" />
        <StatCard icon={Package} label="Items Sold" value="0" />
        <StatCard icon={Percent} label="Avg ROI" value="0%" />
      </div>

      {/* Charts Placeholder */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Profit Over Time</h2>
        <div className="flex h-48 items-center justify-center rounded-lg border">
          <p className="text-muted-foreground">
            Chart will appear when you have sales data
          </p>
        </div>
      </div>

      {/* Platform Breakdown Placeholder */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Sales by Platform</h2>
        <div className="flex h-48 items-center justify-center rounded-lg border">
          <p className="text-muted-foreground">
            Platform breakdown will appear here
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrendingUp
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  )
}
