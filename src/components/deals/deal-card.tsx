import { useNavigate } from 'react-router-dom'
import { Package, TrendingUp, Calendar, ChevronRight } from 'lucide-react'
import type { Deal } from '@/types/database'
import { formatCents } from '@/lib/utils'

interface DealWithCounts extends Deal {
  itemCount?: number
  soldCount?: number
}

interface DealCardProps {
  deal: DealWithCounts
}

export function DealCard({ deal }: DealCardProps) {
  const navigate = useNavigate()

  const progress = deal.itemCount ? ((deal.soldCount || 0) / deal.itemCount) * 100 : 0
  const isCompleted = deal.status === 'completed'

  const estimatedProfit = (deal.estimated_value || 0) - (deal.total_cost || 0)
  const roi = deal.total_cost ? (estimatedProfit / deal.total_cost) * 100 : 0

  return (
    <button
      onClick={() => navigate(`/deals/${deal.id}`)}
      className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent/50"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Source and Date */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">{deal.source || 'Unknown Source'}</span>
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
              {deal.itemCount || 0} items
            </span>
          </div>

          {deal.notes && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
              {deal.notes}
            </p>
          )}
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {deal.soldCount || 0} / {deal.itemCount || 0} sold
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              isCompleted ? 'bg-green-500' : 'bg-primary'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Cost</p>
          <p className="font-medium">{formatCents(deal.total_cost)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {isCompleted ? 'Profit' : 'Est. Profit'}
          </p>
          <p
            className={`font-medium ${
              (isCompleted ? (deal.actual_profit || 0) : estimatedProfit) >= 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {formatCents(isCompleted ? deal.actual_profit : estimatedProfit)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">ROI</p>
          <p className="flex items-center gap-1 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            {isCompleted && deal.actual_roi !== null
              ? `${deal.actual_roi.toFixed(0)}%`
              : `${roi.toFixed(0)}%`}
          </p>
        </div>
      </div>
    </button>
  )
}
