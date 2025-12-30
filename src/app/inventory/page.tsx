import { Search, Plus } from 'lucide-react'

export function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button className="rounded-lg bg-primary p-2 text-primary-foreground">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search items..."
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4"
          />
        </div>
        <select className="rounded-lg border bg-background px-3 py-2">
          <option value="all">All</option>
          <option value="in_stock">In Stock</option>
          <option value="listed">Listed</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {/* Items List Placeholder */}
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        <p>No items in inventory yet.</p>
        <p className="mt-1 text-sm">Scan some items to get started!</p>
      </div>
    </div>
  )
}
