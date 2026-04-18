import { cn } from '../../lib/utils'

export default function Spinner({ size = 'md', label, className }) {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div
        className={cn(
          'rounded-full border-2 border-gold/30 border-t-gold animate-spin',
          sizeMap[size],
        )}
      />
      {label && (
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold/80 font-display">{label}</span>
      )}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="font-display text-3xl tracking-[0.3em] text-gold animate-pulseGold">NOVAËL</div>
        <div className="gold-divider" />
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-ivory">
      <div className="skeleton aspect-square w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-3 w-3/4" />
        <div className="skeleton h-3 w-1/3" />
      </div>
    </div>
  )
}
