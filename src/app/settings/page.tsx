import { useEffect, useCallback, useState } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { useAuthStore } from '@/stores/auth-store'
import { EBAY_STORE_TYPES, WEIGHTS, SELL_PLATFORMS } from '@/lib/constants'
import { LogOut, Save, RefreshCw, Download, Trash2, Check } from 'lucide-react'

const EBAY_STORE_COSTS: Record<string, number> = {
  none: 0,
  starter: 7.95,
  basic: 27.95,
  premium: 74.95,
  anchor: 349.95,
}

export function SettingsPage() {
  const {
    ebayStoreType,
    promotedPercent,
    targetRoi,
    defaultWeight,
    defaultSellPlatform,
    syncing,
    lastSynced,
    setEbayStoreType,
    setPromotedPercent,
    setTargetRoi,
    setDefaultWeight,
    setDefaultSellPlatform,
    loadFromProfile,
    syncToProfile,
  } = useSettingsStore()

  const { user, profile, signOut, fetchProfile } = useAuthStore()
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [hasChanges, setHasChanges] = useState(false)

  // Load settings from profile on mount
  useEffect(() => {
    if (profile) {
      loadFromProfile(profile)
    }
  }, [profile, loadFromProfile])

  // Debounced save to profile
  const saveSettings = useCallback(async () => {
    if (!user?.id) return

    setSaveStatus('saving')
    try {
      await syncToProfile(user.id)
      await fetchProfile()
      setSaveStatus('saved')
      setHasChanges(false)
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('idle')
    }
  }, [user?.id, syncToProfile, fetchProfile])

  // Track changes
  const handleChange = useCallback((setter: () => void) => {
    setter()
    setHasChanges(true)
  }, [])

  const handleExportData = async () => {
    // Placeholder for data export
    alert('Export functionality coming soon')
  }

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
      alert('Clear functionality coming soon')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        {hasChanges && (
          <button
            onClick={saveSettings}
            disabled={syncing}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        )}
      </div>

      {/* Seller Settings */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Seller Settings</h2>
        <div className="space-y-4 rounded-lg border p-4">
          <div>
            <label className="text-sm text-muted-foreground">eBay Store Type</label>
            <select
              value={ebayStoreType}
              onChange={(e) => handleChange(() => setEbayStoreType(e.target.value as typeof ebayStoreType))}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
            >
              {EBAY_STORE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  {EBAY_STORE_COSTS[type] > 0 && ` ($${EBAY_STORE_COSTS[type]}/mo)`}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              {ebayStoreType === 'none'
                ? 'No store subscription - higher fees apply'
                : `${ebayStoreType.charAt(0).toUpperCase() + ebayStoreType.slice(1)} store with reduced final value fees`}
            </p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Promoted Listing %</label>
            <div className="relative mt-1">
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={promotedPercent}
                onChange={(e) => handleChange(() => setPromotedPercent(Number(e.target.value)))}
                className="w-full rounded-lg border bg-background px-3 py-2 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Ad rate for promoted listings (0-20%). Leave at 0 if not using promoted.
            </p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Target ROI %</label>
            <div className="relative mt-1">
              <input
                type="number"
                min="0"
                value={targetRoi}
                onChange={(e) => handleChange(() => setTargetRoi(Number(e.target.value)))}
                className="w-full rounded-lg border bg-background px-3 py-2 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Minimum return on investment for deal recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Defaults */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Defaults</h2>
        <div className="space-y-4 rounded-lg border p-4">
          <div>
            <label className="text-sm text-muted-foreground">Default Shipping Weight</label>
            <select
              value={defaultWeight}
              onChange={(e) => handleChange(() => setDefaultWeight(e.target.value as typeof defaultWeight))}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
            >
              {WEIGHTS.map((weight) => (
                <option key={weight} value={weight}>
                  {weight}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Default weight for new items. Most games are 4-8oz.
            </p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Default Sell Platform</label>
            <select
              value={defaultSellPlatform}
              onChange={(e) => handleChange(() => setDefaultSellPlatform(e.target.value as typeof defaultSellPlatform))}
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

      {/* Data Management */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Data</h2>
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-muted-foreground">
                Download all your inventory and sales data as CSV
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-accent"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <hr />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Clear All Data</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete all inventory, deals, and scan history
              </p>
            </div>
            <button
              onClick={handleClearData}
              className="flex items-center gap-2 rounded-lg border border-destructive/50 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Account</h2>
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{user?.email || 'Not signed in'}</p>
              <p className="text-sm text-muted-foreground">
                {profile?.tier === 'pro' ? 'Pro Account' : 'Free Account'}
              </p>
            </div>
            {profile?.tier !== 'pro' && (
              <button
                className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white"
                onClick={() => alert('Pro upgrade coming soon!')}
              >
                Upgrade to Pro
              </button>
            )}
          </div>

          {lastSynced && (
            <p className="text-xs text-muted-foreground">
              Last synced: {new Date(lastSynced).toLocaleString()}
            </p>
          )}

          <hr />

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
