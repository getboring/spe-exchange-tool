// Gaming platforms supported (matches PriceCharting)
export const PLATFORMS = [
  // Nintendo Home
  'NES', 'SNES', 'N64', 'GameCube', 'Wii', 'Wii U', 'Switch',
  // Nintendo Portable
  'GB', 'GBC', 'GBA', 'DS', '3DS', 'Virtual Boy',
  // Sony
  'PS1', 'PS2', 'PS3', 'PS4', 'PS5', 'PSP', 'Vita',
  // Microsoft
  'Xbox', 'Xbox 360', 'Xbox One', 'Xbox Series',
  // Sega
  'Master System', 'Genesis', 'Sega CD', '32X', 'Saturn', 'Dreamcast', 'Game Gear',
  // Atari
  'Atari 2600', 'Atari 5200', 'Atari 7800', 'Jaguar', 'Lynx',
  // Other
  'TurboGrafx-16', 'Neo Geo', '3DO', 'CD-i',
  'Other'
] as const

export type Platform = typeof PLATFORMS[number]

// Shipping weights
export const WEIGHTS = ['4oz', '8oz', '12oz', '16oz', '24oz', '32oz', '48oz'] as const
export type Weight = typeof WEIGHTS[number]

// Item types
export const ITEM_TYPES = ['game', 'console', 'accessory'] as const
export type ItemType = typeof ITEM_TYPES[number]

// Item conditions
export const CONDITIONS = ['loose', 'cib', 'sealed'] as const
export type ItemCondition = typeof CONDITIONS[number]

// Item statuses
export const ITEM_STATUSES = ['in_stock', 'listed', 'sold'] as const
export type ItemStatus = typeof ITEM_STATUSES[number]

// Deal statuses
export const DEAL_STATUSES = ['active', 'completed'] as const
export type DealStatus = typeof DEAL_STATUSES[number]

// Deal sources
export const DEAL_SOURCES = [
  'FB Marketplace',
  'OfferUp',
  'Craigslist',
  'Garage Sale',
  'Estate Sale',
  'Thrift Store',
  'Flea Market',
  'Auction',
  'Goodwill',
  'Pawn Shop',
  'Trade-In',
  'Other'
] as const
export type DealSource = typeof DEAL_SOURCES[number]

// eBay store types
export const EBAY_STORE_TYPES = ['none', 'starter', 'basic', 'premium', 'anchor'] as const
export type EbayStoreType = typeof EBAY_STORE_TYPES[number]

// Selling platforms
export const SELL_PLATFORMS = ['eBay', 'Mercari', 'FB Marketplace', 'Local'] as const
export type SellPlatform = typeof SELL_PLATFORMS[number]

// User tiers
export const USER_TIERS = ['free', 'pro'] as const
export type UserTier = typeof USER_TIERS[number]

// Confidence levels for AI scanning
export const CONFIDENCE_LEVELS = ['high', 'medium', 'low'] as const
export type ConfidenceLevel = typeof CONFIDENCE_LEVELS[number]
