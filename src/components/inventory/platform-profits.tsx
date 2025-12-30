import { useMemo } from 'react'
import { TrendingUp, Award } from 'lucide-react'
import type { Item } from '@/types/database'
import { calculateAllPlatformProfits } from '@/lib/fees'
import { toDollars } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settings-store'

interface PlatformProfitsProps {
  item: Item
}

export function PlatformProfits({ item }: PlatformProfitsProps) {
  const { ebayStoreType, promotedPercent } = useSettingsStore()

  const profits = useMemo(() => {
    const salePrice = toDollars(item.estimated_value || 0)
    const cost = toDollars(item.purchase_cost || 0)

    return calculateAllPlatformProfits(
      salePrice,
      cost,
      item.type,
      item.weight,
      { storeType: ebayStoreType, promotedPercent }
    )
  }, [item, ebayStoreType, promotedPercent])

  const platforms = [
    { key: 'ebay', name: 'eBay', data: profits.ebay },
    { key: 'mercari', name: 'Mercari', data: profits.mercari },
    { key: 'fbShipped', name: 'FB Shipped', data: profits.fbShipped },
    { key: 'fbLocal', name: 'FB Local', data: profits.fbLocal },
  ]

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        <h3 className="font-semibold">Profit by Platform</h3>
      </div>

      <div className="space-y-2">
        {platforms.map(({ key, name, data }) => {
          const isBest = profits.best === name || (key === 'fbLocal' && profits.best === 'FB Local')

          return (
            <div
              key={key}
              className={`flex items-center justify-between rounded p-2 ${
                isBest ? 'bg-green-50 dark:bg-green-950' : 'bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{name}</span>
                {isBest && <Award className="h-4 w-4 text-green-600" />}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Fees: ${data.fees.toFixed(2)}
                </span>
                <span
                  className={`font-medium ${
                    data.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  ${data.profit.toFixed(2)}
                </span>
                <span className="text-muted-foreground">
                  {data.roi.toFixed(0)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Based on {item.weight} shipping weight, {ebayStoreType} eBay store
        {promotedPercent > 0 && `, ${promotedPercent}% promoted`}
      </p>
    </div>
  )
}
