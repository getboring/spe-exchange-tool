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

/** Calculate profit (value - cost) */
export function calculateProfit(value: number, cost: number): number {
  return value - cost
}

/** Calculate ROI percentage */
export function calculateROI(profit: number, cost: number): number {
  return cost > 0 ? (profit / cost) * 100 : 0
}

/** Format relative time (e.g., "5m ago", "2d ago") */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return then.toLocaleDateString()
}
