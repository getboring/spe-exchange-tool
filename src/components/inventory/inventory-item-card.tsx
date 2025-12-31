import { useState, memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreVertical, Pencil, Trash2, DollarSign, Tag } from 'lucide-react'
import type { Item } from '@/types/database'
import { formatCents } from '@/lib/utils'
import { useInventoryStore } from '@/stores/inventory-store'

interface InventoryItemCardProps {
  item: Item
}

export const InventoryItemCard = memo(function InventoryItemCard({ item }: InventoryItemCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()
  const { updateItem, deleteItem } = useInventoryStore()

  const { estimatedProfit, roi } = useMemo(() => {
    const profit = (item.estimated_value || 0) - (item.purchase_cost || 0)
    const roiValue = item.purchase_cost && item.purchase_cost > 0
      ? (profit / item.purchase_cost) * 100
      : 0
    return { estimatedProfit: profit, roi: roiValue }
  }, [item.estimated_value, item.purchase_cost])

  const getStatusBadge = () => {
    switch (item.status) {
      case 'in_stock':
        return <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">In Stock</span>
      case 'listed':
        return <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Listed</span>
      case 'sold':
        return <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Sold</span>
    }
  }

  const handleStatusChange = async (newStatus: Item['status']) => {
    await updateItem(item.id, { status: newStatus })
    setShowMenu(false)
  }

  const handleDelete = async () => {
    if (confirm('Delete this item?')) {
      await deleteItem(item.id)
    }
    setShowMenu(false)
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        {/* Left side - Item info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium">{item.name}</h3>
            {getStatusBadge()}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {item.platform && (
              <span className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                {item.platform}
              </span>
            )}
            {item.condition && (
              <span className="uppercase">{item.condition}</span>
            )}
            <span>{item.weight}</span>
          </div>
        </div>

        {/* Right side - Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Item options"
            className="rounded p-1 hover:bg-accent"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-48 rounded-lg border bg-popover p-1 shadow-lg">
                <button
                  onClick={() => navigate(`/inventory/${item.id}`)}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Details
                </button>
                {item.status === 'in_stock' && (
                  <button
                    onClick={() => handleStatusChange('listed')}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent"
                  >
                    <Tag className="h-4 w-4" />
                    Mark Listed
                  </button>
                )}
                {item.status !== 'sold' && (
                  <button
                    onClick={() => handleStatusChange('sold')}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent"
                  >
                    <DollarSign className="h-4 w-4" />
                    Record Sale
                  </button>
                )}
                <hr className="my-1" />
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pricing row */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex gap-4 text-muted-foreground">
          <span>
            Cost: <span className="text-foreground">{formatCents(item.purchase_cost)}</span>
          </span>
          <span>
            Value: <span className="text-foreground">{formatCents(item.estimated_value)}</span>
          </span>
        </div>

        {item.status !== 'sold' ? (
          <div className="text-right">
            <span className={estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatCents(estimatedProfit)}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">
              ({roi.toFixed(0)}%)
            </span>
          </div>
        ) : (
          <span className="font-medium text-green-600">
            +{formatCents(item.actual_profit)}
          </span>
        )}
      </div>
    </div>
  )
})
