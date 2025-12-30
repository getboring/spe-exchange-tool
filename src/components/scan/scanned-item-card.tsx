import { useState } from 'react'
import { Pencil, Trash2, Check, X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import type { ScannedItem } from '@/types/database'
import { CONDITIONS, WEIGHTS } from '@/lib/constants'
import { useScanStore } from '@/stores/scan-store'

interface ScannedItemCardProps {
  item: ScannedItem
}

export function ScannedItemCard({ item }: ScannedItemCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState({
    name: item.name,
    condition_guess: item.condition_guess,
    weight: item.weight,
    loose_price: item.loose_price,
    cib_price: item.cib_price,
    new_price: item.new_price,
  })

  const { updateItem, removeItem } = useScanStore()

  const handleSave = () => {
    updateItem(item.id, editValues)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValues({
      name: item.name,
      condition_guess: item.condition_guess,
      weight: item.weight,
      loose_price: item.loose_price,
      cib_price: item.cib_price,
      new_price: item.new_price,
    })
    setIsEditing(false)
  }

  // Get confidence icon and color
  const getConfidenceIndicator = () => {
    switch (item.confidence) {
      case 'high':
        return { icon: CheckCircle, className: 'text-green-500' }
      case 'medium':
        return { icon: AlertTriangle, className: 'text-yellow-500' }
      case 'low':
        return { icon: AlertCircle, className: 'text-red-500' }
      default:
        return { icon: AlertCircle, className: 'text-muted-foreground' }
    }
  }

  const { icon: ConfidenceIcon, className: confidenceClass } = getConfidenceIndicator()

  // Get estimated value based on condition
  const getEstimatedValue = () => {
    switch (item.condition_guess) {
      case 'sealed':
        return item.new_price
      case 'cib':
        return item.cib_price
      default:
        return item.loose_price
    }
  }

  if (isEditing) {
    return (
      <div className="rounded-lg border p-4 space-y-3">
        <input
          type="text"
          value={editValues.name}
          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
          className="w-full rounded border bg-background px-2 py-1 text-sm"
          placeholder="Item name"
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            value={editValues.condition_guess}
            onChange={(e) =>
              setEditValues({
                ...editValues,
                condition_guess: e.target.value as typeof editValues.condition_guess,
              })
            }
            className="rounded border bg-background px-2 py-1 text-sm"
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={editValues.weight}
            onChange={(e) =>
              setEditValues({
                ...editValues,
                weight: e.target.value as typeof editValues.weight,
              })
            }
            className="rounded border bg-background px-2 py-1 text-sm"
          >
            {WEIGHTS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Loose</label>
            <input
              type="number"
              value={editValues.loose_price}
              onChange={(e) =>
                setEditValues({ ...editValues, loose_price: Number(e.target.value) })
              }
              className="w-full rounded border bg-background px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">CIB</label>
            <input
              type="number"
              value={editValues.cib_price}
              onChange={(e) =>
                setEditValues({ ...editValues, cib_price: Number(e.target.value) })
              }
              className="w-full rounded border bg-background px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Sealed</label>
            <input
              type="number"
              value={editValues.new_price}
              onChange={(e) =>
                setEditValues({ ...editValues, new_price: Number(e.target.value) })
              }
              className="w-full rounded border bg-background px-2 py-1 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-1 rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            <Check className="h-4 w-4" />
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex flex-1 items-center justify-center gap-1 rounded border px-3 py-1.5 text-sm"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <ConfidenceIcon className={`h-4 w-4 flex-shrink-0 ${confidenceClass}`} />
            <h3 className="font-medium truncate">{item.name}</h3>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded bg-secondary px-1.5 py-0.5 text-xs">
              {item.platform}
            </span>
            <span className="rounded bg-secondary px-1.5 py-0.5 text-xs uppercase">
              {item.condition_guess}
            </span>
            <span>{item.weight}</span>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="rounded p-1.5 hover:bg-accent"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => removeItem(item.id)}
            className="rounded p-1.5 hover:bg-accent text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex gap-3">
          <span className="text-muted-foreground">
            L: <span className="text-foreground">${item.loose_price}</span>
          </span>
          <span className="text-muted-foreground">
            CIB: <span className="text-foreground">${item.cib_price}</span>
          </span>
          <span className="text-muted-foreground">
            New: <span className="text-foreground">${item.new_price}</span>
          </span>
        </div>
        <span className="font-medium text-green-600">${getEstimatedValue()}</span>
      </div>

      {item.notes && (
        <p className="mt-2 text-xs text-muted-foreground">{item.notes}</p>
      )}
    </div>
  )
}
