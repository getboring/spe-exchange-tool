import { ShoppingBag, CheckCircle, DollarSign, TrendingUp } from 'lucide-react'
import { useDealsStore } from '@/stores/deals-store'
import { formatCents } from '@/lib/utils'

export function DealsStats() {
  const stats = useDealsStore((state) => state.stats())

  const items = [
    {
      label: 'Active Deals',
      value: stats.activeDeals.toString(),
      icon: ShoppingBag,
      color: 'text-blue-600',
    },
    {
      label: 'Completed',
      value: stats.completedDeals.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      label: 'Invested',
      value: formatCents(stats.totalInvested),
      icon: DollarSign,
      color: 'text-amber-600',
    },
    {
      label: 'Total Profit',
      value: formatCents(stats.totalProfit),
      icon: TrendingUp,
      color: stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <item.icon className={`h-4 w-4 ${item.color}`} />
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </div>
          <p className="mt-1 text-xl font-semibold">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
