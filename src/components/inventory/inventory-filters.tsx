import { Search, X } from 'lucide-react'
import { useInventoryStore } from '@/stores/inventory-store'
import { PLATFORMS, ITEM_STATUSES } from '@/lib/constants'

export function InventoryFilters() {
  const { filters, setFilter, resetFilters } = useInventoryStore()

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.platform !== 'all' ||
    filters.search !== ''

  return (
    <div className="space-y-3">
      {/* Search and main filters row */}
      <div className="flex gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder="Search items..."
            aria-label="Search inventory"
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4"
          />
          {filters.search && (
            <button
              onClick={() => setFilter('search', '')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value as typeof filters.status)}
          className="rounded-lg border bg-background px-3 py-2"
        >
          <option value="all">All Status</option>
          {ITEM_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status === 'in_stock' ? 'In Stock' : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Extended filters row */}
      <div className="flex flex-wrap gap-2">
        {/* Platform filter */}
        <select
          value={filters.platform}
          onChange={(e) => setFilter('platform', e.target.value as typeof filters.platform)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Platforms</option>
          {PLATFORMS.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-') as [
              typeof filters.sortBy,
              typeof filters.sortOrder
            ]
            setFilter('sortBy', sortBy)
            setFilter('sortOrder', sortOrder)
          }}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="value-desc">Highest Value</option>
          <option value="value-asc">Lowest Value</option>
          <option value="profit-desc">Highest Profit</option>
          <option value="profit-asc">Lowest Profit</option>
        </select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
