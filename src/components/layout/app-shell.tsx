import { Link, useLocation } from 'react-router-dom'
import { Camera, Package, BarChart3, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReloadPrompt } from '@/components/pwa/reload-prompt'

const navItems = [
  { path: '/scan', icon: Camera, label: 'Scan' },
  { path: '/inventory', icon: Package, label: 'Inventory' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/deals', icon: FileText, label: 'Deals' },
]

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/" className="text-lg font-semibold">
            SPE Exchange
          </Link>
          <Link
            to="/settings"
            className={cn(
              'rounded-md p-2 hover:bg-accent',
              location.pathname === '/settings' && 'bg-accent'
            )}
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 pb-20">{children}</main>

      {/* PWA update prompt */}
      <ReloadPrompt />

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
        <div className="flex h-16 items-center justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(path)
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 text-xs',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
