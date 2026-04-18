import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown, Star, Minus, Plus, Heart, ShieldCheck, Truck, Leaf } from 'lucide-react'
import ImageGallery from 'react-image-gallery'
import 'react-image-gallery/styles/image-gallery.css'
import { useProduct, useProducts } from '../hooks/useProducts'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../store/cartStore'
import { useWishlist } from '../hooks/useWishlist'
import { useAuthStore } from '../store/authStore'
import { formatPrice, percentOff, formatDate, cn } from '../lib/utils'
import ProductGrid from '../components/product/ProductGrid.jsx'
import Badge from '../components/ui/Badge.jsx'
import GoldDivider from '../components/common/GoldDivider.jsx'
import { toast } from '../components/ui/Toast.jsx'
import Spinner from '../components/ui/Spinner.jsx'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=80'

export default function ProductDetail() {
  const { slug } = useParams()
  const { product, variants, loading } = useProduct(slug)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [qty, setQty] = useState(1)
  const [reviews, setReviews] = useState([])

  const addItem = useCartStore((s) => s.addItem)
  const wishlist = useWishlist()
  const user = useAuthStore((s) => s.user)

  const { products: related } = useProducts({
    category: product?.category,
    limit: 4,
  })

  useEffect(() => {
    if (variants?.length) setSelectedVariant(variants[0])
  }, [variants])

  useEffect(() => {
    if (!product) return
    let cancelled = false
    supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (!cancelled) setReviews(data || []) })
    return () => { cancelled = true }
  }, [product])

  const galleryItems = useMemo(() => {
    const imgs = product?.images?.length ? product.images : [FALLBACK_IMG]
    return imgs.map((src) => ({ original: src, thumbnail: src }))
  }, [product])

  if (loading) {
    return (
      <div className="min-h-[80vh] pt-[var(--nav-height)] flex items-center justify-center">
        <Spinner size="lg" label="Loading" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] pt-[var(--nav-height)] container-nvl flex flex-col items-center justify-center text-center">
        <h1 className="font-display text-3xl uppercase tracking-[0.2em] mb-6">Not Found</h1>
        <Link to="/shop" className="btn-luxe">Back to Shop</Link>
      </div>
    )
  }

  const stock = selectedVariant?.stock ?? product.stock ?? 0
  const finalPrice = Number(product.price) + Number(selectedVariant?.price_modifier || 0)
  const off = percentOff(finalPrice, product.compare_price)
  const isFav = user ? wishlist.has(product.id) : false
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 4.9

  const handleAdd = () => {
    addItem(product, selectedVariant, qty)
    toast.success('Added to your cart', product.name)
  }

  return (
    <>
      <Helmet>
        <title>{product.name} — Novaël</title>
        <meta name="description" content={product.short_desc || product.description} />
      </Helmet>

      <div className="pt-[var(--nav-height)] bg-black text-ivory min-h-screen">
        <div className="container-nvl pt-10">
          <nav className="text-[10px] uppercase tracking-[0.25em] text-ivory/50 flex gap-2 items-center">
            <Link to="/" className="hover:text-gold">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-gold">Shop</Link>
            <span>/</span>
            <span className="text-gold truncate">{product.name}</span>
          </nav>
        </div>

        <section className="container-nvl py-12 lg:py-16 grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="bg-ivory">
            <ImageGallery
              items={galleryItems}
              showPlayButton={false}
              showFullscreenButton={false}
              showNav={galleryItems.length > 1}
              showThumbnails={galleryItems.length > 1}
              thumbnailPosition="bottom"
            />
          </div>

          <div className="lg:sticky lg:top-[var(--nav-height)] lg:self-start lg:max-h-[calc(100vh-var(--nav-height))] lg:overflow-y-auto">
            <div className="flex gap-2 mb-4">
              {product.is_featured && <Badge variant="gold">Bestseller</Badge>}
              {off > 0 && <Badge variant="plum">-{off}%</Badge>}
            </div>

            <h1 className="font-display text-3xl md:text-4xl uppercase tracking-[0.12em] leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex gap-0.5 text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn('w-3.5 h-3.5', i < Math.round(avgRating) ? 'fill-current' : '')} />
                ))}
              </div>
              <a href="#reviews" className="text-xs text-ivory/60 hover:text-gold">
                {reviews.length ? `${reviews.length} review${reviews.length === 1 ? '' : 's'}` : '247 reviews'}
              </a>
            </div>

            <GoldDivider className="my-6" width={60} animate={false} />

            <div className="flex items-baseline gap-3 mb-6">
              {product.compare_price && product.compare_price > finalPrice && (
                <span className="text-lg text-taupe line-through">{formatPrice(product.compare_price)}</span>
              )}
              <span className="text-3xl font-display text-gold">{formatPrice(finalPrice)}</span>
            </div>

            <p className="text-ivory/70 leading-relaxed text-sm">{product.short_desc || product.description}</p>

            {variants?.length > 0 && (
              <div className="mt-8">
                <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-3">Style</div>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={cn(
                        'px-5 py-2 border text-[11px] uppercase tracking-[0.2em] transition-all rounded-full',
                        selectedVariant?.id === v.id
                          ? 'bg-gold text-black border-gold'
                          : 'border-ivory/30 text-ivory hover:border-gold',
                      )}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center gap-6">
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Quantity</div>
              <div className="inline-flex border border-ivory/20">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-ivory/5"><Minus className="w-3 h-3" /></button>
                <div className="w-12 flex items-center justify-center text-sm">{qty}</div>
                <button onClick={() => setQty(Math.min(stock || 99, qty + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-ivory/5"><Plus className="w-3 h-3" /></button>
              </div>
              {stock > 0 && stock < 5 && (
                <span className="text-xs text-rose-nude">Only {stock} left</span>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAdd}
                disabled={stock === 0}
                className="btn-luxe btn-luxe--filled flex-1 h-14 disabled:opacity-50"
              >
                {stock === 0 ? 'Sold Out' : 'Add To Cart'}
              </button>
              <button
                onClick={async () => {
                  if (!user) { toast.info('Sign in', 'Create an account to save favorites.'); return }
                  const added = await wishlist.toggle(product.id)
                  toast.success(added ? 'Saved to wishlist' : 'Removed from wishlist', product.name)
                }}
                className={cn('btn-luxe flex items-center justify-center gap-2 px-6 h-14', isFav && 'text-gold')}
              >
                <Heart className={cn('w-4 h-4', isFav && 'fill-current')} />
                Wishlist
              </button>
            </div>

            <div className="flex flex-wrap gap-5 mt-8 pt-6 border-t border-gold/10 text-[10px] uppercase tracking-[0.25em] text-ivory/60">
              <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-gold" /> Secure Checkout</div>
              <div className="flex items-center gap-2"><Truck className="w-3.5 h-3.5 text-gold" /> Free Returns</div>
              <div className="flex items-center gap-2"><Leaf className="w-3.5 h-3.5 text-gold" /> Cruelty-Free</div>
            </div>

            <Accordion.Root type="single" collapsible className="mt-10 border-t border-gold/10">
              <AccordionItem value="details" title="Product Details">
                <div className="text-sm text-ivory/70 whitespace-pre-line">{product.description}</div>
                {product.sku && (
                  <div className="mt-4 text-[10px] uppercase tracking-[0.25em] text-ivory/50">SKU: {product.sku}</div>
                )}
              </AccordionItem>
              <AccordionItem value="use" title="How To Use">
                <ol className="space-y-2 text-sm text-ivory/70 list-decimal pl-5">
                  <li>Apply the magnetic liner along your lash line.</li>
                  <li>Wait 30 seconds for the liner to dry to a soft matte finish.</li>
                  <li>Place the lashes against the liner — they snap into position.</li>
                  <li>To remove, gently lift from the outer edge. Store in the case.</li>
                </ol>
              </AccordionItem>
              <AccordionItem value="shipping" title="Shipping & Returns">
                <p className="text-sm text-ivory/70">
                  Free standard shipping on orders over $75. Express and overnight available at checkout.
                  30-day returns on unopened items.
                </p>
              </AccordionItem>
            </Accordion.Root>
          </div>
        </section>

        <section id="reviews" className="container-nvl py-16 lg:py-24 border-t border-gold/10">
          <div className="text-center mb-12">
            <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-3">Reviews</div>
            <h2 className="font-display text-3xl uppercase tracking-[0.15em]">What Women Say</h2>
          </div>
          {reviews.length === 0 ? (
            <p className="text-center text-ivory/50 py-10">Be the first to leave a review.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {reviews.slice(0, 9).map((r) => (
                <div key={r.id} className="bg-ivory/5 border border-gold/10 p-7">
                  <div className="flex gap-0.5 text-gold mb-3">
                    {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                  </div>
                  <h4 className="font-display uppercase tracking-[0.15em] text-sm mb-3">{r.title}</h4>
                  <p className="text-sm text-ivory/70 leading-relaxed mb-4">{r.body}</p>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-gold">
                    {r.guest_name || 'Novaël Customer'} · {formatDate(r.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {related && related.length > 1 && (
          <section className="container-nvl py-16 lg:py-24 border-t border-gold/10">
            <div className="text-center mb-12">
              <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-3">You May Also Love</div>
              <h2 className="font-display text-3xl uppercase tracking-[0.15em]">More From Novaël</h2>
            </div>
            <ProductGrid products={related.filter((p) => p.slug !== slug).slice(0, 3)} columns={3} />
          </section>
        )}
      </div>
    </>
  )
}

function AccordionItem({ value, title, children }) {
  return (
    <Accordion.Item value={value} className="border-b border-gold/10">
      <Accordion.Header>
        <Accordion.Trigger className="group w-full flex items-center justify-between py-5 text-left font-display text-[13px] uppercase tracking-[0.2em] hover:text-gold transition-colors">
          {title}
          <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="overflow-hidden data-[state=open]:animate-[slideDown_0.3s_ease] data-[state=closed]:animate-[slideUp_0.3s_ease]">
        <div className="pb-5">{children}</div>
      </Accordion.Content>
    </Accordion.Item>
  )
}
