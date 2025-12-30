import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import type { EbayStoreType, Weight, SellPlatform } from '@/lib/constants'

interface SettingsState {
  // Seller settings
  ebayStoreType: EbayStoreType
  promotedPercent: number
  targetRoi: number

  // Defaults
  defaultWeight: Weight
  defaultSellPlatform: SellPlatform

  // Actions
  setEbayStoreType: (type: EbayStoreType) => void
  setPromotedPercent: (percent: number) => void
  setTargetRoi: (roi: number) => void
  setDefaultWeight: (weight: Weight) => void
  setDefaultSellPlatform: (platform: SellPlatform) => void
  resetToDefaults: () => void
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
      (set) => ({
        ...DEFAULT_SETTINGS,

        setEbayStoreType: (type) => set({ ebayStoreType: type }),
        setPromotedPercent: (percent) =>
          set({ promotedPercent: Math.max(0, Math.min(20, percent)) }),
        setTargetRoi: (roi) => set({ targetRoi: Math.max(0, roi) }),
        setDefaultWeight: (weight) => set({ defaultWeight: weight }),
        setDefaultSellPlatform: (platform) => set({ defaultSellPlatform: platform }),
        resetToDefaults: () => set(DEFAULT_SETTINGS),
      }),
      { name: 'spe-settings' }
    ),
    { name: 'SettingsStore' }
  )
)
