import { Package, Tag, CheckCircle, DollarSign } from 'lucide-react'
import { useInventoryStore } from '@/stores/inventory-store'
import { formatCents } from '@/lib/utils'

export function InventoryStats() {
  const stats = useInventoryStore((state) => state.stats())

  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="rounded-lg border bg-card p-3 text-center">
        <Package className="mx-auto h-5 w-5 text-blue-500" />
        <div className="mt-1 text-2xl font-bold">{stats.inStock}</div>
        <div className="text-xs text-muted-foreground">In Stock</div>
      </div>

      <div className="rounded-lg border bg-card p-3 text-center">
        <Tag className="mx-auto h-5 w-5 text-yellow-500" />
        <div className="mt-1 text-2xl font-bold">{stats.listed}</div>
        <div className="text-xs text-muted-foreground">Listed</div>
      </div>

      <div className="rounded-lg border bg-card p-3 text-center">
        <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
        <div className="mt-1 text-2xl font-bold">{stats.sold}</div>
        <div className="text-xs text-muted-foreground">Sold</div>
      </div>

      <div className="rounded-lg border bg-card p-3 text-center">
        <DollarSign className="mx-auto h-5 w-5 text-green-600" />
        <div className="mt-1 text-lg font-bold">{formatCents(stats.totalValue)}</div>
        <div className="text-xs text-muted-foreground">Value</div>
      </div>
    </div>
  )
}
