import { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, initializeAuth } from '@/stores/auth-store'
import { AppShell } from '@/components/layout/app-shell'

// Lazy load page components for code splitting
const DashboardPage = lazy(() =>
  import('@/app/dashboard/page').then((m) => ({ default: m.DashboardPage }))
)
const ScanPage = lazy(() =>
  import('@/app/scan/page').then((m) => ({ default: m.ScanPage }))
)
const InventoryPage = lazy(() =>
  import('@/app/inventory/page').then((m) => ({ default: m.InventoryPage }))
)
const ItemDetailPage = lazy(() =>
  import('@/app/inventory/[id]/page').then((m) => ({ default: m.ItemDetailPage }))
)
const DealsPage = lazy(() =>
  import('@/app/deals/page').then((m) => ({ default: m.DealsPage }))
)
const DealDetailPage = lazy(() =>
  import('@/app/deals/[id]/page').then((m) => ({ default: m.DealDetailPage }))
)
const AnalyticsPage = lazy(() =>
  import('@/app/analytics/page').then((m) => ({ default: m.AnalyticsPage }))
)
const SettingsPage = lazy(() =>
  import('@/app/settings/page').then((m) => ({ default: m.SettingsPage }))
)
const LoginPage = lazy(() =>
  import('@/app/login/page').then((m) => ({ default: m.LoginPage }))
)

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuthStore()

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  useEffect(() => {
    initializeAuth()
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/scan" element={<ScanPage />} />
                      <Route path="/inventory" element={<InventoryPage />} />
                      <Route path="/inventory/:id" element={<ItemDetailPage />} />
                      <Route path="/deals" element={<DealsPage />} />
                      <Route path="/deals/:id" element={<DealDetailPage />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </Suspense>
                </AppShell>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
