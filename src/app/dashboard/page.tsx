import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Camera,
  Package,
  TrendingUp,
  FileText,
  DollarSign,
  ShoppingBag,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { useInventoryStore } from '@/stores/inventory-store'
import { useDealsStore } from '@/stores/deals-store'
import { formatCents } from '@/lib/utils'
import type { Item, Deal } from '@/types/database'

export function DashboardPage() {
  const navigate = useNavigate()
  const { items, fetchItems } = useInventoryStore()
  const { deals, fetchDeals } = useDealsStore()

  useEffect(() => {
    fetchItems()
    fetchDeals()
  }, [fetchItems, fetchDeals])

  // Calculate stats
  const inStockCount = items.filter((i) => i.status === 'in_stock').length
  const listedCount = items.filter((i) => i.status === 'listed').length
  const soldCount = items.filter((i) => i.status === 'sold').length
  const totalProfit = items
    .filter((i) => i.status === 'sold')
    .reduce((sum, i) => sum + (i.actual_profit || 0), 0)
  const totalValue = items
    .filter((i) => i.status !== 'sold')
    .reduce((sum, i) => sum + (i.estimated_value || 0), 0)

  // Get recent items (last 5 sold or added)
  const recentActivity = [...items]
    .sort((a, b) => {
      const aDate = a.status === 'sold' && a.sale_date ? new Date(a.sale_date) : new Date(a.created_at)
      const bDate = b.status === 'sold' && b.sale_date ? new Date(b.sale_date) : new Date(b.created_at)
      return bDate.getTime() - aDate.getTime()
    })
    .slice(0, 5)

  // Get active deals
  const activeDeals = deals
    .filter((d) => d.status === 'active')
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="In Stock"
          value={inStockCount.toString()}
          icon={Package}
          color="text-blue-600"
        />
        <StatCard
          label="Listed"
          value={listedCount.toString()}
          icon={ShoppingBag}
          color="text-amber-600"
        />
        <StatCard
          label="Sold"
          value={soldCount.toString()}
          icon={CheckCircle}
          color="text-green-600"
        />
        <StatCard
          label="Profit"
          value={formatCents(totalProfit)}
          icon={DollarSign}
          color={totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}
        />
      </div>

      {/* Inventory Value */}
      <div className="rounded-lg border bg-gradient-to-r from-primary/10 to-primary/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Inventory Value</p>
            <p className="text-3xl font-bold">{formatCents(totalValue)}</p>
            <p className="text-sm text-muted-foreground">
              {inStockCount + listedCount} items
            </p>
          </div>
          <TrendingUp className="h-12 w-12 text-primary/20" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickAction to="/scan" icon={Camera} label="Scan Items" primary />
          <QuickAction to="/inventory" icon={Package} label="Inventory" />
          <QuickAction to="/deals" icon={FileText} label="Deals" />
          <QuickAction to="/analytics" icon={TrendingUp} label="Analytics" />
        </div>
      </div>

      {/* Active Deals */}
      {activeDeals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Deals</h2>
            <Link
              to="/deals"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {activeDeals.map((deal) => (
              <ActiveDealCard key={deal.id} deal={deal} onClick={() => navigate(`/deals/${deal.id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Link
            to="/inventory"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recentActivity.length > 0 ? (
          <div className="space-y-2">
            {recentActivity.map((item) => (
              <ActivityItem key={item.id} item={item} onClick={() => navigate(`/inventory/${item.id}`)} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border p-6 text-center">
            <Camera className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No activity yet</p>
            <p className="text-sm text-muted-foreground">
              Start by scanning some items!
            </p>
            <Link
              to="/scan"
              className="mt-4 inline-block rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
            >
              Scan Items
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  icon: typeof Package
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

function QuickAction({
  to,
  icon: Icon,
  label,
  primary,
}: {
  to: string
  icon: typeof Camera
  label: string
  primary?: boolean
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
        primary
          ? 'border-primary bg-primary/5 hover:bg-primary/10'
          : 'hover:bg-accent'
      }`}
    >
      <Icon className={`h-6 w-6 ${primary ? 'text-primary' : ''}`} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

interface DealWithCounts extends Deal {
  itemCount?: number
  soldCount?: number
}

function ActiveDealCard({ deal, onClick }: { deal: DealWithCounts; onClick: () => void }) {
  const progress = deal.itemCount ? ((deal.soldCount || 0) / deal.itemCount) * 100 : 0
  const estimatedProfit = (deal.estimated_value || 0) - (deal.total_cost || 0)

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:bg-accent/50"
    >
      <div className="flex-1">
        <p className="font-medium">{deal.source || 'Unknown Source'}</p>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{deal.soldCount || 0}/{deal.itemCount || 0} sold</span>
          <span>·</span>
          <span className={estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
            {formatCents(estimatedProfit)} est. profit
          </span>
        </div>
      </div>
      <div className="ml-4 w-16">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {Math.round(progress)}%
        </p>
      </div>
    </button>
  )
}

function ActivityItem({ item, onClick }: { item: Item; onClick: () => void }) {
  const isSold = item.status === 'sold'
  const date = isSold && item.sale_date ? new Date(item.sale_date) : new Date(item.created_at)

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:bg-accent/50"
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          isSold ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'
        }`}
      >
        {isSold ? (
          <DollarSign className="h-4 w-4 text-green-600" />
        ) : (
          <Package className="h-4 w-4 text-blue-600" />
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          {isSold ? (
            <span className="text-green-600">
              Sold for {formatCents(item.sale_price)} · {formatCents(item.actual_profit)} profit
            </span>
          ) : (
            <span>Added to inventory · {formatCents(item.estimated_value)}</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        {formatRelativeTime(date)}
      </div>
    </button>
  )
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
