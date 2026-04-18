import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useProductSearch } from '../../hooks/useProducts'
import { formatPrice } from '../../lib/utils'

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('')
  const { results, loading } = useProductSearch(query)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
    else setQuery('')
  }, [open])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[960] bg-black/95 backdrop-blur-sm"
          onClick={onClose}
        >
          <div className="container-nvl pt-24" onClick={(e) => e.stopPropagation()}>
            <button
              aria-label="Close search"
              className="absolute top-6 right-6 text-ivory/60 hover:text-gold"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-4 border-b border-gold/30 pb-4">
                <Search className="w-6 h-6 text-gold" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search the collection…"
                  className="w-full bg-transparent outline-none text-ivory text-2xl font-display tracking-[0.12em] placeholder:text-ivory/30"
                />
              </div>

              <div className="mt-8 space-y-2 max-h-[60vh] overflow-y-auto">
                {loading && <p className="text-ivory/50 text-sm">Searching…</p>}
                {!loading && query.length >= 2 && results.length === 0 && (
                  <p className="text-ivory/50 text-sm">Nothing found. Try a different term.</p>
                )}
                {results.map((p) => (
                  <Link
                    key={p.id}
                    to={`/shop/${p.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 hover:bg-ivory/5 transition-colors group"
                  >
                    <div className="w-14 h-14 bg-ivory/5 overflow-hidden">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-display uppercase tracking-[0.15em] text-sm group-hover:text-gold transition-colors">{p.name}</div>
                      <div className="text-gold text-xs">{formatPrice(p.price)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
