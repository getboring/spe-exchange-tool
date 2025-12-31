import { useState, useEffect, useCallback } from 'react'
import { X, DollarSign } from 'lucide-react'
import type { Item, ItemUpdate } from '@/types/database'
import { SELL_PLATFORMS } from '@/lib/constants'
import { autoCalculateFees } from '@/lib/fees'
import { formatCents, toDollars, toCents } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settings-store'
import { supabase } from '@/lib/supabase'

interface RecordSaleModalProps {
  item: Item
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

export function RecordSaleModal({ item, isOpen, onClose, onSaved }: RecordSaleModalProps) {
  const { ebayStoreType, promotedPercent } = useSettingsStore()

  const [salePrice, setSalePrice] = useState('')
  const [platform, setPlatform] = useState<string>('eBay')
  const [shippingCharged, setShippingCharged] = useState('')
  const [shippingCost, setShippingCost] = useState('')
  const [manualFees, setManualFees] = useState('')
  const [useAutoFees, setUseAutoFees] = useState(true)
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill sale price with estimated value
  useEffect(() => {
    if (isOpen && item.estimated_value) {
      setSalePrice(toDollars(item.estimated_value).toFixed(2))
    }
  }, [isOpen, item.estimated_value])

  const calculatedFees = useAutoFees
    ? autoCalculateFees(
        platform,
        parseFloat(salePrice) || 0,
        parseFloat(shippingCharged) || 0,
        item.type,
        { storeType: ebayStoreType, promotedPercent }
      )
    : parseFloat(manualFees) || 0

  const profit =
    (parseFloat(salePrice) || 0) -
    toDollars(item.purchase_cost || 0) -
    calculatedFees -
    (parseFloat(shippingCost) || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const saleUpdate: ItemUpdate = {
        status: 'sold',
        sale_price: toCents(parseFloat(salePrice) || 0),
        sale_platform: platform,
        sale_date: saleDate,
        sale_fees: toCents(calculatedFees),
        shipping_cost: toCents(parseFloat(shippingCost) || 0),
        actual_profit: toCents(profit),
      }
      const { error: updateError } = await supabase
        .from('items')
        .update(saleUpdate)
        .eq('id', item.id)

      if (updateError) throw updateError

      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record sale')
    } finally {
      setSaving(false)
    }
  }

  // Handle ESC key to close modal
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onKeyDown={handleKeyDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold">Record Sale</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          {item.name} ({item.platform})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sale Price */}
          <div>
            <label className="text-sm text-muted-foreground">Sale Price</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="number"
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                required
                className="w-full rounded-lg border bg-background py-2 pl-7 pr-3"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="text-sm text-muted-foreground">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
            >
              {SELL_PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Shipping */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Shipping Charged</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={shippingCharged}
                  onChange={(e) => setShippingCharged(e.target.value)}
                  className="w-full rounded-lg border bg-background py-2 pl-7 pr-3"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Your Shipping Cost</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  className="w-full rounded-lg border bg-background py-2 pl-7 pr-3"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Fees */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Fees</label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useAutoFees}
                  onChange={(e) => setUseAutoFees(e.target.checked)}
                  className="h-4 w-4"
                />
                Auto-calculate
              </label>
            </div>
            {useAutoFees ? (
              <div className="mt-1 rounded-lg bg-muted px-3 py-2 text-sm">
                ${calculatedFees.toFixed(2)} (estimated {platform} fees)
              </div>
            ) : (
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={manualFees}
                  onChange={(e) => setManualFees(e.target.value)}
                  className="w-full rounded-lg border bg-background py-2 pl-7 pr-3"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          {/* Sale Date */}
          <div>
            <label className="text-sm text-muted-foreground">Sale Date</label>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
            />
          </div>

          {/* Profit Summary */}
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cost</span>
              <span>{formatCents(item.purchase_cost)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sale Price</span>
              <span>${parseFloat(salePrice || '0').toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Fees + Shipping</span>
              <span>-${(calculatedFees + (parseFloat(shippingCost) || 0)).toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex items-center justify-between font-semibold">
              <span>Profit</span>
              <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                ${profit.toFixed(2)}
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border px-4 py-2 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !salePrice}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white disabled:opacity-50"
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <DollarSign className="h-4 w-4" />
                  Record Sale
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
