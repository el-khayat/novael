import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { SlidersHorizontal, X } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import ProductGrid from '../components/product/ProductGrid.jsx'
import GoldDivider from '../components/common/GoldDivider.jsx'
import { CATEGORIES } from '../config/brand'
import { cn } from '../lib/utils'

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price ↑' },
  { id: 'price-desc', label: 'Price ↓' },
]

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visible, setVisible] = useState(12)

  const category = params.get('category') || 'all'
  const sort = params.get('sort') || 'featured'
  const [minPrice, setMinPrice] = useState(Number(params.get('min') || 0))
  const [maxPrice, setMaxPrice] = useState(Number(params.get('max') || 200))

  const { products, loading } = useProducts({
    category: category === 'all' ? null : category,
    sort,
  })

  const filtered = useMemo(() => {
    return products.filter((p) => p.price >= minPrice && p.price <= maxPrice)
  }, [products, minPrice, maxPrice])

  const shown = filtered.slice(0, visible)

  const updateParam = (key, value) => {
    const p = new URLSearchParams(params)
    if (value === null || value === '' || value === 'all') p.delete(key)
    else p.set(key, value)
    setParams(p)
  }

  return (
    <>
      <Helmet>
        <title>Shop — Novaël</title>
      </Helmet>

      <section className="relative bg-black text-ivory pt-[calc(var(--nav-height)+60px)] pb-16 grain-overlay">
        <div className="container-nvl text-center">
          <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">Collection 01</div>
          <h1 className="font-display text-4xl md:text-6xl uppercase tracking-[0.18em]">The Collection</h1>
          <GoldDivider center className="mt-8" />
          <p className="mt-8 text-ivory/60 max-w-xl mx-auto text-sm">
            Every piece, handcrafted. Every formula, intentional. Welcome to beauty in its quietest form.
          </p>
        </div>
      </section>

      <section className="bg-black text-ivory py-16">
        <div className="container-nvl">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Filters */}
            <aside className={cn(
              'lg:w-64 lg:flex-shrink-0 lg:block',
              filtersOpen
                ? 'fixed inset-0 z-[870] bg-black p-8 overflow-y-auto'
                : 'hidden'
            )}>
              <div className="flex items-center justify-between lg:hidden mb-8">
                <h3 className="font-display uppercase tracking-[0.2em]">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} className="p-2 text-ivory">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <FilterGroup title="Category">
                <div className="space-y-2">
                  {[{ id: 'all', label: 'All' }, ...CATEGORIES].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateParam('category', c.id)}
                      className={cn(
                        'block w-full text-left text-[12px] uppercase tracking-[0.2em] py-1.5 transition-colors',
                        category === c.id ? 'text-gold' : 'text-ivory/60 hover:text-ivory',
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup title="Price">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-ivory/60">
                    <span>${minPrice}</span>
                    <span>${maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-gold"
                  />
                </div>
              </FilterGroup>

              <FilterGroup title="Sort By">
                <div className="space-y-2">
                  {SORT_OPTIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => updateParam('sort', s.id)}
                      className={cn(
                        'block w-full text-left text-[12px] uppercase tracking-[0.2em] py-1.5',
                        sort === s.id ? 'text-gold' : 'text-ivory/60 hover:text-ivory',
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </FilterGroup>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-8">
                <div className="text-xs text-ivory/60 uppercase tracking-[0.2em]">
                  {loading ? '—' : `${filtered.length} Piece${filtered.length === 1 ? '' : 's'}`}
                </div>
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ivory/80 hover:text-gold"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
              </div>

              <ProductGrid products={shown} loading={loading} columns={3} />

              {shown.length < filtered.length && (
                <div className="text-center mt-14">
                  <button
                    onClick={() => setVisible((v) => v + 12)}
                    className="btn-luxe"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function FilterGroup({ title, children }) {
  return (
    <div className="mb-8 pb-6 border-b border-gold/10 last:border-b-0">
      <h4 className="font-display text-[11px] uppercase tracking-[0.25em] text-gold mb-4">{title}</h4>
      {children}
    </div>
  )
}
