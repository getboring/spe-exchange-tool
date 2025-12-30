import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X, Wifi } from 'lucide-react'

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
      <div className="rounded-lg border bg-background p-4 shadow-lg">
        <div className="flex items-start gap-3">
          {offlineReady ? (
            <Wifi className="mt-0.5 h-5 w-5 text-green-600" />
          ) : (
            <RefreshCw className="mt-0.5 h-5 w-5 text-blue-600" />
          )}
          <div className="flex-1">
            <p className="font-medium">
              {offlineReady ? 'Ready to work offline' : 'Update available'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {offlineReady
                ? 'App has been cached for offline use.'
                : 'A new version is available. Reload to update.'}
            </p>
          </div>
          <button
            onClick={close}
            className="rounded-md p-1 hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {needRefresh && (
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={close}
              className="rounded-md px-3 py-1.5 text-sm hover:bg-accent"
            >
              Later
            </button>
            <button
              onClick={() => updateServiceWorker(true)}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
            >
              Reload
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
