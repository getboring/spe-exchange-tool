import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Loader2 } from 'lucide-react'
import { useInventoryStore } from '@/stores/inventory-store'
import { InventoryStats } from '@/components/inventory/inventory-stats'
import { InventoryFilters } from '@/components/inventory/inventory-filters'
import { InventoryItemCard } from '@/components/inventory/inventory-item-card'

export function InventoryPage() {
  const navigate = useNavigate()
  const { loading, error, fetchItems, filteredItems } = useInventoryStore()
  const items = filteredItems()

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button
          onClick={() => navigate('/scan')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Camera className="h-4 w-4" />
          Scan Items
        </button>
      </div>

      {/* Stats */}
      <InventoryStats />

      {/* Filters */}
      <InventoryFilters />

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

      {/* Items list */}
      {!loading && items.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Showing {items.length} item{items.length !== 1 ? 's' : ''}
          </div>
          {items.map((item) => (
            <InventoryItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No items in inventory yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Scan some items to get started!
          </p>
          <button
            onClick={() => navigate('/scan')}
            className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
          >
            Start Scanning
          </button>
        </div>
      )}
    </div>
  )
}
