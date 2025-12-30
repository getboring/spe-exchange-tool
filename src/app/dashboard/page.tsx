import { Link } from 'react-router-dom'
import { Camera, Package, TrendingUp, FileText } from 'lucide-react'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="In Stock" value="0" />
        <StatCard label="Listed" value="0" />
        <StatCard label="Sold" value="0" />
        <StatCard label="Profit" value="$0" />
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <QuickAction to="/scan" icon={Camera} label="Scan Items" />
          <QuickAction to="/inventory" icon={Package} label="View Inventory" />
          <QuickAction to="/analytics" icon={TrendingUp} label="Analytics" />
          <QuickAction to="/deals" icon={FileText} label="Deals" />
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <div className="rounded-lg border p-4 text-center text-muted-foreground">
          No recent activity. Start by scanning some items!
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string
  icon: typeof Camera
  label: string
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-accent"
    >
      <Icon className="h-6 w-6" />
      <span className="text-sm">{label}</span>
    </Link>
  )
}
