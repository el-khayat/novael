import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, Lock, ArrowLeft, Banknote } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { usePlaceOrder } from '../hooks/useOrders'
import { usePromo } from '../hooks/usePromo'
import { SHIPPING_OPTIONS } from '../config/brand'
import { formatPrice, cn } from '../lib/utils'
import Input from '../components/ui/Input.jsx'
import { toast } from '../components/ui/Toast.jsx'
import Modal from '../components/ui/Modal.jsx'
import Button from '../components/ui/Button.jsx'
import GoldDivider from '../components/common/GoldDivider.jsx'
import Logo from '../components/common/Logo.jsx'

const shippingSchema = z.object({
  email: z.string().email('Valid email required'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().min(5, 'Required'),
  address1: z.string().min(3, 'Required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
  saveAddress: z.boolean().optional(),
})

const steps = ['Contact', 'Shipping', 'Review']

export default function Checkout() {
  const navigate = useNavigate()
  const { items, promo, applyPromo, getTotals, clearCart } = useCartStore()
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const { placeOrder } = usePlaceOrder()
  const { validate } = usePromo()

  const [step, setStep] = useState(0)
  const [signInPromptShown, setSignInPromptShown] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)
  const [shippingAddress, setShippingAddress] = useState(null)
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [promoInput, setPromoInput] = useState('')
  const [placing, setPlacing] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      email: profile?.email || user?.email || '',
      firstName: profile?.full_name?.split(' ')[0] || '',
      lastName: profile?.full_name?.split(' ').slice(1).join(' ') || '',
      phone: profile?.phone || '',
      address1: '', address2: '', city: '', country: 'MA',
    },
  })

  useEffect(() => {
    if (!user && !signInPromptShown && items.length > 0) {
      setSignInOpen(true)
      setSignInPromptShown(true)
    }
  }, [user, signInPromptShown, items.length])

  useEffect(() => {
    if (items.length === 0 && !placing) {
      const t = setTimeout(() => navigate('/cart'), 400)
      return () => clearTimeout(t)
    }
  }, [items.length, navigate, placing])

  const shippingCost = 0

  const totals = getTotals(shippingCost, 0)

  const onShippingSubmit = (data) => {
    setShippingAddress(data)
    setStep(1)
  }

  const applyCheckoutPromo = async () => {
    const v = await validate(promoInput, totals.subtotal)
    if (v) {
      applyPromo(v)
      toast.success('Promo applied', v.code)
      setPromoInput('')
    } else toast.error('Invalid code')
  }

  const handlePlaceOrder = async () => {
    setPlacing(true)
    try {
      const order = await placeOrder({
        items: items.map((it) => ({
          productId: it.productId,
          variantId: it.variantId,
          name: it.name,
          variantName: it.variantName,
          image: it.image,
          slug: it.slug,
          price: it.price,
          qty: it.qty,
        })),
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        shippingCost: totals.shippingCost,
        taxAmount: totals.taxAmount,
        total: totals.total,
        promoCode: promo?.code || null,
        shippingAddress: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
          address1: shippingAddress.address1,
          address2: shippingAddress.address2 || '',
          city: shippingAddress.city,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
        },
        guestEmail: shippingAddress.email,
      })
      clearCart()
      navigate(`/order-confirmation/${order.id}`)
    } catch (err) {
      toast.error('Could not place order', err.message || 'Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0 && !placing) {
    return (
      <div className="pt-[calc(var(--nav-height)+100px)] container-nvl text-center">
        <p className="text-ivory/60">Your cart is empty.</p>
      </div>
    )
  }

  return (
    <>
      <Helmet><title>Checkout — Novaël</title></Helmet>

      <section className="pt-[calc(var(--nav-height)+40px)] pb-20 bg-black text-ivory min-h-screen">
        <div className="container-nvl">
          <div className="flex items-center justify-between mb-10">
            <Link to="/cart" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ivory/60 hover:text-gold">
              <ArrowLeft className="w-3 h-3" /> Back to Cart
            </Link>
            <Logo size="md" color="ivory" />
            <Link to="/" className="text-[11px] uppercase tracking-[0.25em] text-ivory/60 hover:text-gold flex items-center gap-2">
              <Lock className="w-3 h-3 text-gold" /> Secure
            </Link>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-between">
              {steps.map((label, i) => (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full border flex items-center justify-center text-[11px] font-display',
                        i < step ? 'bg-gold border-gold text-black'
                          : i === step ? 'border-gold text-gold'
                          : 'border-ivory/20 text-ivory/40',
                      )}
                    >
                      {i < step ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={cn('mt-2 text-[10px] uppercase tracking-[0.2em]', i === step ? 'text-gold' : 'text-ivory/50')}>
                      {label}
                    </span>
                  </div>
                  {i < steps.length - 1 && <div className={cn('flex-1 h-px mx-2', i < step ? 'bg-gold' : 'bg-ivory/10')} />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-12">
            <div className="space-y-8">
              {step === 0 && (
                <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-6 bg-ivory/5 border border-gold/10 p-8">
                  <h2 className="font-display uppercase tracking-[0.2em] mb-6">Contact & Shipping</h2>

                  <Input label="Email" type="email" dark {...register('email')} error={errors.email?.message} />

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input label="First Name" dark {...register('firstName')} error={errors.firstName?.message} />
                    <Input label="Last Name" dark {...register('lastName')} error={errors.lastName?.message} />
                  </div>

                  <Input label="Phone" dark {...register('phone')} error={errors.phone?.message} />
                  <Input label="Address" dark {...register('address1')} error={errors.address1?.message} />
                  <Input label="Apartment, Suite (optional)" dark {...register('address2')} />

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input label="City" dark {...register('city')} error={errors.city?.message} />
                    <div>
                      <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-ivory/70">Country</label>
                      <div className="w-full h-12 border-b border-gold/30 text-ivory text-[14px] flex items-center">Morocco</div>
                      <input type="hidden" {...register('country')} value="MA" />
                    </div>
                  </div>

                  {user && (
                    <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-ivory/60 cursor-pointer">
                      <input type="checkbox" {...register('saveAddress')} className="accent-gold" />
                      Save this address to my account
                    </label>
                  )}

                  <Button type="submit" variant="filled" className="w-full">Continue to Shipping</Button>
                </form>
              )}

              {step === 1 && (
                <div className="bg-ivory/5 border border-gold/10 p-8 space-y-4">
                  <h2 className="font-display uppercase tracking-[0.2em] mb-6">Shipping Method</h2>
                  <div className="flex items-center justify-between p-5 border border-gold bg-gold/5">
                    <div className="flex items-center gap-4">
                      <Check className="w-4 h-4 text-gold shrink-0" />
                      <div>
                        <div className="font-display text-sm uppercase tracking-[0.2em]">Standard Shipping</div>
                        <div className="text-xs text-ivory/50 mt-1">5–7 business days</div>
                      </div>
                    </div>
                    <div className="text-sm font-display uppercase tracking-[0.15em] text-gold">Free</div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
                    <Button variant="filled" className="flex-1" onClick={() => setStep(2)}>Review Order</Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="bg-ivory/5 border border-gold/10 p-8 space-y-6">
                  <h2 className="font-display uppercase tracking-[0.2em] mb-6">Review & Confirm</h2>

                  <ReviewSection title="Ship To">
                    <div className="text-sm text-ivory/80">
                      {shippingAddress.firstName} {shippingAddress.lastName}<br />
                      {shippingAddress.address1} {shippingAddress.address2}<br />
                      {shippingAddress.city}<br />
                      Morocco<br />
                      {shippingAddress.email} · {shippingAddress.phone}
                    </div>
                  </ReviewSection>

                  <ReviewSection title="Shipping">
                    <div className="text-sm text-ivory/80">
                      {SHIPPING_OPTIONS.find((o) => o.id === shippingMethod)?.label} — {SHIPPING_OPTIONS.find((o) => o.id === shippingMethod)?.eta}
                    </div>
                  </ReviewSection>

                  <ReviewSection title="Payment">
                    <div className="flex items-center gap-3 text-sm text-ivory/80">
                      <Banknote className="w-5 h-5 text-gold shrink-0" />
                      <div>
                        <div className="font-display uppercase tracking-[0.15em] text-ivory">Cash on Delivery</div>
                        <div className="text-[11px] text-ivory/50 mt-1">You pay when your order arrives.</div>
                      </div>
                    </div>
                  </ReviewSection>

                  <div className="pt-2">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">Promo Code</div>
                    <div className="flex gap-2">
                      <input
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 h-10 px-3 bg-transparent border border-ivory/20 text-[11px] uppercase tracking-[0.2em] text-ivory focus:border-gold outline-none"
                      />
                      <Button variant="outline" size="sm" onClick={applyCheckoutPromo} disabled={!promoInput}>Apply</Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                    <Button
                      variant="filled"
                      className="flex-1"
                      onClick={handlePlaceOrder}
                      loading={placing}
                    >
                      Place Order · {formatPrice(totals.total)}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <aside className="bg-ivory/5 border border-gold/10 p-8 self-start sticky top-[calc(var(--nav-height)+20px)]">
              <h3 className="font-display uppercase tracking-[0.2em] mb-6">Your Order</h3>
              <div className="space-y-4 max-h-[280px] overflow-y-auto mb-6">
                {items.map((it) => (
                  <div key={it.id} className="flex gap-3 text-sm">
                    <div className="w-14 h-14 bg-ivory/10 relative shrink-0">
                      {it.image && <img src={it.image} alt="" className="w-full h-full object-cover" />}
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gold text-black text-[10px] flex items-center justify-center">{it.qty}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-[12px] uppercase tracking-[0.15em] truncate">{it.name}</div>
                      {it.variantName && <div className="text-[10px] text-ivory/50">{it.variantName}</div>}
                    </div>
                    <div className="text-sm">{formatPrice(it.price * it.qty)}</div>
                  </div>
                ))}
              </div>

              <GoldDivider width="100%" animate={false} className="opacity-20 my-4" />

              <div className="space-y-2 text-sm text-ivory/70">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(totals.subtotal)}</span></div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-gold"><span>Discount {promo && `(${promo.code})`}</span><span>-{formatPrice(totals.discountAmount)}</span></div>
                )}
                <div className="flex justify-between"><span>Shipping</span><span>{totals.shippingCost === 0 ? 'Free' : formatPrice(totals.shippingCost)}</span></div>
              </div>

              <div className="flex justify-between font-display uppercase tracking-[0.2em] pt-4 mt-4 border-t border-gold/10">
                <span>Total</span>
                <span className="text-gold">{formatPrice(totals.total)}</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Modal open={signInOpen} onOpenChange={setSignInOpen} title="Sign In For Exclusive Perks" size="sm">
        <ul className="space-y-3 text-sm text-black/70 mb-6">
          <li>• Save your order history</li>
          <li>• Earn loyalty points</li>
          <li>• Get 15% off your first order</li>
        </ul>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/login" className="btn-luxe btn-luxe--dark flex-1">Sign In</Link>
          <Link to="/register" className="btn-luxe flex-1 text-black border-black/40 hover:border-black">
            Create Account
          </Link>
        </div>
        <button
          onClick={() => setSignInOpen(false)}
          className="w-full mt-6 text-[11px] uppercase tracking-[0.25em] text-black/50 hover:text-black"
        >
          Continue as Guest →
        </button>
      </Modal>
    </>
  )
}

function ReviewSection({ title, children }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-3">{title}</div>
      {children}
    </div>
  )
}
