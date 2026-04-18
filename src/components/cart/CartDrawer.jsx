import { AnimatePresence, motion } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCartStore } from '../../store/cartStore'
import CartItem from './CartItem.jsx'
import { formatPrice } from '../../lib/utils'
import { usePromo } from '../../hooks/usePromo'
import { toast } from '../ui/Toast.jsx'

export default function CartDrawer() {
  const { items, isOpen, closeCart, promo, applyPromo, removePromo, getTotals } = useCartStore()
  const { validate, loading } = usePromo()
  const [code, setCode] = useState('')

  const { subtotal, discountAmount, total } = getTotals(0, 0)

  const handlePromo = async (e) => {
    e.preventDefault()
    const validated = await validate(code, subtotal)
    if (validated) {
      applyPromo(validated)
      toast.success('Promo applied', `${validated.code} — you saved!`)
      setCode('')
    } else {
      toast.error('Invalid promo code')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-[890] bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-0 right-0 z-[895] h-full w-full sm:w-[420px] bg-ivory text-black flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-[var(--nav-height)] border-b border-black/10">
              <h2 className="font-display text-lg uppercase tracking-[0.25em]">
                Your Cart <span className="text-gold">({items.length})</span>
              </h2>
              <button onClick={closeCart} aria-label="Close" className="p-2 text-black/60 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="py-20 flex flex-col items-center text-center gap-6">
                  <Sparkles className="w-10 h-10 text-gold" />
                  <p className="font-display text-lg uppercase tracking-[0.2em]">Your cart is empty</p>
                  <Link to="/shop" onClick={closeCart} className="btn-luxe btn-luxe--dark">
                    Explore
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-black/5">
                  {items.map((item) => <CartItem key={item.id} item={item} />)}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-black/10 p-6 space-y-4 bg-ivory">
                {!promo ? (
                  <form onSubmit={handlePromo} className="flex gap-2">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="PROMO CODE"
                      className="flex-1 h-10 px-3 bg-transparent border border-black/20 text-[11px] uppercase tracking-[0.2em] focus:border-black outline-none"
                    />
                    <button type="submit" disabled={loading || !code} className="btn-luxe btn-luxe--dark h-10 px-4 text-[10px]">
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-black text-ivory text-[11px] uppercase tracking-[0.2em]">
                    <span className="text-gold">{promo.code} applied</span>
                    <button onClick={removePromo} className="text-ivory/60 hover:text-gold">Remove</button>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-black/60">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-gold">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-display uppercase tracking-[0.2em] text-base pt-3 border-t border-black/10">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="text-[10px] text-black/50">Free shipping over $75. Taxes calculated at checkout.</p>

                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="btn-luxe btn-luxe--dark w-full h-12"
                >
                  Proceed to Checkout
                </Link>
                <button onClick={closeCart} className="w-full text-[11px] uppercase tracking-[0.25em] text-black/60 hover:text-black py-2">
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
