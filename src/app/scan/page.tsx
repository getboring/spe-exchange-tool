import { useCallback } from 'react'
import { useScanStore } from '@/stores/scan-store'
import { useAuthStore } from '@/stores/auth-store'
import { useSaveScan } from '@/hooks/use-save-scan'
import { ImageCapture } from '@/components/scan/image-capture'
import { ScanResults } from '@/components/scan/scan-results'
import { LotCalculator } from '@/components/scan/lot-calculator'
import type { ScannedItem } from '@/types/database'

export function ScanPage() {
  const {
    imageData,
    mediaType,
    scannedItems,
    isScanning,
    setScannedItems,
    setScanning,
    setError,
    reset,
  } = useScanStore()

  const { session } = useAuthStore()
  const { saving, error: saveError, saveScan } = useSaveScan()

  const handleScan = useCallback(async () => {
    if (!imageData || !mediaType) {
      setError('Please capture or upload an image first')
      return
    }

    if (!session?.access_token) {
      setError('Please sign in to scan items')
      return
    }

    setScanning(true)
    setError(null)

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          image: imageData,
          mediaType: mediaType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Scan failed: ${response.status}`)
      }

      const data = await response.json()

      if (!data.items || data.items.length === 0) {
        setError('No games detected. Try a clearer photo or add items manually.')
        return
      }

      // Add unique IDs if not present
      const itemsWithIds: ScannedItem[] = data.items.map(
        (item: ScannedItem, index: number) => ({
          ...item,
          id: item.id || `scan-${Date.now()}-${index}`,
        })
      )

      setScannedItems(itemsWithIds)
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('timeout') || err.message.includes('Timeout')) {
          setError('Scan timed out. Try a smaller image.')
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          setError('No internet connection. Scanning requires internet.')
        } else if (err.message.includes('Too many requests')) {
          setError('Too many scans. Please wait a minute before trying again.')
        } else if (err.message.includes('Authentication') || err.message.includes('token')) {
          setError('Session expired. Please refresh the page and try again.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Failed to scan image. Please try again.')
      }
    } finally {
      setScanning(false)
    }
  }, [imageData, mediaType, session, setScannedItems, setScanning, setError])

  const handleSave = useCallback(
    async (askingPrice: number, source: string, notes: string) => {
      await saveScan(askingPrice, source, notes)
    },
    [saveScan]
  )

  const handleReset = useCallback(() => {
    reset()
  }, [reset])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Scan Items</h1>
        {scannedItems.length > 0 && (
          <button
            onClick={handleReset}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Image capture area */}
      <ImageCapture onScan={handleScan} disabled={isScanning || saving} />

      {/* Save error display */}
      {saveError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive">{saveError}</p>
        </div>
      )}

      {/* Scan results */}
      <ScanResults />

      {/* Lot calculator - only show when items exist */}
      {scannedItems.length > 0 && (
        <LotCalculator onSave={handleSave} saving={saving} />
      )}
    </div>
  )
}
