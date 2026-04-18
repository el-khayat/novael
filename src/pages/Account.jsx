import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import * as Tabs from '@radix-ui/react-tabs'
import { Package, Heart, User, MapPin, Ticket, LogOut, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useUserOrders } from '../hooks/useOrders'
import { useWishlist } from '../hooks/useWishlist'
import { useUserPromos } from '../hooks/usePromo'
import { formatPrice, formatDate, getInitials, cn } from '../lib/utils'
import GoldDivider from '../components/common/GoldDivider.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import ProductGrid from '../components/product/ProductGrid.jsx'
import Badge, { StatusBadge } from '../components/ui/Badge.jsx'
import { toast } from '../components/ui/Toast.jsx'

const tabs = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'promos', label: 'Promo Codes', icon: Ticket },
]

export default function Account() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const logout = useAuthStore((s) => s.logout)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const isAdmin = useAuthStore((s) => s.isAdmin)

  const { orders } = useUserOrders()
  const wishlist = useWishlist()
  const { available, used } = useUserPromos()

  const [profileDraft, setProfileDraft] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  })

  const saveProfile = async () => {
    try {
      await updateProfile(profileDraft)
      toast.success('Profile updated')
    } catch (err) {
      toast.error('Update failed', err.message)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const wishlistProducts = wishlist.items.map((it) => it.product)

  return (
    <>
      <Helmet><title>My Account — Novaël</title></Helmet>
      <section className="pt-[calc(var(--nav-height)+40px)] pb-20 bg-black text-ivory min-h-screen">
        <div className="container-nvl">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-16 h-16 rounded-full bg-gold text-black flex items-center justify-center font-display text-xl font-semibold">
              {getInitials(profile?.full_name || profile?.email || 'U')}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-1">My Account</div>
              <h1 className="font-display text-3xl uppercase tracking-[0.15em]">
                {profile?.full_name || 'Welcome'}
              </h1>
              <p className="text-ivory/50 text-sm mt-1">{profile?.email}</p>
            </div>
          </div>
          <GoldDivider width="100%" animate={false} className="opacity-20 mb-10" />

          <Tabs.Root defaultValue="overview" className="grid lg:grid-cols-[240px_1fr] gap-10">
            <Tabs.List className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {tabs.map((t) => {
                const Icon = t.icon
                return (
                  <Tabs.Trigger
                    key={t.id}
                    value={t.id}
                    className="group flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-ivory/60 hover:text-ivory whitespace-nowrap data-[state=active]:text-gold data-[state=active]:bg-gold/5 data-[state=active]:border-l-2 data-[state=active]:border-gold border-l-2 border-transparent transition-all"
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </Tabs.Trigger>
                )
              })}
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-gold hover:text-ivory mt-4 border-l-2 border-gold/50 bg-gold/5">
                  Admin <ArrowRight className="w-3 h-3" />
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-ivory/60 hover:text-rose-nude mt-auto lg:mt-8 border-l-2 border-transparent"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </Tabs.List>

            <div className="min-h-[400px]">
              <Tabs.Content value="overview">
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <Stat label="Orders" value={orders.length} />
                  <Stat label="Wishlist" value={wishlist.items.length} />
                  <Stat label="Codes Available" value={available.length} accent />
                </div>
                {orders[0] && (
                  <div className="bg-ivory/5 border border-gold/10 p-6">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-3">Latest Order</div>
                    <OrderRow order={orders[0]} />
                  </div>
                )}
              </Tabs.Content>

              <Tabs.Content value="orders">
                <h2 className="font-display uppercase tracking-[0.2em] text-lg mb-6">Order History</h2>
                {orders.length === 0 ? (
                  <p className="text-ivory/50">No orders yet.</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o) => <OrderRow key={o.id} order={o} />)}
                  </div>
                )}
              </Tabs.Content>

              <Tabs.Content value="profile">
                <h2 className="font-display uppercase tracking-[0.2em] text-lg mb-6">Profile Settings</h2>
                <div className="space-y-6 max-w-lg">
                  <Input
                    label="Full Name"
                    dark
                    value={profileDraft.full_name}
                    onChange={(e) => setProfileDraft({ ...profileDraft, full_name: e.target.value })}
                  />
                  <Input label="Email" dark value={profile?.email || ''} disabled />
                  <Input
                    label="Phone"
                    dark
                    value={profileDraft.phone}
                    onChange={(e) => setProfileDraft({ ...profileDraft, phone: e.target.value })}
                  />
                  <Button variant="filled" onClick={saveProfile}>Save Changes</Button>
                </div>
              </Tabs.Content>

              <Tabs.Content value="addresses">
                <h2 className="font-display uppercase tracking-[0.2em] text-lg mb-6">Saved Addresses</h2>
                <p className="text-ivory/50 text-sm">
                  Your shipping addresses will appear here after your first order.
                </p>
              </Tabs.Content>

              <Tabs.Content value="wishlist">
                <h2 className="font-display uppercase tracking-[0.2em] text-lg mb-6">Wishlist</h2>
                <ProductGrid products={wishlistProducts} loading={wishlist.loading} empty="Your wishlist is empty." columns={3} />
              </Tabs.Content>

              <Tabs.Content value="promos">
                <h2 className="font-display uppercase tracking-[0.2em] text-lg mb-6">Your Promo Codes</h2>
                {available.length === 0 ? (
                  <p className="text-ivory/50 text-sm">No promo codes available right now.</p>
                ) : (
                  <div className="space-y-4">
                    {available.map((p) => (
                      <div key={p.id} className="flex items-center justify-between border border-gold/30 bg-gold/5 p-5">
                        <div>
                          <div className="font-display text-lg uppercase tracking-[0.25em] text-gold">{p.code}</div>
                          <div className="text-xs text-ivory/60 mt-1">
                            {p.discount_type === 'percentage' ? `${p.discount_value}% off` : `$${p.discount_value} off`}
                            {p.min_order > 0 && ` · Min order $${p.min_order}`}
                          </div>
                        </div>
                        <Badge variant="outline">Available</Badge>
                      </div>
                    ))}
                    {used.length > 0 && (
                      <div className="mt-8">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-ivory/50 mb-3">Used</div>
                        {used.map((u) => (
                          <div key={u.id} className="flex items-center justify-between border border-ivory/10 p-4 text-ivory/50">
                            <span className="font-display text-sm uppercase tracking-[0.2em]">{u.promo_code}</span>
                            <span className="text-xs">{formatDate(u.used_at)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </div>
      </section>
    </>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div className="bg-ivory/5 border border-gold/10 p-6">
      <div className="text-[10px] uppercase tracking-[0.25em] text-ivory/50 mb-3">{label}</div>
      <div className={cn('font-display text-3xl', accent ? 'text-gold' : '')}>{value}</div>
    </div>
  )
}

function OrderRow({ order }) {
  return (
    <Link
      to={`/order-confirmation/${order.id}`}
      className="flex flex-col sm:flex-row sm:items-center gap-4 border border-gold/10 p-5 hover:border-gold/40 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="font-display text-sm uppercase tracking-[0.2em]">{order.order_number}</div>
        <div className="text-xs text-ivory/50 mt-1">{formatDate(order.created_at)}</div>
      </div>
      <StatusBadge status={order.status} />
      <div className="text-sm text-gold font-medium">{formatPrice(order.total)}</div>
    </Link>
  )
}
