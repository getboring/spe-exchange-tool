import { useRef, useCallback } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { useScanStore } from '@/stores/scan-store'
import { compressImage, createPreviewUrl, revokePreviewUrl } from '@/lib/image-utils'

interface ImageCaptureProps {
  onScan: () => void
  disabled?: boolean
}

export function ImageCapture({ onScan, disabled }: ImageCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { imagePreview, isScanning, setImage, clearImage } = useScanStore()

  const handleFile = useCallback(
    async (file: File) => {
      try {
        // Create preview URL
        const preview = createPreviewUrl(file)

        // Compress and convert to base64
        const { base64, mediaType } = await compressImage(file)

        setImage(base64, preview, mediaType)
      } catch (error) {
        console.error('Error processing image:', error)
      }
    },
    [setImage]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleCameraClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.capture = 'environment'
      fileInputRef.current.click()
    }
  }, [])

  const handleUploadClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture')
      fileInputRef.current.click()
    }
  }, [])

  const handleClear = useCallback(() => {
    if (imagePreview) {
      revokePreviewUrl(imagePreview)
    }
    clearImage()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [imagePreview, clearImage])

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image preview or placeholder */}
      <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-dashed bg-muted/50">
        {imagePreview ? (
          <>
            <img
              src={imagePreview}
              alt="Preview"
              className="h-full w-full object-contain"
            />
            <button
              onClick={handleClear}
              disabled={isScanning}
              aria-label="Clear image"
              className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 hover:bg-background disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <Camera className="h-12 w-12" />
            <p className="mt-2 text-sm">Take a photo or upload an image</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleCameraClick}
          disabled={disabled || isScanning}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border bg-background px-4 py-3 font-medium hover:bg-accent disabled:opacity-50"
        >
          <Camera className="h-5 w-5" />
          Camera
        </button>
        <button
          onClick={handleUploadClick}
          disabled={disabled || isScanning}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border bg-background px-4 py-3 font-medium hover:bg-accent disabled:opacity-50"
        >
          <Upload className="h-5 w-5" />
          Upload
        </button>
      </div>

      {/* Scan button */}
      {imagePreview && (
        <button
          onClick={onScan}
          disabled={disabled || isScanning}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Scanning...
            </>
          ) : (
            'Scan Image'
          )}
        </button>
      )}
    </div>
  )
}
