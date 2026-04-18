import { cn } from '../../lib/utils'

const variants = {
  gold: 'bg-gold text-black',
  plum: 'bg-plum text-ivory',
  mauve: 'bg-mauve text-black',
  rose: 'bg-rose-nude text-black',
  ivory: 'bg-ivory text-black',
  outline: 'border border-gold text-gold',
  'outline-dark': 'border border-black/40 text-black',
  dark: 'bg-black text-ivory',
  muted: 'bg-taupe/20 text-ivory',
}

export default function Badge({ variant = 'gold', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.25em] rounded-full',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    pending: 'muted',
    confirmed: 'mauve',
    processing: 'mauve',
    shipped: 'gold',
    delivered: 'gold',
    cancelled: 'rose',
    refunded: 'rose',
    paid: 'gold',
    failed: 'rose',
  }
  return <Badge variant={map[status] || 'muted'}>{status}</Badge>
}
