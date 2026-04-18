import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useOrder } from '../hooks/useOrders'
import { useAuthStore } from '../store/authStore'
import { formatPrice, formatDate } from '../lib/utils'
import Spinner from '../components/ui/Spinner.jsx'
import GoldDivider from '../components/common/GoldDivider.jsx'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const { order, loading } = useOrder(orderId)
  const user = useAuthStore((s) => s.user)

  if (loading) {
    return (
      <div className="min-h-screen pt-[var(--nav-height)] flex items-center justify-center bg-black">
        <Spinner size="lg" label="Preparing order" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-[var(--nav-height)] container-nvl flex flex-col items-center justify-center text-center">
        <h1 className="font-display text-3xl uppercase tracking-[0.2em] mb-6">Order Not Found</h1>
        <Link to="/" className="btn-luxe">Home</Link>
      </div>
    )
  }

  const name = order.shipping_address?.name || 'Valued Customer'
  const firstName = name.split(' ')[0]
  const itemCount = (order.items || []).reduce((s, it) => s + it.qty, 0)

  const est = new Date()
  est.setDate(est.getDate() + 5)
  const est2 = new Date()
  est2.setDate(est2.getDate() + 7)

  return (
    <>
      <Helmet><title>Thank You — Novaël</title></Helmet>
      <section className="min-h-screen pt-[calc(var(--nav-height)+40px)] pb-20 bg-black text-ivory grain-overlay">
        <div className="container-nvl max-w-3xl mx-auto text-center">
          <motion.svg
            width="80" height="80" viewBox="0 0 80 80" className="mx-auto mb-8"
            initial="hidden" animate="visible"
          >
            <motion.circle
              cx="40" cy="40" r="36" fill="none" stroke="#C6A97A" strokeWidth="1.5"
              variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1, transition: { duration: 1.1, ease: 'easeOut' } } }}
            />
            <motion.path
              d="M25 40 L36 51 L56 30" fill="none" stroke="#C6A97A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1, transition: { delay: 0.7, duration: 0.6, ease: 'easeOut' } } }}
            />
          </motion.svg>

          <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">Order Confirmed</div>
          <h1 className="font-display text-4xl md:text-6xl uppercase tracking-[0.15em] leading-tight">Thank You, {firstName}</h1>
          <GoldDivider center className="mt-8" />

          <p className="text-ivory/60 mt-8 max-w-md mx-auto">
            Your order has been received. A confirmation has been sent to your inbox.
          </p>

          <div className="mt-10 grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <InfoTile label="Order Number" value={order.order_number} />
            <InfoTile label="Items" value={itemCount} />
            <InfoTile label="Total" value={formatPrice(order.total)} accent />
          </div>

          <div className="mt-12 bg-ivory/5 border border-gold/10 p-8 text-left">
            <h3 className="font-display uppercase tracking-[0.2em] mb-6">Order Summary</h3>
            <div className="space-y-4">
              {(order.items || []).map((it, i) => (
                <div key={i} className="flex gap-4 items-center border-b border-gold/10 pb-4 last:border-0">
                  <div className="w-16 h-16 bg-ivory/10 shrink-0">
                    {it.image && <img src={it.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-display text-sm uppercase tracking-[0.15em]">{it.name}</div>
                    {it.variantName && <div className="text-xs text-ivory/50 mt-1">{it.variantName}</div>}
                    <div className="text-xs text-ivory/60 mt-1">Qty {it.qty}</div>
                  </div>
                  <div className="text-sm">{formatPrice(it.price * it.qty)}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gold/10 text-[11px] uppercase tracking-[0.2em] text-ivory/60 text-center">
              Expected delivery: {formatDate(est)} – {formatDate(est2)}
            </div>
          </div>

          {!user && (
            <div className="mt-10 p-6 border border-gold/30 bg-gold/5 text-left">
              <h4 className="font-display uppercase tracking-[0.2em] text-sm mb-2">Save Your Order History</h4>
              <p className="text-sm text-ivory/60 mb-4">Create an account to track your order and earn rewards.</p>
              <Link to={`/register?redirect=account`} className="btn-luxe btn-luxe--filled">Create Account</Link>
            </div>
          )}

          <div className="mt-12">
            <Link to="/shop" className="btn-luxe">Continue Shopping</Link>
          </div>
        </div>
      </section>
    </>
  )
}

function InfoTile({ label, value, accent }) {
  return (
    <div className="bg-ivory/5 border border-gold/10 p-5">
      <div className="text-[10px] uppercase tracking-[0.25em] text-ivory/50 mb-2">{label}</div>
      <div className={`font-display text-lg uppercase tracking-[0.15em] ${accent ? 'text-gold' : ''}`}>{value}</div>
    </div>
  )
}
