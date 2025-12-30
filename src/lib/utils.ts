import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// All prices stored as INTEGER cents (e.g., 3500 = $35.00)
export type Cents = number

/** Convert cents to display string: 3500 → "$35.00" */
export function formatCents(cents: Cents | null | undefined): string {
  if (cents === null || cents === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

/** Convert dollars to cents: 35.00 → 3500 */
export function toCents(dollars: number): Cents {
  return Math.round(dollars * 100)
}

/** Convert cents to dollars: 3500 → 35.00 */
export function toDollars(cents: Cents): number {
  return cents / 100
}

/** Parse price string to cents: "$35.00" or "35" → 3500 */
export function parseToCents(value: string | number): Cents {
  if (typeof value === 'number') return toCents(value)
  const cleaned = value.replace(/[$,]/g, '')
  const dollars = parseFloat(cleaned) || 0
  return toCents(dollars)
}

/** Parse price, returns dollars (for backwards compat with transplanted code) */
export function parsePrice(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const cleaned = value.replace(/[$,]/g, '')
  return parseFloat(cleaned) || 0
}

/** Format a number as percentage */
export function formatPercent(value: number): string {
  if (!isFinite(value)) return '∞%'
  return `${value.toFixed(0)}%`
}

/** Format ROI with color indicator */
export function getRoiIndicator(roi: number): { label: string; className: string } {
  if (roi >= 100) return { label: '🔥', className: 'text-green-600' }
  if (roi >= 50) return { label: '✓', className: 'text-green-500' }
  if (roi >= 20) return { label: '~', className: 'text-yellow-500' }
  if (roi >= 0) return { label: '↓', className: 'text-orange-500' }
  return { label: '✗', className: 'text-red-500' }
}
