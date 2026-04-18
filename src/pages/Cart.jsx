import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '../store/cartStore'
import CartItem from '../components/cart/CartItem.jsx'
import { formatPrice } from '../lib/utils'
import { usePromo } from '../hooks/usePromo'
import { toast } from '../components/ui/Toast.jsx'
import GoldDivider from '../components/common/GoldDivider.jsx'

export default function Cart() {
  const { items, promo, applyPromo, removePromo, getTotals } = useCartStore()
  const { validate, loading } = usePromo()
  const [code, setCode] = useState('')

  const { subtotal, discountAmount, total } = getTotals(0, 0)

  const handlePromo = async (e) => {
    e.preventDefault()
    const v = await validate(code, subtotal)
    if (v) {
      applyPromo(v)
      toast.success('Promo applied', v.code)
      setCode('')
    } else toast.error('Invalid promo code')
  }

  return (
    <>
      <Helmet><title>Cart — Novaël</title></Helmet>

      <section className="pt-[calc(var(--nav-height)+60px)] pb-20 bg-black text-ivory min-h-[90vh]">
        <div className="container-nvl">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl uppercase tracking-[0.18em]">Your Cart</h1>
            <GoldDivider center className="mt-8" />
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-12 h-12 mx-auto text-gold mb-6" />
              <p className="font-display text-2xl uppercase tracking-[0.2em] mb-8">Your cart is empty</p>
              <Link to="/shop" className="btn-luxe">Explore The Collection</Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_380px] gap-12">
              <div>
                {items.map((it) => <CartItem key={it.id} item={it} dark compact={false} />)}
              </div>
              <aside className="bg-ivory/5 border border-gold/10 p-8 self-start sticky top-[calc(var(--nav-height)+20px)]">
                <h3 className="font-display uppercase tracking-[0.2em] mb-6">Order Summary</h3>

                {!promo ? (
                  <form onSubmit={handlePromo} className="flex gap-2 mb-6">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="PROMO CODE"
                      className="flex-1 h-10 px-3 bg-transparent border border-ivory/20 text-[11px] uppercase tracking-[0.2em] focus:border-gold outline-none text-ivory"
                    />
                    <button type="submit" disabled={loading || !code} className="btn-luxe h-10 px-4 text-[10px]">Apply</button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gold/10 border border-gold/30 mb-6 text-[11px] uppercase tracking-[0.2em]">
                    <span className="text-gold">{promo.code}</span>
                    <button onClick={removePromo} className="text-ivory/60 hover:text-gold">Remove</button>
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  <Row label="Subtotal" value={formatPrice(subtotal)} />
                  {discountAmount > 0 && <Row label="Discount" value={`-${formatPrice(discountAmount)}`} accent />}
                  <Row label="Shipping" value="Calculated at checkout" muted />
                </div>
                <div className="flex justify-between pt-4 mt-4 border-t border-gold/10 font-display uppercase tracking-[0.2em] text-base">
                  <span>Total</span>
                  <span className="text-gold">{formatPrice(total)}</span>
                </div>

                <Link to="/checkout" className="btn-luxe btn-luxe--filled w-full mt-8 h-14">
                  Checkout
                </Link>
                <Link to="/shop" className="block text-center text-[11px] uppercase tracking-[0.25em] text-ivory/60 hover:text-gold mt-6">
                  Continue Shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function Row({ label, value, muted, accent }) {
  return (
    <div className="flex justify-between">
      <span className={muted ? 'text-ivory/50' : 'text-ivory/70'}>{label}</span>
      <span className={accent ? 'text-gold' : ''}>{value}</span>
    </div>
  )
}
