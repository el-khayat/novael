import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Plus } from 'lucide-react'
import { formatPrice, percentOff, cn } from '../../lib/utils'
import Badge from '../ui/Badge.jsx'
import { useCartStore } from '../../store/cartStore'
import { useWishlist } from '../../hooks/useWishlist'
import { useAuthStore } from '../../store/authStore'
import { toast } from '../ui/Toast.jsx'

const fallbackImg = 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=900&q=80'

export default function ProductCard({ product, index = 0 }) {
  const [hover, setHover] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const user = useAuthStore((s) => s.user)
  const wishlist = useWishlist()

  const image1 = product.images?.[0] || fallbackImg
  const image2 = product.images?.[1] || image1
  const off = percentOff(product.price, product.compare_price)

  const onAdd = (e) => {
    e.preventDefault()
    addItem(product, null, 1)
    toast.success('Added to your cart', product.name)
  }

  const toggleWishlist = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.info('Sign in required', 'Create an account to save favorites.')
      return
    }
    const added = await wishlist.toggle(product.id)
    toast.success(added ? 'Saved to wishlist' : 'Removed from wishlist', product.name)
  }

  const isFav = user ? wishlist.has(product.id) : false

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      className="group"
    >
      <Link
        to={`/shop/${product.slug}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="block bg-ivory text-black relative overflow-hidden"
      >
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {product.is_featured && <Badge variant="gold">Bestseller</Badge>}
          {off > 0 && <Badge variant="plum">-{off}%</Badge>}
          {product.tags?.includes('new') && <Badge variant="outline-dark">New</Badge>}
        </div>

        <button
          onClick={toggleWishlist}
          aria-label="Wishlist"
          className={cn(
            'absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-ivory/80 backdrop-blur flex items-center justify-center transition-all',
            'hover:bg-gold hover:text-black',
            isFav ? 'text-gold bg-black' : 'text-black/60',
          )}
        >
          <Heart className={cn('w-4 h-4', isFav && 'fill-current')} />
        </button>

        <div className="relative aspect-square overflow-hidden bg-[#EEE8DE]">
          <img
            src={image1}
            alt={product.name}
            loading="lazy"
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-luxe',
              hover ? 'opacity-0 scale-110' : 'opacity-100 scale-100',
            )}
          />
          <img
            src={image2}
            alt=""
            loading="lazy"
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-luxe',
              hover ? 'opacity-100 scale-105' : 'opacity-0 scale-100',
            )}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: hover ? 0 : '100%' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute left-0 right-0 bottom-0 bg-black text-ivory"
          >
            <button
              onClick={onAdd}
              className="w-full py-4 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] hover:text-gold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Quick Add
            </button>
          </motion.div>
        </div>

        <div className="p-5 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-sm uppercase tracking-[0.18em] truncate group-hover:text-gold transition-colors">
              {product.name}
            </h3>
            {product.short_desc && (
              <p className="text-[11px] text-black/50 mt-1 tracking-[0.05em] truncate">{product.short_desc}</p>
            )}
          </div>
          <div className="text-right">
            {product.compare_price && product.compare_price > product.price && (
              <div className="text-[11px] text-taupe line-through">{formatPrice(product.compare_price)}</div>
            )}
            <div className="text-sm font-medium text-gold">{formatPrice(product.price)}</div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
