import { Link } from 'react-router-dom'
import { Minus, Plus, X } from 'lucide-react'
import { formatPrice, cn } from '../../lib/utils'
import { useCartStore } from '../../store/cartStore'

export default function CartItem({ item, dark = false, compact = true }) {
  const updateQty = useCartStore((s) => s.updateQty)
  const removeItem = useCartStore((s) => s.removeItem)

  return (
    <div className={cn('flex gap-4 py-5', dark ? 'border-b border-ivory/10' : 'border-b border-black/10')}>
      <Link to={`/shop/${item.slug}`} className={cn('shrink-0 overflow-hidden bg-ivory/10', compact ? 'w-20 h-20' : 'w-28 h-28')}>
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-taupe/20" />
        )}
      </Link>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/shop/${item.slug}`} className="block font-display text-[13px] uppercase tracking-[0.18em] truncate hover:text-gold transition-colors">
              {item.name}
            </Link>
            {item.variantName && (
              <div className={cn('text-[11px] mt-1', dark ? 'text-ivory/50' : 'text-black/50')}>{item.variantName}</div>
            )}
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className={cn('text-[11px] uppercase tracking-[0.2em]', dark ? 'text-ivory/50 hover:text-gold' : 'text-black/50 hover:text-black')}
            aria-label="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className={cn('inline-flex items-center border', dark ? 'border-ivory/20' : 'border-black/20')}>
            <button
              onClick={() => updateQty(item.id, item.qty - 1)}
              className={cn('w-8 h-8 flex items-center justify-center', dark ? 'hover:bg-ivory/5' : 'hover:bg-black/5')}
              disabled={item.qty <= 1}
              aria-label="Decrease"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm">{item.qty}</span>
            <button
              onClick={() => updateQty(item.id, item.qty + 1)}
              className={cn('w-8 h-8 flex items-center justify-center', dark ? 'hover:bg-ivory/5' : 'hover:bg-black/5')}
              disabled={item.qty >= item.maxQty}
              aria-label="Increase"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className={cn('text-sm font-medium', dark ? 'text-gold' : 'text-black')}>
            {formatPrice(item.price * item.qty)}
          </div>
        </div>
      </div>
    </div>
  )
}
