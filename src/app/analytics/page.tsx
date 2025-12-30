import { useEffect, useMemo } from 'react'
import {
  TrendingUp,
  DollarSign,
  Package,
  Percent,
  Calendar,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { useInventoryStore } from '@/stores/inventory-store'
import { useDealsStore } from '@/stores/deals-store'
import { formatCents } from '@/lib/utils'
import type { Item } from '@/types/database'

export function AnalyticsPage() {
  const { items, fetchItems } = useInventoryStore()
  const { fetchDeals } = useDealsStore()

  useEffect(() => {
    fetchItems()
    fetchDeals()
  }, [fetchItems, fetchDeals])

  const soldItems = useMemo(() => items.filter((i) => i.status === 'sold'), [items])

  const stats = useMemo(() => {
    const totalRevenue = soldItems.reduce((sum, i) => sum + (i.sale_price || 0), 0)
    const totalProfit = soldItems.reduce((sum, i) => sum + (i.actual_profit || 0), 0)
    const totalCost = soldItems.reduce((sum, i) => sum + (i.purchase_cost || 0), 0)
    const totalFees = soldItems.reduce((sum, i) => sum + (i.sale_fees || 0), 0)
    const avgRoi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

    return {
      totalRevenue,
      totalProfit,
      totalCost,
      totalFees,
      itemsSold: soldItems.length,
      avgRoi,
    }
  }, [soldItems])

  // Monthly profit data
  const monthlyData = useMemo(() => {
    const months: Record<string, { revenue: number; profit: number; count: number }> = {}

    soldItems.forEach((item) => {
      if (!item.sale_date) return
      const date = new Date(item.sale_date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!months[key]) {
        months[key] = { revenue: 0, profit: 0, count: 0 }
      }
      months[key].revenue += item.sale_price || 0
      months[key].profit += item.actual_profit || 0
      months[key].count += 1
    })

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([key, data]) => ({
        month: formatMonth(key),
        ...data,
      }))
  }, [soldItems])

  // Platform breakdown
  const platformData = useMemo(() => {
    const platforms: Record<string, { revenue: number; profit: number; count: number; fees: number }> = {}

    soldItems.forEach((item) => {
      const platform = item.sale_platform || 'Unknown'
      if (!platforms[platform]) {
        platforms[platform] = { revenue: 0, profit: 0, count: 0, fees: 0 }
      }
      platforms[platform].revenue += item.sale_price || 0
      platforms[platform].profit += item.actual_profit || 0
      platforms[platform].count += 1
      platforms[platform].fees += item.sale_fees || 0
    })

    return Object.entries(platforms)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.profit - a.profit)
  }, [soldItems])

  // Top performing items
  const topItems = useMemo(() => {
    return [...soldItems]
      .sort((a, b) => (b.actual_profit || 0) - (a.actual_profit || 0))
      .slice(0, 5)
  }, [soldItems])

  // Worst performing items
  const worstItems = useMemo(() => {
    return [...soldItems]
      .sort((a, b) => (a.actual_profit || 0) - (b.actual_profit || 0))
      .slice(0, 5)
      .filter((i) => (i.actual_profit || 0) < 0)
  }, [soldItems])

  const maxMonthlyProfit = Math.max(...monthlyData.map((d) => Math.abs(d.profit)), 1)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCents(stats.totalRevenue)}
          color="text-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Profit"
          value={formatCents(stats.totalProfit)}
          color={stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <StatCard
          icon={Package}
          label="Items Sold"
          value={stats.itemsSold.toString()}
          color="text-purple-600"
        />
        <StatCard
          icon={Percent}
          label="Avg ROI"
          value={`${stats.avgRoi.toFixed(0)}%`}
          color={stats.avgRoi >= 0 ? 'text-green-600' : 'text-red-600'}
        />
      </div>

      {/* Fee Summary */}
      <div className="rounded-lg border p-4">
        <h2 className="font-semibold">Cost Breakdown</h2>
        <div className="mt-3 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{formatCents(stats.totalCost)}</p>
            <p className="text-sm text-muted-foreground">Total Cost</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{formatCents(stats.totalFees)}</p>
            <p className="text-sm text-muted-foreground">Total Fees</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCents(stats.totalProfit)}
            </p>
            <p className="text-sm text-muted-foreground">Net Profit</p>
          </div>
        </div>
      </div>

      {/* Monthly Profit Chart */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h2 className="font-semibold">Profit by Month</h2>
        </div>

        {monthlyData.length > 0 ? (
          <div className="mt-4 space-y-3">
            {monthlyData.map((month) => (
              <div key={month.month} className="flex items-center gap-3">
                <span className="w-12 text-sm text-muted-foreground">{month.month}</span>
                <div className="flex-1">
                  <div className="flex h-6 items-center">
                    <div
                      className={`h-full rounded ${month.profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{
                        width: `${(Math.abs(month.profit) / maxMonthlyProfit) * 100}%`,
                        minWidth: '4px',
                      }}
                    />
                  </div>
                </div>
                <span className={`w-20 text-right text-sm font-medium ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCents(month.profit)}
                </span>
                <span className="w-12 text-right text-xs text-muted-foreground">
                  {month.count} sold
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex h-32 items-center justify-center text-muted-foreground">
            No sales data yet
          </div>
        )}
      </div>

      {/* Platform Breakdown */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          <h2 className="font-semibold">Sales by Platform</h2>
        </div>

        {platformData.length > 0 ? (
          <div className="mt-4 space-y-3">
            {platformData.map((platform) => (
                <div key={platform.name} className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{platform.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {platform.count} sales
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-medium">{formatCents(platform.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fees</p>
                      <p className="font-medium text-amber-600">{formatCents(platform.fees)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Profit</p>
                      <p className={`font-medium ${platform.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCents(platform.profit)}
                      </p>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex h-32 items-center justify-center text-muted-foreground">
            No platform data yet
          </div>
        )}
      </div>

      {/* Top Performers */}
      {topItems.length > 0 && (
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-green-600" />
            <h2 className="font-semibold">Top Performers</h2>
          </div>
          <div className="mt-3 space-y-2">
            {topItems.map((item, index) => (
              <ItemRow key={item.id} item={item} rank={index + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Worst Performers */}
      {worstItems.length > 0 && (
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <ArrowDownRight className="h-5 w-5 text-red-600" />
            <h2 className="font-semibold">Losses</h2>
          </div>
          <div className="mt-3 space-y-2">
            {worstItems.map((item, index) => (
              <ItemRow key={item.id} item={item} rank={index + 1} isLoss />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {soldItems.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No sales data yet</p>
          <p className="text-sm text-muted-foreground">
            Analytics will appear once you record some sales
          </p>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof TrendingUp
  label: string
  value: string
  color: string
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  )
}

function ItemRow({ item, rank, isLoss }: { item: Item; rank: number; isLoss?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2">
      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
        isLoss ? 'bg-red-100 text-red-600 dark:bg-red-900' : 'bg-green-100 text-green-600 dark:bg-green-900'
      }`}>
        {rank}
      </span>
      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          {item.platform} · Sold on {item.sale_platform}
        </p>
      </div>
      <div className="text-right">
        <p className={`font-medium ${(item.actual_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCents(item.actual_profit)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatCents(item.purchase_cost)} → {formatCents(item.sale_price)}
        </p>
      </div>
    </div>
  )
}

function formatMonth(key: string): string {
  const [year, month] = key.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short' })
}
