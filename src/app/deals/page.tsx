import { Plus } from 'lucide-react'

export function DealsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deals</h1>
        <button className="rounded-lg bg-primary p-2 text-primary-foreground">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button className="border-b-2 border-primary px-4 py-2 font-medium">
          Active
        </button>
        <button className="px-4 py-2 text-muted-foreground">Completed</button>
      </div>

      {/* Deals List Placeholder */}
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        <p>No active deals.</p>
        <p className="mt-1 text-sm">
          Create a deal when you buy a lot to track your profit.
        </p>
      </div>
    </div>
  )
}
