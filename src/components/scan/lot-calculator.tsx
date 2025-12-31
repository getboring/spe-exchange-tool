import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useScanStore } from '@/stores/scan-store'
import { useSettingsStore } from '@/stores/settings-store'
import { DEAL_SOURCES } from '@/lib/constants'

interface LotCalculatorProps {
  onSave: (askingPrice: number, source: string, notes: string) => void
  saving?: boolean
}

export function LotCalculator({ onSave, saving }: LotCalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [askingPrice, setAskingPrice] = useState('')
  const [source, setSource] = useState<string>(DEAL_SOURCES[0])
  const [notes, setNotes] = useState('')

  const { scannedItems } = useScanStore()
  const { targetRoi } = useSettingsStore()

  // Calculate totals
  const calculations = useMemo(() => {
    const totalValue = scannedItems.reduce((sum, item) => {
      const value =
        item.condition_guess === 'sealed'
          ? item.new_price
          : item.condition_guess === 'cib'
            ? item.cib_price
            : item.loose_price
      return sum + value
    }, 0)

    const price = parseFloat(askingPrice) || 0
    const profit = totalValue - price
    const roi = price > 0 ? (profit / price) * 100 : 0

    // Calculate max counter-offer for target ROI
    // targetROI = (totalValue - maxOffer) / maxOffer * 100
    // targetROI * maxOffer = (totalValue - maxOffer) * 100
    // targetROI * maxOffer + 100 * maxOffer = totalValue * 100
    // maxOffer * (targetROI + 100) = totalValue * 100
    // maxOffer = totalValue * 100 / (targetROI + 100)
    const maxOffer = (totalValue * 100) / (targetRoi + 100)

    // Get recommendation
    let recommendation = { text: 'PASS', className: 'text-red-500' }
    if (roi >= 100) {
      recommendation = { text: 'STRONG BUY', className: 'text-green-600 font-bold' }
    } else if (roi >= 50) {
      recommendation = { text: 'BUY', className: 'text-green-500' }
    } else if (roi >= targetRoi) {
      recommendation = { text: 'OK', className: 'text-yellow-500' }
    } else if (roi >= 0) {
      recommendation = { text: 'PASS', className: 'text-orange-500' }
    } else {
      recommendation = { text: 'HARD PASS', className: 'text-red-600 font-bold' }
    }

    // Categorize items
    const sortedItems = [...scannedItems].sort((a, b) => {
      const aVal =
        a.condition_guess === 'sealed'
          ? a.new_price
          : a.condition_guess === 'cib'
            ? a.cib_price
            : a.loose_price
      const bVal =
        b.condition_guess === 'sealed'
          ? b.new_price
          : b.condition_guess === 'cib'
            ? b.cib_price
            : b.loose_price
      return bVal - aVal
    })

    const carriers = sortedItems.filter((item) => {
      const val =
        item.condition_guess === 'sealed'
          ? item.new_price
          : item.condition_guess === 'cib'
            ? item.cib_price
            : item.loose_price
      return val >= 20
    })

    const deadWeight = sortedItems.filter((item) => {
      const val =
        item.condition_guess === 'sealed'
          ? item.new_price
          : item.condition_guess === 'cib'
            ? item.cib_price
            : item.loose_price
      return val < 20
    })

    return {
      totalValue,
      profit,
      roi,
      maxOffer,
      recommendation,
      carriers,
      deadWeight,
    }
  }, [scannedItems, askingPrice, targetRoi])

  const handleSave = () => {
    const price = parseFloat(askingPrice) || 0
    onSave(price, source, notes)
  }

  if (scannedItems.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4"
      >
        <h2 className="text-lg font-semibold">Lot Calculator</h2>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t p-4 space-y-4">
          {/* Input row */}
          <div>
            <label htmlFor="asking-price" className="text-sm text-muted-foreground">Asking Price</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                id="asking-price"
                type="number"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border bg-background py-2 pl-7 pr-3"
              />
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded bg-muted p-3">
              <div className="text-muted-foreground">Total Value</div>
              <div className="text-lg font-bold">${calculations.totalValue.toFixed(2)}</div>
            </div>
            <div className="rounded bg-muted p-3">
              <div className="text-muted-foreground">Profit</div>
              <div
                className={`text-lg font-bold ${
                  calculations.profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                ${calculations.profit.toFixed(2)}
              </div>
            </div>
            <div className="rounded bg-muted p-3">
              <div className="text-muted-foreground">ROI</div>
              <div
                className={`text-lg font-bold ${
                  calculations.roi >= targetRoi ? 'text-green-600' : 'text-orange-500'
                }`}
              >
                {calculations.roi.toFixed(0)}%
              </div>
            </div>
            <div className="rounded bg-muted p-3">
              <div className="text-muted-foreground">Recommendation</div>
              <div className={`text-lg ${calculations.recommendation.className}`}>
                {calculations.recommendation.text}
              </div>
            </div>
          </div>

          {/* Max offer */}
          <div className="rounded bg-secondary/50 p-3 text-sm">
            <span className="text-muted-foreground">
              Max counter-offer for {targetRoi}% ROI:{' '}
            </span>
            <span className="font-medium">${calculations.maxOffer.toFixed(2)}</span>
          </div>

          {/* Breakdown */}
          {(calculations.carriers.length > 0 || calculations.deadWeight.length > 0) && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium text-green-600">
                  Carriers ({calculations.carriers.length})
                </div>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  {calculations.carriers.slice(0, 3).map((item) => (
                    <li key={item.id} className="truncate">
                      {item.name}
                    </li>
                  ))}
                  {calculations.carriers.length > 3 && (
                    <li>+{calculations.carriers.length - 3} more</li>
                  )}
                </ul>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">
                  Dead Weight ({calculations.deadWeight.length})
                </div>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  {calculations.deadWeight.slice(0, 3).map((item) => (
                    <li key={item.id} className="truncate">
                      {item.name}
                    </li>
                  ))}
                  {calculations.deadWeight.length > 3 && (
                    <li>+{calculations.deadWeight.length - 3} more</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Source and notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="deal-source" className="text-sm text-muted-foreground">Source</label>
              <select
                id="deal-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
              >
                {DEAL_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="deal-notes" className="text-sm text-muted-foreground">Notes</label>
              <input
                id="deal-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional"
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
              />
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || scannedItems.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              'Buy Lot → Add to Inventory'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
