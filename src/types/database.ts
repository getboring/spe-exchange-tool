import type { Cents } from '@/lib/utils'
import type {
  Platform,
  Weight,
  ItemType,
  ItemCondition,
  ItemStatus,
  DealStatus,
  EbayStoreType,
  UserTier,
  ConfidenceLevel,
} from '@/lib/constants'

// Database row types (matches Supabase schema)

export interface Profile {
  id: string
  email: string | null
  tier: UserTier
  ebay_store_type: EbayStoreType
  promoted_percent: number
  target_roi: number
  default_weight: Weight
  default_sell_platform: string
  created_at: string
}

export interface Item {
  id: string
  user_id: string
  name: string
  platform: Platform | null
  condition: ItemCondition | null
  type: ItemType
  weight: Weight
  status: ItemStatus

  // Prices in CENTS
  loose_price: Cents | null
  cib_price: Cents | null
  new_price: Cents | null
  purchase_cost: Cents | null
  estimated_value: Cents | null

  // Sale info in CENTS
  sale_price: Cents | null
  sale_platform: string | null
  sale_date: string | null
  sale_fees: Cents | null
  shipping_cost: Cents | null
  actual_profit: Cents | null

  deal_id: string | null
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  user_id: string
  source: string | null
  notes: string | null
  total_cost: Cents | null
  estimated_value: Cents | null
  estimated_profit: Cents | null
  status: DealStatus
  actual_revenue: Cents | null
  actual_profit: Cents | null
  actual_roi: number | null
  created_at: string
}

export interface PriceGuide {
  id: string
  name: string
  platform: Platform
  variant: string
  loose_price: Cents | null
  cib_price: Cents | null
  new_price: Cents | null
  pricecharting_id: string | null
  last_updated: string | null
  source: string
  search_name: string | null
}

export interface Scan {
  id: string
  user_id: string
  items_found: number
  created_at: string
}

// API request/response types

export interface ScanRequest {
  image: string // base64
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
}

export interface ScannedItem {
  id: string
  name: string
  platform: string
  type: ItemType
  condition_guess: ItemCondition
  variant: string
  loose_price: number // AI returns dollars, needs conversion
  cib_price: number
  new_price: number
  weight: Weight
  confidence: ConfidenceLevel
  notes: string
}

export interface ScanResponse {
  items: ScannedItem[]
  provider: string
}

// Fee calculation types

export interface EbayFees {
  fvf: number
  perOrder: number
  intlFee: number
  promoted: number
  taxFee: number
  total: number
}

export interface PlatformProfit {
  fees: number
  shipping: number
  profit: number
  roi: number
}

export interface AllPlatformProfits {
  ebay: PlatformProfit
  mercari: PlatformProfit
  fbShipped: PlatformProfit
  fbLocal: PlatformProfit
  best: string
}

// Supabase Database type helper
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      items: {
        Row: Item
        Insert: Omit<Item, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      deals: {
        Row: Deal
        Insert: Omit<Deal, 'id' | 'created_at'>
        Update: Partial<Omit<Deal, 'id' | 'user_id' | 'created_at'>>
      }
      price_guide: {
        Row: PriceGuide
        Insert: Omit<PriceGuide, 'id'>
        Update: Partial<Omit<PriceGuide, 'id'>>
      }
      scans: {
        Row: Scan
        Insert: Omit<Scan, 'id' | 'created_at'>
        Update: never
      }
    }
  }
}

// Type aliases for Supabase operations (eliminates need for `as never` casts)
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type ItemInsert = Database['public']['Tables']['items']['Insert']
export type ItemUpdate = Database['public']['Tables']['items']['Update']
export type DealInsert = Database['public']['Tables']['deals']['Insert']
export type DealUpdate = Database['public']['Tables']['deals']['Update']
export type ScanInsert = Database['public']['Tables']['scans']['Insert']
