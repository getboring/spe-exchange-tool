import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import type { EbayStoreType, Weight, SellPlatform } from '@/lib/constants'
import type { Profile } from '@/types/database'
import { supabase } from '@/lib/supabase'

interface SettingsState {
  // Seller settings
  ebayStoreType: EbayStoreType
  promotedPercent: number
  targetRoi: number

  // Defaults
  defaultWeight: Weight
  defaultSellPlatform: SellPlatform

  // Sync state
  syncing: boolean
  lastSynced: string | null

  // Actions
  setEbayStoreType: (type: EbayStoreType) => void
  setPromotedPercent: (percent: number) => void
  setTargetRoi: (roi: number) => void
  setDefaultWeight: (weight: Weight) => void
  setDefaultSellPlatform: (platform: SellPlatform) => void
  resetToDefaults: () => void

  // Sync methods
  loadFromProfile: (profile: Profile) => void
  syncToProfile: (userId: string) => Promise<void>
}

const DEFAULT_SETTINGS = {
  ebayStoreType: 'basic' as EbayStoreType,
  promotedPercent: 0,
  targetRoi: 30,
  defaultWeight: '8oz' as Weight,
  defaultSellPlatform: 'eBay' as SellPlatform,
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        ...DEFAULT_SETTINGS,
        syncing: false,
        lastSynced: null,

        setEbayStoreType: (type) => set({ ebayStoreType: type }),
        setPromotedPercent: (percent) =>
          set({ promotedPercent: Math.max(0, Math.min(20, percent)) }),
        setTargetRoi: (roi) => set({ targetRoi: Math.max(0, roi) }),
        setDefaultWeight: (weight) => set({ defaultWeight: weight }),
        setDefaultSellPlatform: (platform) => set({ defaultSellPlatform: platform }),
        resetToDefaults: () => set(DEFAULT_SETTINGS),

        loadFromProfile: (profile) => {
          set({
            ebayStoreType: profile.ebay_store_type,
            promotedPercent: profile.promoted_percent,
            targetRoi: profile.target_roi,
            defaultWeight: profile.default_weight,
            defaultSellPlatform: profile.default_sell_platform as SellPlatform,
            lastSynced: new Date().toISOString(),
          })
        },

        syncToProfile: async (userId) => {
          const state = get()
          set({ syncing: true })

          try {
            const { error } = await supabase
              .from('profiles')
              .update({
                ebay_store_type: state.ebayStoreType,
                promoted_percent: state.promotedPercent,
                target_roi: state.targetRoi,
                default_weight: state.defaultWeight,
                default_sell_platform: state.defaultSellPlatform,
              } as never)
              .eq('id', userId)

            if (error) throw error
            set({ lastSynced: new Date().toISOString() })
          } catch (err) {
            console.error('Failed to sync settings:', err)
            throw err
          } finally {
            set({ syncing: false })
          }
        },
      }),
      { name: 'spe-settings' }
    ),
    { name: 'SettingsStore' }
  )
)
