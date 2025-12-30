import { useSettingsStore } from '@/stores/settings-store'
import { useAuthStore } from '@/stores/auth-store'
import { EBAY_STORE_TYPES, WEIGHTS, SELL_PLATFORMS } from '@/lib/constants'
import { LogOut } from 'lucide-react'

export function SettingsPage() {
  const {
    ebayStoreType,
    promotedPercent,
    targetRoi,
    defaultWeight,
    defaultSellPlatform,
    setEbayStoreType,
    setPromotedPercent,
    setTargetRoi,
    setDefaultWeight,
    setDefaultSellPlatform,
  } = useSettingsStore()

  const { user, signOut } = useAuthStore()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Seller Settings */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Seller Settings</h2>
        <div className="space-y-4 rounded-lg border p-4">
          <div>
            <label className="text-sm text-muted-foreground">eBay Store Type</label>
            <select
              value={ebayStoreType}
              onChange={(e) => setEbayStoreType(e.target.value as typeof ebayStoreType)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
            >
              {EBAY_STORE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Promoted Listing %</label>
            <input
              type="number"
              min="0"
              max="20"
              value={promotedPercent}
              onChange={(e) => setPromotedPercent(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Target ROI %</label>
            <input
              type="number"
              min="0"
              value={targetRoi}
              onChange={(e) => setTargetRoi(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
            />
          </div>
        </div>
      </section>

      {/* Defaults */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Defaults</h2>
        <div className="space-y-4 rounded-lg border p-4">
          <div>
            <label className="text-sm text-muted-foreground">Default Weight</label>
            <select
              value={defaultWeight}
              onChange={(e) => setDefaultWeight(e.target.value as typeof defaultWeight)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
            >
              {WEIGHTS.map((weight) => (
                <option key={weight} value={weight}>
                  {weight}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Default Sell Platform</label>
            <select
              value={defaultSellPlatform}
              onChange={(e) => setDefaultSellPlatform(e.target.value as typeof defaultSellPlatform)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
            >
              {SELL_PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Account</h2>
        <div className="space-y-4 rounded-lg border p-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Signed in as:</span>
            <br />
            {user?.email || 'Not signed in'}
          </div>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </section>
    </div>
  )
}
