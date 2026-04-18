import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from '../common/Logo.jsx'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import SearchOverlay from '../common/SearchOverlay.jsx'
import { cn } from '../../lib/utils'

const navLinks = [
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar({ transparentOnTop = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  const cartCount = useCartStore((s) => s.items.reduce((n, it) => n + it.qty, 0))
  const openCart = useCartStore((s) => s.openCart)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const showSolid = !transparentOnTop || scrolled

  return (
    <>
      <motion.header
        initial={false}
        animate={{ backgroundColor: showSolid ? 'rgba(14,14,14,0.92)' : 'rgba(14,14,14,0)' }}
        transition={{ duration: 0.3 }}
        className={cn(
          'fixed inset-x-0 top-0 z-[800] backdrop-blur-[6px]',
          showSolid ? 'border-b border-gold/10' : '',
        )}
      >
        <div className="container-nvl flex items-center justify-between h-[var(--nav-height)]">
          <button
            className="lg:hidden text-ivory p-2 -ml-2"
            aria-label="Menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="hidden lg:block flex-1 max-w-[180px]">
            <Logo size="md" color="ivory" />
          </Link>

          <nav className="hidden lg:flex items-center justify-center flex-1 gap-10">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'link-luxe text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors',
                    isActive ? 'text-gold' : 'text-ivory hover:text-gold',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <Link to="/" className="lg:hidden">
            <Logo size="sm" color="ivory" />
          </Link>

          <div className="flex items-center gap-1 lg:gap-3 lg:flex-1 lg:justify-end">
            <button
              aria-label="Search"
              className="p-2 text-ivory hover:text-gold transition-colors"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              to={user ? '/account' : '/login'}
              aria-label="Account"
              className="p-2 text-ivory hover:text-gold transition-colors hidden sm:inline-flex"
            >
              <User className="w-5 h-5" />
            </Link>
            <Link
              to="/account"
              aria-label="Wishlist"
              className="p-2 text-ivory hover:text-gold transition-colors hidden sm:inline-flex"
            >
              <Heart className="w-5 h-5" />
            </Link>
            <button
              aria-label="Cart"
              className="p-2 text-ivory hover:text-gold transition-colors relative"
              onClick={openCart}
            >
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gold text-black text-[10px] font-semibold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-[950] bg-black lg:hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-[var(--nav-height)] border-b border-gold/10">
              <Logo size="md" color="ivory" />
              <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="text-ivory p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col justify-center gap-8 px-8">
              {navLinks.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                >
                  <Link
                    to={l.to}
                    className="font-display text-3xl tracking-[0.2em] uppercase text-ivory"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <div className="gold-divider" />
              <Link
                to={user ? '/account' : '/login'}
                className="text-[11px] uppercase tracking-[0.25em] text-gold"
              >
                {user ? 'Account' : 'Sign In'}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
