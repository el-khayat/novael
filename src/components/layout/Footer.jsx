import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Logo from '../common/Logo.jsx'
import GoldDivider from '../common/GoldDivider.jsx'
import { brand } from '../../config/brand'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'
import { toast } from '../ui/Toast.jsx'

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}
function TikTokIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
    </svg>
  )
}
function PinterestIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0a12 12 0 0 0-4.373 23.178c-.103-.86-.195-2.18.041-3.12.215-.848 1.385-5.394 1.385-5.394s-.354-.707-.354-1.754c0-1.644.953-2.87 2.14-2.87 1.01 0 1.497.758 1.497 1.667 0 1.015-.647 2.534-.981 3.94-.279 1.18.591 2.14 1.754 2.14 2.106 0 3.726-2.22 3.726-5.428 0-2.837-2.039-4.823-4.948-4.823-3.37 0-5.348 2.529-5.348 5.141 0 1.017.39 2.108.88 2.7.098.118.112.22.082.34-.09.375-.293 1.18-.332 1.347-.053.216-.173.262-.4.157-1.493-.696-2.426-2.879-2.426-4.634 0-3.77 2.738-7.23 7.894-7.23 4.143 0 7.363 2.951 7.363 6.898 0 4.117-2.597 7.429-6.199 7.429-1.211 0-2.349-.63-2.739-1.377l-.744 2.838c-.272 1.045-1.003 2.352-1.491 3.15A12 12 0 1 0 12 0z" />
    </svg>
  )
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const subscribe = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await supabase.from('subscribers').insert({ email, source: 'footer' })
      toast.success('Welcome to the Circle', 'Keep an eye on your inbox.')
      setEmail('')
    } catch {
      toast.error('Subscription failed', 'Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-black text-ivory border-t border-gold/10 mt-0">
      <div className="container-nvl py-16 lg:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-16">
          <div className="col-span-2 lg:col-span-2 max-w-sm">
            <Logo size="lg" color="ivory" />
            <p className="mt-6 text-sm text-ivory/60 leading-relaxed">{brand.description}</p>
            <div className="flex gap-4 mt-8">
              <a href={brand.social.instagram} target="_blank" rel="noreferrer" className="text-ivory/70 hover:text-gold transition-colors" aria-label="Instagram">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href={brand.social.tiktok} target="_blank" rel="noreferrer" className="text-ivory/70 hover:text-gold transition-colors" aria-label="TikTok">
                <TikTokIcon className="w-5 h-5" />
              </a>
              <a href={brand.social.pinterest} target="_blank" rel="noreferrer" className="text-ivory/70 hover:text-gold transition-colors" aria-label="Pinterest">
                <PinterestIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          <FooterColumn title="Shop" links={[
            { to: '/shop', label: 'All Products' },
            { to: '/shop?category=lashes', label: 'Lashes' },
            { to: '/shop?featured=1', label: 'Bestsellers' },
          ]} />
          <FooterColumn title="Account" links={[
            { to: '/account', label: 'My Account' },
            { to: '/account/orders', label: 'Orders' },
            { to: '/login', label: 'Sign In' },
          ]} />
          <FooterColumn title="Contact" links={[
            { to: '/contact', label: 'Contact Us' },
            { to: '/about', label: 'Our Story' },
            { href: `mailto:${brand.supportEmail}`, label: brand.supportEmail },
          ]} />
        </div>

        <GoldDivider width="100%" className="my-12 opacity-20" animate={false} />

        <form onSubmit={subscribe} className="flex flex-col md:flex-row md:items-end gap-4 max-w-xl">
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-[0.25em] text-gold mb-2">Join The Circle</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full h-11 bg-transparent border-b border-ivory/30 focus:border-gold outline-none text-sm text-ivory"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-luxe btn-luxe--filled h-11 md:min-w-[160px] disabled:opacity-50"
          >
            Join <ArrowRight className="w-3 h-3" />
          </button>
        </form>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-16 pt-8 border-t border-ivory/10 text-[11px] uppercase tracking-[0.2em] text-ivory/40">
          <div>© {new Date().getFullYear()} Novaël. All rights reserved.</div>
          <div className="flex gap-8">
            <Link to="/" className="hover:text-gold transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-gold transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="font-display text-[11px] uppercase tracking-[0.25em] text-gold mb-5">{title}</h4>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.to || l.href}>
            {l.href ? (
              <a href={l.href} className="text-sm text-ivory/70 hover:text-gold transition-colors">
                {l.label}
              </a>
            ) : (
              <Link to={l.to} className="text-sm text-ivory/70 hover:text-gold transition-colors">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
