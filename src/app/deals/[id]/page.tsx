import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Trash2,
  Package,
  Calendar,
  TrendingUp,
  CheckCircle,
  Loader2,
  MoreVertical,
} from 'lucide-react'
import { useDealsStore } from '@/stores/deals-store'
import type { Deal, Item } from '@/types/database'
import { formatCents, toDollars } from '@/lib/utils'

interface DealWithItems extends Deal {
  items?: Item[]
  itemCount?: number
  soldCount?: number
}

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fetchDealById, updateDeal, deleteDeal } = useDealsStore()

  const [deal, setDeal] = useState<DealWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    async function loadDeal() {
      if (!id) return
      setLoading(true)
      const result = await fetchDealById(id)
      if (result) {
        setDeal(result)
      } else {
        setError('Deal not found')
      }
      setLoading(false)
    }
    loadDeal()
  }, [id, fetchDealById])

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this deal? Items will be unlinked but not deleted.')) {
      return
    }
    await deleteDeal(id)
    navigate('/deals')
  }

  const handleMarkComplete = async () => {
    if (!id || !deal) return

    // Calculate actual profit from sold items
    const soldItems = deal.items?.filter((i) => i.status === 'sold') || []
    const actualRevenue = soldItems.reduce((sum, i) => sum + (i.sale_price || 0), 0)
    const actualProfit = soldItems.reduce((sum, i) => sum + (i.actual_profit || 0), 0)
    const actualRoi = deal.total_cost ? (actualProfit / deal.total_cost) * 100 : 0

    await updateDeal(id, {
      status: 'completed',
      actual_revenue: actualRevenue,
      actual_profit: actualProfit,
      actual_roi: actualRoi,
    })

    // Refresh deal data
    const updated = await fetchDealById(id)
    if (updated) setDeal(updated)
    setShowMenu(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !deal) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/deals')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Deals
        </button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
          <p className="text-destructive">{error || 'Deal not found'}</p>
        </div>
      </div>
    )
  }

  const items = deal.items || []
  const inStockItems = items.filter((i) => i.status === 'in_stock')
  const listedItems = items.filter((i) => i.status === 'listed')
  const soldItems = items.filter((i) => i.status === 'sold')

  const progress = items.length ? (soldItems.length / items.length) * 100 : 0
  const estimatedProfit = (deal.estimated_value || 0) - (deal.total_cost || 0)
  const currentProfit = soldItems.reduce((sum, i) => sum + (i.actual_profit || 0), 0)
  const isCompleted = deal.status === 'completed'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/deals')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-2 hover:bg-accent"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border bg-background p-1 shadow-lg">
              {!isCompleted && (
                <button
                  onClick={handleMarkComplete}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark Complete
                </button>
              )}
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete Deal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Deal Info */}
      <div className="rounded-lg border p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{deal.source || 'Unknown Source'}</h1>
              {isCompleted && (
                <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                  Completed
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(deal.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />
                {items.length} items
              </span>
            </div>
          </div>
        </div>

        {deal.notes && (
          <p className="mt-3 text-sm text-muted-foreground">{deal.notes}</p>
        )}
      </div>

      {/* Progress */}
      <div className="rounded-lg border p-4">
        <h2 className="font-semibold">Progress</h2>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {soldItems.length} of {items.length} items sold
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                isCompleted ? 'bg-green-500' : 'bg-primary'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-muted-foreground">In Stock</p>
            <p className="text-lg font-semibold">{inStockItems.length}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-muted-foreground">Listed</p>
            <p className="text-lg font-semibold">{listedItems.length}</p>
          </div>
          <div className="rounded-lg bg-green-50 p-2 dark:bg-green-950">
            <p className="text-muted-foreground">Sold</p>
            <p className="text-lg font-semibold text-green-600">{soldItems.length}</p>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="rounded-lg border p-4">
        <h2 className="font-semibold">Financials</h2>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Cost</span>
            <span className="font-medium">{formatCents(deal.total_cost)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estimated Value</span>
            <span className="font-medium">{formatCents(deal.estimated_value)}</span>
          </div>
          <hr />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estimated Profit</span>
            <span
              className={`font-medium ${
                estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCents(estimatedProfit)}
            </span>
          </div>
          {(soldItems.length > 0 || isCompleted) && (
            <>
              <hr />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {isCompleted ? 'Actual Profit' : 'Profit So Far'}
                </span>
                <span
                  className={`font-medium ${
                    (isCompleted ? deal.actual_profit : currentProfit) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCents(isCompleted ? deal.actual_profit : currentProfit)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {isCompleted ? 'Actual ROI' : 'Current ROI'}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <TrendingUp className="h-4 w-4" />
                  {isCompleted && deal.actual_roi !== null
                    ? `${deal.actual_roi.toFixed(0)}%`
                    : deal.total_cost
                    ? `${((currentProfit / toDollars(deal.total_cost)) * 100).toFixed(0)}%`
                    : '0%'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="rounded-lg border p-4">
        <h2 className="font-semibold">Items ({items.length})</h2>
        <div className="mt-3 space-y-2">
          {items.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No items in this deal
            </p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/inventory/${item.id}`)}
                className="flex w-full items-center justify-between rounded-lg bg-muted/50 p-3 text-left hover:bg-muted"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.platform} · {item.condition || 'Unknown'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCents(item.estimated_value)}</p>
                  <p className="text-sm">
                    {item.status === 'sold' ? (
                      <span className="text-green-600">
                        Sold: {formatCents(item.actual_profit)} profit
                      </span>
                    ) : (
                      <span
                        className={`${
                          item.status === 'listed'
                            ? 'text-amber-600'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {item.status === 'listed' ? 'Listed' : 'In Stock'}
                      </span>
                    )}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
