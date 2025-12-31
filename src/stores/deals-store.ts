import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { Deal, Item, DealInsert, DealUpdate, ItemUpdate } from '@/types/database'
import type { DealStatus } from '@/lib/constants'

interface DealWithItems extends Deal {
  items?: Item[]
  itemCount?: number
  soldCount?: number
}

interface DealsFilters {
  status: DealStatus | 'all'
  search: string
  sortBy: 'date' | 'profit' | 'value'
  sortOrder: 'asc' | 'desc'
}

interface DealsState {
  deals: DealWithItems[]
  loading: boolean
  error: string | null
  filters: DealsFilters

  // Actions
  fetchDeals: () => Promise<void>
  fetchDealById: (id: string) => Promise<DealWithItems | null>
  createDeal: (deal: Omit<Deal, 'id' | 'created_at'>) => Promise<string | null>
  updateDeal: (id: string, updates: Partial<Deal>) => Promise<void>
  deleteDeal: (id: string) => Promise<void>
  setFilter: <K extends keyof DealsFilters>(key: K, value: DealsFilters[K]) => void
  resetFilters: () => void

  // Computed
  filteredDeals: () => DealWithItems[]
  stats: () => {
    activeDeals: number
    completedDeals: number
    totalInvested: number
    totalProfit: number
  }
}

const defaultFilters: DealsFilters = {
  status: 'all',
  search: '',
  sortBy: 'date',
  sortOrder: 'desc',
}

export const useDealsStore = create<DealsState>()(
  devtools(
    (set, get) => ({
      deals: [],
      loading: false,
      error: null,
      filters: defaultFilters,

      fetchDeals: async () => {
        set({ loading: true, error: null })

        // Fetch deals with item counts
        const { data: deals, error: dealsError } = await supabase
          .from('deals')
          .select('*')
          .order('created_at', { ascending: false })

        if (dealsError) {
          set({ error: dealsError.message, loading: false })
          return
        }

        // Fetch item counts for each deal
        const { data: items } = await supabase
          .from('items')
          .select('deal_id, status')

        const itemsData = (items as { deal_id: string | null; status: string }[]) || []
        const dealsData = (deals as Deal[]) || []

        const dealsWithCounts = dealsData.map((deal) => {
          const dealItems = itemsData.filter((i) => i.deal_id === deal.id)
          return {
            ...deal,
            itemCount: dealItems.length,
            soldCount: dealItems.filter((i) => i.status === 'sold').length,
          }
        })

        set({ deals: dealsWithCounts as DealWithItems[], loading: false })
      },

      fetchDealById: async (id) => {
        const { data: deal, error: dealError } = await supabase
          .from('deals')
          .select('*')
          .eq('id', id)
          .single()

        if (dealError) {
          set({ error: dealError.message })
          return null
        }

        // Fetch items for this deal
        const { data: items } = await supabase
          .from('items')
          .select('*')
          .eq('deal_id', id)
          .order('created_at', { ascending: false })

        const dealData = deal as Deal
        const itemsData = (items as Item[]) || []

        return {
          ...dealData,
          items: itemsData,
          itemCount: itemsData.length,
          soldCount: itemsData.filter((i) => i.status === 'sold').length,
        } as DealWithItems
      },

      createDeal: async (deal) => {
        const dealInsert: DealInsert = deal
        const { data, error } = await supabase
          .from('deals')
          .insert(dealInsert)
          .select()
          .single()

        if (error) {
          set({ error: error.message })
          return null
        }

        // Refresh deals list
        get().fetchDeals()
        return (data as Deal).id
      },

      updateDeal: async (id, updates) => {
        const dealUpdate: DealUpdate = updates
        const { error } = await supabase
          .from('deals')
          .update(dealUpdate)
          .eq('id', id)

        if (error) {
          set({ error: error.message })
          return
        }

        // Update local state
        set((state) => ({
          deals: state.deals.map((deal) =>
            deal.id === id ? { ...deal, ...updates } : deal
          ),
        }))
      },

      deleteDeal: async (id) => {
        // First, unlink items from this deal
        const unlinkUpdate: ItemUpdate = { deal_id: null }
        await supabase
          .from('items')
          .update(unlinkUpdate)
          .eq('deal_id', id)

        // Then delete the deal
        const { error } = await supabase.from('deals').delete().eq('id', id)

        if (error) {
          set({ error: error.message })
          return
        }

        set((state) => ({
          deals: state.deals.filter((deal) => deal.id !== id),
        }))
      },

      setFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        }))
      },

      resetFilters: () => {
        set({ filters: defaultFilters })
      },

      filteredDeals: () => {
        const { deals, filters } = get()
        let filtered = [...deals]

        // Filter by status
        if (filters.status !== 'all') {
          filtered = filtered.filter((deal) => deal.status === filters.status)
        }

        // Filter by search
        if (filters.search) {
          const search = filters.search.toLowerCase()
          filtered = filtered.filter(
            (deal) =>
              deal.source?.toLowerCase().includes(search) ||
              deal.notes?.toLowerCase().includes(search)
          )
        }

        // Sort
        filtered.sort((a, b) => {
          let comparison = 0

          switch (filters.sortBy) {
            case 'profit':
              comparison = (a.estimated_profit || 0) - (b.estimated_profit || 0)
              break
            case 'value':
              comparison = (a.estimated_value || 0) - (b.estimated_value || 0)
              break
            case 'date':
            default:
              comparison =
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          }

          return filters.sortOrder === 'desc' ? -comparison : comparison
        })

        return filtered
      },

      stats: () => {
        const { deals } = get()
        const active = deals.filter((d) => d.status === 'active')
        const completed = deals.filter((d) => d.status === 'completed')

        return {
          activeDeals: active.length,
          completedDeals: completed.length,
          totalInvested: active.reduce((sum, d) => sum + (d.total_cost || 0), 0),
          totalProfit: completed.reduce((sum, d) => sum + (d.actual_profit || 0), 0),
        }
      },
    }),
    { name: 'DealsStore' }
  )
)
