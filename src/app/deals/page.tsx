import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Camera, Loader2 } from 'lucide-react'
import { useDealsStore } from '@/stores/deals-store'
import { DealsStats } from '@/components/deals/deals-stats'
import { DealCard } from '@/components/deals/deal-card'
import type { DealStatus } from '@/lib/constants'

export function DealsPage() {
  const navigate = useNavigate()
  const { loading, error, fetchDeals, filteredDeals, filters, setFilter } = useDealsStore()
  const deals = filteredDeals()

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  const tabs: { label: string; value: DealStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deals</h1>
        <button
          onClick={() => navigate('/scan')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Camera className="h-4 w-4" />
          New Deal
        </button>
      </div>

      {/* Stats */}
      <DealsStats />

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter('status', tab.value)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              filters.status === tab.value
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Deals list */}
      {!loading && deals.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Showing {deals.length} deal{deals.length !== 1 ? 's' : ''}
          </div>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && deals.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <Plus className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            {filters.status === 'all'
              ? 'No deals yet.'
              : `No ${filters.status} deals.`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a deal when you buy a lot to track your profit.
          </p>
          <button
            onClick={() => navigate('/scan')}
            className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
          >
            Scan a Lot
          </button>
        </div>
      )}
    </div>
  )
}
