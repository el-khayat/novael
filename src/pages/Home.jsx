import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, Star, Sparkles, RefreshCw, Leaf, Plus, ArrowRight } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { supabase } from '../lib/supabase'
import { brand } from '../config/brand'
import { formatPrice, percentOff } from '../lib/utils'
import GoldDivider from '../components/common/GoldDivider.jsx'
import Logo from '../components/common/Logo.jsx'
import { useCartStore } from '../store/cartStore'
import { toast } from '../components/ui/Toast.jsx'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1920&q=80'
const FEATURED_IMG = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=80'

const MOOD_IMAGES = [
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1588680388350-47c3d433d8f5?auto=format&fit=crop&w=800&q=80',
]

const FALLBACK_REVIEWS = [
  {
    id: '1',
    rating: 5,
    title: 'Completely changed my routine',
    body: 'These lashes feel like nothing and look like everything. The magnetic formula is genuinely effortless — I am converted.',
    reviewer: 'Amélie R.',
  },
  {
    id: '2',
    rating: 5,
    title: 'The best investment I have made',
    body: 'I have tried every lash on the market. Novaël is in its own league. Luxurious, reusable, and absurdly comfortable.',
    reviewer: 'Sofia K.',
  },
  {
    id: '3',
    rating: 5,
    title: 'A quiet kind of glamour',
    body: 'No glue, no fuss, and somehow more beautiful than strip lashes. I get compliments every single time.',
    reviewer: 'Jade M.',
  },
]

function LetterReveal({ text, className }) {
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
          style={{ whiteSpace: ch === ' ' ? 'pre' : 'normal' }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  )
}

function Hero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 800], [0, 240])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <section className="relative h-screen w-full overflow-hidden grain-overlay">
      <motion.div
        style={{ y }}
        className="absolute inset-0 -z-10"
      >
        <img src={HERO_IMAGE} alt="" className="w-full h-[120%] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-black/80" />
      </motion.div>

      <div className="relative z-10 h-full container-nvl flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'center' }}
          className="h-px w-20 bg-gold mb-10"
        />

        <h1
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: '0.2em' }}
          className="font-display font-medium text-ivory leading-[0.95] uppercase"
        >
          <LetterReveal text="NOVA" />
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-gold inline-block"
          >
            Ë
          </motion.span>
          <LetterReveal text="L" />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.8 }}
          className="mt-6 text-gold text-[12px] md:text-sm font-light tracking-[0.35em] uppercase"
        >
          Your Beauty. Your Rules.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.1 }}
          className="mt-12"
        >
          <Link to="/shop" className="btn-luxe">
            Shop Now
          </Link>
        </motion.div>
      </div>

      <motion.div
        style={{ opacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gold z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  )
}

function AnnouncementMarquee() {
  const items = [...brand.announcement, ...brand.announcement]
  return (
    <section className="bg-black border-y border-gold/10 py-4 overflow-hidden">
      <div className="flex gap-16 whitespace-nowrap animate-marquee">
        {items.map((text, i) => (
          <span key={i} className="flex items-center gap-16 text-gold text-[11px] uppercase tracking-[0.35em] font-medium">
            {text}
            <span className="text-gold/40">·</span>
          </span>
        ))}
      </div>
    </section>
  )
}

function FeaturedProduct({ product, loading }) {
  const addItem = useCartStore((s) => s.addItem)

  if (loading) {
    return (
      <section className="bg-ivory py-24 lg:py-32">
        <div className="container-nvl flex justify-center">
          <div className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
        </div>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="bg-ivory py-24 lg:py-32">
        <div className="container-nvl text-center text-black/40 font-display uppercase tracking-[0.2em]">
          Add a featured product in the admin.
        </div>
      </section>
    )
  }

  const off = percentOff(product.price, product.compare_price)
  const img = product.images?.[0] || FEATURED_IMG

  return (
    <section className="bg-ivory text-black">
      <div className="grid lg:grid-cols-2 items-stretch min-h-[90vh]">
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-[#EEE8DE] grain-overlay overflow-hidden min-h-[500px]"
        >
          <img src={img} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center px-8 md:px-16 lg:px-20 py-20"
        >
          <div className="max-w-md">
            <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">Signature</div>
            <h2 className="font-display text-4xl lg:text-5xl uppercase tracking-[0.12em] leading-tight">
              {product.name}
            </h2>
            <GoldDivider className="my-6" />
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-0.5 text-gold">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
              </div>
              <span className="text-xs text-black/50">247 reviews</span>
            </div>
            <p className="text-[14px] text-black/70 leading-relaxed mb-8">{product.description}</p>

            <div className="flex items-baseline gap-3 mb-8">
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-lg text-taupe line-through">{formatPrice(product.compare_price)}</span>
              )}
              <span className="text-2xl font-display text-gold">{formatPrice(product.price)}</span>
              {off > 0 && (
                <span className="text-[10px] bg-plum text-ivory px-2 py-1 uppercase tracking-[0.2em]">-{off}%</span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  addItem(product, null, 1)
                  toast.success('Added to your cart', product.name)
                }}
                className="btn-luxe btn-luxe--dark flex-1"
              >
                Add To Cart
              </button>
              <Link to={`/shop/${product.slug}`} className="btn-luxe h-14 px-6 text-black border-black/30 hover:border-black">
                View
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function TheDifference() {
  const icons = [Sparkles, RefreshCw, Leaf]
  return (
    <section className="bg-black text-ivory py-24 lg:py-32 grain-overlay">
      <div className="container-nvl">
        <div className="text-center mb-20">
          <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-3">Our Philosophy</div>
          <h2 className="font-display text-3xl md:text-5xl uppercase tracking-[0.15em]">The Novaël Difference</h2>
          <GoldDivider center className="mt-8" />
        </div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
          {brand.values.map((v, i) => {
            const Icon = icons[i]
            return (
              <motion.div
                key={v.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="text-center relative"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 font-display text-[80px] text-gold/10 leading-none select-none">
                  0{i + 1}
                </div>
                <div className="relative">
                  <div className="w-14 h-14 mx-auto rounded-full border border-gold/40 flex items-center justify-center mb-6">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="font-display text-lg uppercase tracking-[0.2em] mb-3">{v.label}</h3>
                  <p className="text-sm text-ivory/60 leading-relaxed max-w-xs mx-auto">{v.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="bg-black text-ivory pb-24 lg:pb-32">
      <div className="container-nvl">
        <div className="text-center mb-16">
          <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-3">The Ritual</div>
          <h2 className="font-display text-3xl md:text-5xl uppercase tracking-[0.15em]">How It Works</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-0">
          {brand.howItWorks.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="relative lg:px-8 lg:border-r lg:border-gold/10 last:border-r-0"
            >
              <div className="font-display text-6xl text-gold/80 mb-4">{s.step}</div>
              <h3 className="font-display text-lg uppercase tracking-[0.18em] mb-3">{s.title}</h3>
              <p className="text-sm text-ivory/60 leading-relaxed">{s.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Reviews({ reviews }) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const list = reviews.length ? reviews : FALLBACK_REVIEWS

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIdx((i) => (i + 1) % list.length), 5000)
    return () => clearInterval(t)
  }, [paused, list.length])

  return (
    <section className="bg-ivory text-black py-24 lg:py-32" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container-nvl">
        <div className="text-center mb-16">
          <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-3">Kind Words</div>
          <h2 className="font-display text-3xl md:text-5xl uppercase tracking-[0.15em] text-black">Loved By Thousands</h2>
          <GoldDivider center className="mt-8" />
        </div>

        <div className="max-w-3xl mx-auto relative min-h-[240px]">
          {list.map((r, i) => (
            <motion.div
              key={r.id || i}
              initial={{ opacity: 0 }}
              animate={{ opacity: i === idx ? 1 : 0 }}
              transition={{ duration: 0.8 }}
              style={{ position: i === idx ? 'relative' : 'absolute' }}
              className="inset-0 top-0 left-0 right-0 text-center"
            >
              <div className="flex justify-center gap-1 text-gold mb-6">
                {[...Array(r.rating || 5)].map((_, k) => <Star key={k} className="w-4 h-4 fill-current" />)}
              </div>
              <h3 className="font-display text-xl md:text-2xl uppercase tracking-[0.12em] mb-5">
                "{r.title || 'Extraordinary'}"
              </h3>
              <p className="text-black/70 text-[15px] leading-relaxed mb-6">{r.body}</p>
              <div className="font-display text-sm uppercase tracking-[0.3em] text-gold">— {r.reviewer || r.guest_name}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-12">
          {list.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Review ${i + 1}`}
              className={`h-0.5 transition-all ${i === idx ? 'w-10 bg-gold' : 'w-5 bg-black/20'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function MoodGrid() {
  return (
    <section className="bg-black py-0">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
        {MOOD_IMAGES.map((src, i) => (
          <Link
            key={i}
            to="/shop"
            className="relative aspect-square overflow-hidden group grain-overlay"
          >
            <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-500 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-center text-ivory">
                <Plus className="w-6 h-6 mx-auto text-gold mb-2" />
                <div className="text-[10px] uppercase tracking-[0.3em]">Shop This Look</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function EmailCapture() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await supabase.from('subscribers').insert({ email, source: 'home' })
      toast.success('You are in', 'Welcome to the Novaël Circle.')
      setDone(true)
      setEmail('')
    } catch {
      toast.error('Could not subscribe', 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-plum via-black to-black -z-10" />
      <div className="absolute inset-0 grain-overlay -z-10" />

      <div className="container-nvl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">Exclusive Access</div>
          <h2 className="font-display text-3xl md:text-5xl uppercase tracking-[0.15em] text-ivory leading-tight">
            Join The Novaël Circle
          </h2>
          <GoldDivider center className="mt-8" />
          <p className="text-ivory/70 mt-8 text-[15px] leading-relaxed">
            Be first to know. Early access, exclusive offers, beauty secrets.
          </p>

          <form onSubmit={submit} className="mt-12 flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 h-14 px-5 bg-transparent border border-ivory/30 text-ivory placeholder:text-ivory/40 focus:border-gold outline-none text-[13px] tracking-[0.05em]"
            />
            <button
              type="submit"
              disabled={loading || done}
              className="btn-luxe btn-luxe--filled h-14 min-w-[140px]"
            >
              {done ? 'Joined' : 'Join'} <ArrowRight className="w-3 h-3" />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}

export default function Home() {
  const { products, loading: featuredLoading, error: featuredError } = useProducts({ featured: true, limit: 1 })
  const featured = products?.[0]

  useEffect(() => {
    if (featuredError) console.error('[Home] Featured product query failed:', featuredError)
  }, [featuredError])
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    let cancelled = false
    supabase.from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false }).limit(3)
      .then(({ data }) => {
        if (cancelled) return
        const mapped = (data || []).map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          body: r.body,
          reviewer: r.guest_name || 'Novaël Customer',
        }))
        setReviews(mapped)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <>
      <Helmet>
        <title>Novaël — Your Beauty. Your Rules.</title>
      </Helmet>
      <Hero />
      <AnnouncementMarquee />
      <FeaturedProduct product={featured} loading={featuredLoading} />
      <TheDifference />
      <HowItWorks />
      <Reviews reviews={reviews} />
      <MoodGrid />
      <EmailCapture />
    </>
  )
}
