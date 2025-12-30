import { useScanStore } from '@/stores/scan-store'
import { ScannedItemCard } from './scanned-item-card'

export function ScanResults() {
  const { scannedItems, error } = useScanStore()

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (scannedItems.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-center text-muted-foreground">
        <p>No items scanned yet.</p>
        <p className="mt-1 text-sm">Take a photo or upload an image to get started.</p>
      </div>
    )
  }

  // Calculate totals
  const totalValue = scannedItems.reduce((sum, item) => {
    const value =
      item.condition_guess === 'sealed'
        ? item.new_price
        : item.condition_guess === 'cib'
          ? item.cib_price
          : item.loose_price
    return sum + value
  }, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Scanned Items ({scannedItems.length})
        </h2>
        <span className="text-sm font-medium text-green-600">
          Total: ${totalValue.toFixed(2)}
        </span>
      </div>

      <div className="space-y-3">
        {scannedItems.map((item) => (
          <ScannedItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
