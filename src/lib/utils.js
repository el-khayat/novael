import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value, currency = 'USD', locale = 'en-US') {
  if (value == null || isNaN(Number(value))) return ''
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(value))
}

export function truncateText(text, max = 120) {
  if (!text) return ''
  return text.length > max ? text.slice(0, max).trim() + '…' : text
}

export function slugify(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function formatDate(date, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', opts)
}

export function formatDateTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function generateOrderNumber(sequence = null) {
  const year = new Date().getFullYear()
  const seq = sequence ?? Math.floor(Math.random() * 99999)
  return `NVL-${year}-${String(seq).padStart(5, '0')}`
}

export function calculateOrderTotals({ items = [], promo = null, shippingCost = 0, taxRate = 0 }) {
  const subtotal = items.reduce((sum, it) => sum + Number(it.price) * it.qty, 0)
  let discountAmount = 0
  if (promo) {
    if (subtotal >= (promo.min_order || 0)) {
      if (promo.discount_type === 'percentage') {
        discountAmount = subtotal * (Number(promo.discount_value) / 100)
      } else if (promo.discount_type === 'fixed') {
        discountAmount = Math.min(Number(promo.discount_value), subtotal)
      }
    }
  }
  const discounted = Math.max(0, subtotal - discountAmount)
  const taxAmount = +(discounted * taxRate).toFixed(2)
  const total = +(discounted + shippingCost + taxAmount).toFixed(2)
  return {
    subtotal: +subtotal.toFixed(2),
    discountAmount: +discountAmount.toFixed(2),
    shippingCost: +shippingCost.toFixed(2),
    taxAmount,
    total,
  }
}

export function calculateShipping() {
  return 0
}

export function percentOff(price, comparePrice) {
  if (!comparePrice || comparePrice <= price) return 0
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

export function getInitials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
}

export function downloadCSV(rows, filename = 'export.csv') {
  if (!rows?.length) return
  const headers = Object.keys(rows[0])
  const escape = (v) => {
    if (v == null) return ''
    const s = String(v).replace(/"/g, '""')
    return /[",\n]/.test(s) ? `"${s}"` : s
  }
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export const isBrowser = typeof window !== 'undefined'
