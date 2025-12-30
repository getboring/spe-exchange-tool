import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { Item } from '@/types/database'
import type { ItemStatus, Platform } from '@/lib/constants'

interface InventoryFilters {
  status: ItemStatus | 'all'
  platform: Platform | 'all'
  search: string
  sortBy: 'name' | 'value' | 'date' | 'profit'
  sortOrder: 'asc' | 'desc'
}

interface InventoryState {
  items: Item[]
  loading: boolean
  error: string | null
  filters: InventoryFilters

  // Actions
  fetchItems: () => Promise<void>
  setFilter: <K extends keyof InventoryFilters>(key: K, value: InventoryFilters[K]) => void
  resetFilters: () => void
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>
  deleteItem: (id: string) => Promise<void>

  // Computed
  filteredItems: () => Item[]
  stats: () => { inStock: number; listed: number; sold: number; totalValue: number }
}

const defaultFilters: InventoryFilters = {
  status: 'all',
  platform: 'all',
  search: '',
  sortBy: 'date',
  sortOrder: 'desc',
}

export const useInventoryStore = create<InventoryState>()(
  devtools(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,
      filters: defaultFilters,

      fetchItems: async () => {
        set({ loading: true, error: null })

        const { data, error } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          set({ error: error.message, loading: false })
          return
        }

        set({ items: (data as Item[]) || [], loading: false })
      },

      setFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        }))
      },

      resetFilters: () => {
        set({ filters: defaultFilters })
      },

      updateItem: async (id, updates) => {
        const { error } = await supabase
          .from('items')
          .update(updates as never)
          .eq('id', id)

        if (error) {
          set({ error: error.message })
          return
        }

        // Update local state
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }))
      },

      deleteItem: async (id) => {
        const { error } = await supabase.from('items').delete().eq('id', id)

        if (error) {
          set({ error: error.message })
          return
        }

        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      filteredItems: () => {
        const { items, filters } = get()
        let filtered = [...items]

        // Filter by status
        if (filters.status !== 'all') {
          filtered = filtered.filter((item) => item.status === filters.status)
        }

        // Filter by platform
        if (filters.platform !== 'all') {
          filtered = filtered.filter((item) => item.platform === filters.platform)
        }

        // Filter by search
        if (filters.search) {
          const search = filters.search.toLowerCase()
          filtered = filtered.filter(
            (item) =>
              item.name.toLowerCase().includes(search) ||
              item.platform?.toLowerCase().includes(search)
          )
        }

        // Sort
        filtered.sort((a, b) => {
          let comparison = 0

          switch (filters.sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name)
              break
            case 'value':
              comparison = (a.estimated_value || 0) - (b.estimated_value || 0)
              break
            case 'profit':
              const aProfit = (a.estimated_value || 0) - (a.purchase_cost || 0)
              const bProfit = (b.estimated_value || 0) - (b.purchase_cost || 0)
              comparison = aProfit - bProfit
              break
            case 'date':
            default:
              comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          }

          return filters.sortOrder === 'desc' ? -comparison : comparison
        })

        return filtered
      },

      stats: () => {
        const { items } = get()
        return {
          inStock: items.filter((i) => i.status === 'in_stock').length,
          listed: items.filter((i) => i.status === 'listed').length,
          sold: items.filter((i) => i.status === 'sold').length,
          totalValue: items
            .filter((i) => i.status !== 'sold')
            .reduce((sum, i) => sum + (i.estimated_value || 0), 0),
        }
      },
    }),
    { name: 'InventoryStore' }
  )
)
