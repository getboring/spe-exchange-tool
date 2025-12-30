import { Camera, Upload } from 'lucide-react'

export function ScanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scan Items</h1>

      {/* Camera/Upload Area */}
      <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed">
        <div className="text-center">
          <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Camera view will appear here
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground">
          <Camera className="h-5 w-5" />
          Take Photo
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 font-medium">
          <Upload className="h-5 w-5" />
          Upload
        </button>
      </div>

      {/* Results Placeholder */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Scanned Items</h2>
        <div className="rounded-lg border p-4 text-center text-muted-foreground">
          No items scanned yet. Take a photo or upload an image to get started.
        </div>
      </div>
    </div>
  )
}
