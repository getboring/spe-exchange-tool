import { parsePrice } from './utils'
import type { EbayFees, AllPlatformProfits } from '@/types/database'
import type { EbayStoreType, ItemType, Weight } from './constants'

// ============ FEE DATA - February 2025 ============
export const DEFAULT_FEE_DATA = {
  lastUpdated: '2025-02-14',
  ebay: {
    none: { games: 0.136, consoles: 0.136, cap: 7500 },
    starter: { games: 0.136, consoles: 0.136, cap: 7500 },
    basic: { games: 0.127, consoles: 0.0735, cap: 2500 },
    premium: { games: 0.127, consoles: 0.0735, cap: 2500 },
    anchor: { games: 0.127, consoles: 0.0735, cap: 2500 },
    aboveCapRate: 0.0235,
    perOrderLow: 0.30,
    perOrderHigh: 0.40,
    perOrderThreshold: 10,
    internationalFee: 0.0165,
    storeCosts: { none: 0, starter: 7.95, basic: 27.95, premium: 74.95, anchor: 349.95 }
  },
  mercari: { sellingFee: 0.10, instantPay: 3.00 },
  facebook: { shippedFee: 0.10, minimumFee: 0.80, localFee: 0 },
  shipping: {
    '4oz': 4.70,
    '8oz': 5.25,
    '12oz': 6.40,
    '16oz': 8.00,
    '24oz': 9.50,
    '32oz': 11.00,
    '48oz': 13.50
  }
} as const

type FeeData = typeof DEFAULT_FEE_DATA

/**
 * Calculate eBay fees for a sale
 */
export function calculateEbayFees(
  salePrice: number | string,
  shippingCharged: number | string = 0,
  itemType: ItemType = 'game',
  isInternational = false,
  storeType: EbayStoreType = 'basic',
  promotedPercent = 0,
  taxRate = 0,
  feeData: FeeData = DEFAULT_FEE_DATA
): EbayFees {
  const price = parsePrice(salePrice)
  const shipping = parsePrice(shippingCharged)
  const total = price + shipping

  const rates = feeData.ebay[storeType] || feeData.ebay.basic
  const rate = itemType === 'console' ? rates.consoles : rates.games
  const cap = rates.cap

  // FVF with cap
  const fvf = total <= cap
    ? total * rate
    : (cap * rate) + ((total - cap) * feeData.ebay.aboveCapRate)

  // Per-order fee
  const perOrder = total <= feeData.ebay.perOrderThreshold
    ? feeData.ebay.perOrderLow
    : feeData.ebay.perOrderHigh

  // International fee
  const intlFee = isInternational ? total * feeData.ebay.internationalFee : 0

  // Promoted listings
  const promoted = total * (promotedPercent / 100)

  // Tax collection fee (if applicable)
  const taxFee = taxRate > 0 ? (price * taxRate / 100) * 0.0225 : 0

  return {
    fvf,
    perOrder,
    intlFee,
    promoted,
    taxFee,
    total: fvf + perOrder + intlFee + promoted + taxFee
  }
}

/**
 * Calculate Mercari fees for a sale
 */
export function calculateMercariFees(
  salePrice: number | string,
  feeData: FeeData = DEFAULT_FEE_DATA
): { sellingFee: number; total: number } {
  const price = parsePrice(salePrice)
  const fee = price * feeData.mercari.sellingFee
  return { sellingFee: fee, total: fee }
}

/**
 * Calculate Facebook Marketplace fees for a sale
 */
export function calculateFacebookFees(
  salePrice: number | string,
  isLocal = false,
  feeData: FeeData = DEFAULT_FEE_DATA
): { fee: number; total: number } {
  if (isLocal) return { fee: 0, total: 0 }
  const price = parsePrice(salePrice)
  const fee = Math.max(price * feeData.facebook.shippedFee, feeData.facebook.minimumFee)
  return { fee, total: fee }
}

/**
 * Get shipping cost by weight
 */
export function getShippingCost(
  weight: Weight = '8oz',
  feeData: FeeData = DEFAULT_FEE_DATA
): number {
  return feeData.shipping[weight] || feeData.shipping['8oz']
}

/**
 * Auto-calculate fees based on platform
 */
export function autoCalculateFees(
  platform: string,
  salePrice: number | string,
  shippingCharged: number | string,
  itemType: ItemType = 'game',
  settings: { storeType?: EbayStoreType; promotedPercent?: number } = {}
): number {
  const price = parsePrice(salePrice)
  const shipping = parsePrice(shippingCharged)
  const { storeType = 'basic', promotedPercent = 0 } = settings

  switch (platform) {
    case 'eBay':
      return calculateEbayFees(price, shipping, itemType, false, storeType, promotedPercent).total
    case 'Mercari':
      return calculateMercariFees(price).total
    case 'FB Marketplace':
      return calculateFacebookFees(price, false).total
    case 'Local':
      return 0
    default:
      return 0
  }
}

/**
 * Calculate profit for all platforms
 */
export function calculateAllPlatformProfits(
  salePrice: number | string,
  cost: number | string,
  itemType: ItemType = 'game',
  weight: Weight = '8oz',
  settings: { storeType?: EbayStoreType; promotedPercent?: number } = {}
): AllPlatformProfits {
  const price = parsePrice(salePrice)
  const itemCost = parsePrice(cost)
  const shipping = getShippingCost(weight)
  const { storeType = 'basic', promotedPercent = 0 } = settings

  // Cap ROI at 9999% instead of Infinity
  const capRoi = (profit: number, cost: number): number => {
    if (cost <= 0) return profit > 0 ? 9999 : 0
    const roi = (profit / cost) * 100
    return Math.min(roi, 9999)
  }

  // eBay (assume buyer pays shipping, so shipping cancels out)
  const ebayFees = calculateEbayFees(price, shipping, itemType, false, storeType, promotedPercent)
  const ebayProfit = price - itemCost - ebayFees.total
  const ebayROI = capRoi(ebayProfit, itemCost)

  // Mercari (seller pays shipping)
  const mercariFees = calculateMercariFees(price)
  const mercariProfit = price - itemCost - mercariFees.total - shipping
  const mercariROI = capRoi(mercariProfit, itemCost)

  // Facebook shipped (seller pays shipping)
  const fbShippedFees = calculateFacebookFees(price)
  const fbShippedProfit = price - itemCost - shipping - fbShippedFees.total
  const fbShippedROI = capRoi(fbShippedProfit, itemCost)

  // Facebook local (no shipping, no fees)
  const fbLocalProfit = price - itemCost
  const fbLocalROI = capRoi(fbLocalProfit, itemCost)

  // Determine best platform by ROI
  const profits = {
    ebay: ebayROI,
    mercari: mercariROI,
    fbShipped: fbShippedROI,
    fbLocal: fbLocalROI
  }
  const best = Object.entries(profits).reduce((a, b) => b[1] > a[1] ? b : a, ['none', -Infinity])
  const bestName: Record<string, string> = {
    ebay: 'eBay',
    mercari: 'Mercari',
    fbShipped: 'FB Ship',
    fbLocal: 'FB Local'
  }

  return {
    ebay: { fees: ebayFees.total, shipping, profit: ebayProfit, roi: ebayROI },
    mercari: { fees: mercariFees.total, shipping, profit: mercariProfit, roi: mercariROI },
    fbShipped: { fees: fbShippedFees.total, shipping, profit: fbShippedProfit, roi: fbShippedROI },
    fbLocal: { fees: 0, shipping: 0, profit: fbLocalProfit, roi: fbLocalROI },
    best: bestName[best[0]] || 'N/A'
  }
}
