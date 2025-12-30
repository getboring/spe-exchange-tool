import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { useScanStore } from '@/stores/scan-store'
import { toCents } from '@/lib/utils'
import type { ScannedItem, Deal, Item, Scan } from '@/types/database'

interface SaveScanResult {
  saving: boolean
  error: string | null
  saveScan: (askingPrice: number, source: string, notes: string) => Promise<void>
}

export function useSaveScan(): SaveScanResult {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const { user } = useAuthStore()
  const { scannedItems, reset } = useScanStore()

  const saveScan = useCallback(
    async (askingPrice: number, source: string, notes: string) => {
      if (!user) {
        setError('You must be logged in to save items')
        return
      }

      if (scannedItems.length === 0) {
        setError('No items to save')
        return
      }

      setSaving(true)
      setError(null)

      try {
        // Calculate total estimated value
        const totalValue = scannedItems.reduce((sum, item) => {
          const value = getItemValue(item)
          return sum + value
        }, 0)

        // Calculate estimated profit
        const estimatedProfit = totalValue - askingPrice

        // Create deal record
        const dealInsert: Omit<Deal, 'id' | 'created_at'> = {
          user_id: user.id,
          source: source || null,
          notes: notes || null,
          total_cost: toCents(askingPrice),
          estimated_value: toCents(totalValue),
          estimated_profit: toCents(estimatedProfit),
          status: 'active',
          actual_revenue: null,
          actual_profit: null,
          actual_roi: null,
        }

        const { data: deal, error: dealError } = await supabase
          .from('deals')
          .insert(dealInsert as never)
          .select()
          .single()

        if (dealError) {
          throw new Error(`Failed to create deal: ${dealError.message}`)
        }

        // Type assertion for deal data
        const dealData = deal as Deal

        // Allocate cost weighted by value
        const items = scannedItems.map((item) => {
          const itemValue = getItemValue(item)
          const weight = totalValue > 0 ? itemValue / totalValue : 1 / scannedItems.length
          const allocatedCost = askingPrice * weight

          return {
            user_id: user.id,
            name: item.name,
            platform: item.platform as Item['platform'],
            condition: item.condition_guess,
            type: item.type,
            weight: item.weight,
            status: 'in_stock' as const,
            loose_price: toCents(item.loose_price),
            cib_price: toCents(item.cib_price),
            new_price: toCents(item.new_price),
            purchase_cost: toCents(allocatedCost),
            estimated_value: toCents(itemValue),
            deal_id: dealData.id,
            sale_price: null,
            sale_platform: null,
            sale_date: null,
            sale_fees: null,
            shipping_cost: null,
            actual_profit: null,
            thumbnail_url: null,
          }
        })

        // Insert items
        const { error: itemsError } = await supabase.from('items').insert(items as never[])

        if (itemsError) {
          throw new Error(`Failed to save items: ${itemsError.message}`)
        }

        // Record scan
        const scanInsert: Omit<Scan, 'id' | 'created_at'> = {
          user_id: user.id,
          items_found: scannedItems.length,
        }
        await supabase.from('scans').insert(scanInsert as never)

        // Reset scan state and navigate to inventory
        reset()
        navigate('/inventory')
      } catch (err) {
        console.error('Save error:', err)
        setError(err instanceof Error ? err.message : 'Failed to save items')
      } finally {
        setSaving(false)
      }
    },
    [user, scannedItems, reset, navigate]
  )

  return { saving, error, saveScan }
}

// Helper to get item value based on condition
function getItemValue(item: ScannedItem): number {
  switch (item.condition_guess) {
    case 'sealed':
      return item.new_price
    case 'cib':
      return item.cib_price
    default:
      return item.loose_price
  }
}
