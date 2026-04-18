import ProductCard from './ProductCard.jsx'
import { ProductCardSkeleton } from '../ui/Spinner.jsx'

export default function ProductGrid({ products, loading, empty, columns = 3 }) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  if (loading) {
    return (
      <div className={`grid ${gridCols} gap-6 lg:gap-8`}>
        {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    )
  }

  if (!products?.length) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-xl tracking-[0.15em] uppercase text-ivory/50">
          {empty || 'Nothing here yet — something beautiful is coming.'}
        </p>
      </div>
    )
  }

  return (
    <div className={`grid ${gridCols} gap-6 lg:gap-8`}>
      {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
    </div>
  )
}
