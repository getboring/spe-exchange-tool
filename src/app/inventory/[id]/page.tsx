import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  DollarSign,
  Tag,
  Save,
  X,
  Loader2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCents, toCents, toDollars } from '@/lib/utils'
import { PLATFORMS, CONDITIONS, WEIGHTS, ITEM_TYPES } from '@/lib/constants'
import { PlatformProfits } from '@/components/inventory/platform-profits'
import { RecordSaleModal } from '@/components/inventory/record-sale-modal'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import type { Item, ItemUpdate } from '@/types/database'

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    platform: '',
    condition: '',
    type: 'game',
    weight: '8oz',
    loose_price: '',
    cib_price: '',
    new_price: '',
  })

  const fetchItem = useCallback(async () => {
    if (!id) return

    setLoading(true)
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const itemData = data as Item
    setItem(itemData)
    setEditForm({
      name: itemData.name,
      platform: itemData.platform || '',
      condition: itemData.condition || '',
      type: itemData.type || 'game',
      weight: itemData.weight || '8oz',
      loose_price: itemData.loose_price ? toDollars(itemData.loose_price).toFixed(2) : '',
      cib_price: itemData.cib_price ? toDollars(itemData.cib_price).toFixed(2) : '',
      new_price: itemData.new_price ? toDollars(itemData.new_price).toFixed(2) : '',
    })
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchItem()
  }, [fetchItem])

  const handleSave = async () => {
    if (!item) return

    setIsSaving(true)
    setError(null)

    // Calculate estimated value based on condition
    let estimatedValue = 0
    if (editForm.condition === 'sealed' && editForm.new_price) {
      estimatedValue = toCents(parseFloat(editForm.new_price))
    } else if (editForm.condition === 'cib' && editForm.cib_price) {
      estimatedValue = toCents(parseFloat(editForm.cib_price))
    } else if (editForm.loose_price) {
      estimatedValue = toCents(parseFloat(editForm.loose_price))
    }

    const itemUpdate: ItemUpdate = {
      name: editForm.name,
      platform: editForm.platform || null,
      condition: editForm.condition || null,
      type: editForm.type as Item['type'],
      weight: editForm.weight as Item['weight'],
      loose_price: editForm.loose_price ? toCents(parseFloat(editForm.loose_price)) : null,
      cib_price: editForm.cib_price ? toCents(parseFloat(editForm.cib_price)) : null,
      new_price: editForm.new_price ? toCents(parseFloat(editForm.new_price)) : null,
      estimated_value: estimatedValue || null,
    }
    const { error: updateError } = await supabase
      .from('items')
      .update(itemUpdate)
      .eq('id', item.id)

    if (updateError) {
      setError(updateError.message)
      setIsSaving(false)
      return
    }

    await fetchItem()
    setIsEditing(false)
    setIsSaving(false)
  }

  const handleDeleteConfirm = async () => {
    if (!item) return

    const { error } = await supabase.from('items').delete().eq('id', item.id)

    if (error) {
      setError(error.message)
      setShowDeleteConfirm(false)
      return
    }

    navigate('/inventory')
  }

  const handleStatusChange = async (newStatus: Item['status']) => {
    if (!item) return

    const statusUpdate: ItemUpdate = { status: newStatus }
    const { error } = await supabase
      .from('items')
      .update(statusUpdate)
      .eq('id', item.id)

    if (error) {
      setError(error.message)
      return
    }

    await fetchItem()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/inventory')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
          <p className="text-destructive">{error || 'Item not found'}</p>
        </div>
      </div>
    )
  }

  const estimatedProfit = (item.estimated_value || 0) - (item.purchase_cost || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/inventory')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex gap-2">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Item info card */}
      <div className="rounded-lg border p-4">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full rounded-lg border bg-background px-3 py-2 text-lg font-semibold"
              placeholder="Item name"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Platform</label>
                <select
                  value={editForm.platform}
                  onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
                >
                  <option value="">Select...</option>
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Condition</label>
                <select
                  value={editForm.condition}
                  onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
                >
                  <option value="">Select...</option>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
                >
                  {ITEM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Weight</label>
                <select
                  value={editForm.weight}
                  onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
                >
                  {WEIGHTS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Loose Price</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.loose_price}
                    onChange={(e) => setEditForm({ ...editForm, loose_price: e.target.value })}
                    className="w-full rounded-lg border bg-background py-2 pl-7 pr-3"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">CIB Price</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.cib_price}
                    onChange={(e) => setEditForm({ ...editForm, cib_price: e.target.value })}
                    className="w-full rounded-lg border bg-background py-2 pl-7 pr-3"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Sealed Price</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.new_price}
                    onChange={(e) => setEditForm({ ...editForm, new_price: e.target.value })}
                    className="w-full rounded-lg border bg-background py-2 pl-7 pr-3"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                aria-label="Cancel editing"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold">{item.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {item.platform && (
                    <span className="rounded bg-secondary px-2 py-0.5">{item.platform}</span>
                  )}
                  {item.condition && (
                    <span className="uppercase">{item.condition}</span>
                  )}
                  <span>{item.type}</span>
                  <span>{item.weight}</span>
                </div>
              </div>

              <div className="text-right">
                {item.status === 'in_stock' && (
                  <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-700">
                    In Stock
                  </span>
                )}
                {item.status === 'listed' && (
                  <span className="rounded bg-yellow-100 px-2 py-1 text-sm text-yellow-700">
                    Listed
                  </span>
                )}
                {item.status === 'sold' && (
                  <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-700">
                    Sold
                  </span>
                )}
              </div>
            </div>

            {/* Prices */}
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-muted p-3">
                <div className="text-xs text-muted-foreground">Loose</div>
                <div className="font-semibold">{formatCents(item.loose_price)}</div>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="text-xs text-muted-foreground">CIB</div>
                <div className="font-semibold">{formatCents(item.cib_price)}</div>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="text-xs text-muted-foreground">Sealed</div>
                <div className="font-semibold">{formatCents(item.new_price)}</div>
              </div>
            </div>

            {/* Purchase info */}
            <div className="mt-4 rounded-lg bg-secondary/50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Purchase Cost</span>
                <span className="font-medium">{formatCents(item.purchase_cost)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimated Value</span>
                <span className="font-medium">{formatCents(item.estimated_value)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Est. Profit</span>
                <span
                  className={`font-semibold ${
                    estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCents(estimatedProfit)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Platform profits - only show when not editing and not sold */}
      {!isEditing && item.status !== 'sold' && <PlatformProfits item={item} />}

      {/* Sale info - only show when sold */}
      {item.status === 'sold' && (
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 font-semibold">Sale Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sale Price</span>
              <span>{formatCents(item.sale_price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform</span>
              <span>{item.sale_platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{item.sale_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fees</span>
              <span>{formatCents(item.sale_fees)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatCents(item.shipping_cost)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span>Actual Profit</span>
              <span className={item.actual_profit && item.actual_profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCents(item.actual_profit)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!isEditing && item.status !== 'sold' && (
        <div className="flex gap-3">
          {item.status === 'in_stock' && (
            <button
              onClick={() => handleStatusChange('listed')}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 font-medium hover:bg-accent"
            >
              <Tag className="h-5 w-5" />
              Mark as Listed
            </button>
          )}
          <button
            onClick={() => setShowSaleModal(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
          >
            <DollarSign className="h-5 w-5" />
            Record Sale
          </button>
        </div>
      )}

      {/* Record sale modal */}
      <RecordSaleModal
        item={item}
        isOpen={showSaleModal}
        onClose={() => setShowSaleModal(false)}
        onSaved={fetchItem}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Item"
        message={`Are you sure you want to delete "${item.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
