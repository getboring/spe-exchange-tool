import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ScannedItem } from '@/types/database'

interface ScanState {
  // Image handling
  imageData: string | null // base64
  imagePreview: string | null // object URL for display
  mediaType: string | null

  // Scan results
  scannedItems: ScannedItem[]

  // UI state
  isScanning: boolean
  error: string | null

  // Actions
  setImage: (data: string, preview: string, mediaType: string) => void
  clearImage: () => void
  setScannedItems: (items: ScannedItem[]) => void
  updateItem: (id: string, updates: Partial<ScannedItem>) => void
  removeItem: (id: string) => void
  setScanning: (scanning: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  imageData: null,
  imagePreview: null,
  mediaType: null,
  scannedItems: [],
  isScanning: false,
  error: null,
}

export const useScanStore = create<ScanState>()(
  devtools(
    (set) => ({
      ...initialState,

      setImage: (data, preview, mediaType) =>
        set({ imageData: data, imagePreview: preview, mediaType, error: null }),

      clearImage: () =>
        set({ imageData: null, imagePreview: null, mediaType: null }),

      setScannedItems: (items) =>
        set({ scannedItems: items, error: null }),

      updateItem: (id, updates) =>
        set((state) => ({
          scannedItems: state.scannedItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

      removeItem: (id) =>
        set((state) => ({
          scannedItems: state.scannedItems.filter((item) => item.id !== id),
        })),

      setScanning: (scanning) =>
        set({ isScanning: scanning }),

      setError: (error) =>
        set({ error, isScanning: false }),

      reset: () =>
        set(initialState),
    }),
    { name: 'ScanStore' }
  )
)
