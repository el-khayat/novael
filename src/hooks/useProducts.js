import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProducts({ category = null, featured = null, limit = null, search = null, sort = 'featured' } = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase.from('products').select('*').eq('is_active', true)
      if (category && category !== 'all') query = query.eq('category', category)
      if (featured != null) query = query.eq('is_featured', featured)
      if (search) query = query.ilike('name', `%${search}%`)

      switch (sort) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'price-asc':
          query = query.order('price', { ascending: true })
          break
        case 'price-desc':
          query = query.order('price', { ascending: false })
          break
        case 'featured':
        default:
          query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
      }
      if (limit) query = query.limit(limit)

      const { data, error: err } = await query
      if (err) throw err
      setProducts(data || [])
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [category, featured, limit, search, sort])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  return { products, loading, error, refetch: fetchProducts }
}

export function useProduct(slug) {
  const [product, setProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const { data, error: err } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single()
        if (err) throw err
        if (cancelled) return
        setProduct(data)

        const { data: vData } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', data.id)
        if (!cancelled) setVariants(vData || [])
      } catch (e) {
        if (!cancelled) setError(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [slug])

  return { product, variants, loading, error }
}

export function useProductSearch(query, limit = 6) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, price, images')
        .eq('is_active', true)
        .ilike('name', `%${query}%`)
        .limit(limit)
      setResults(data || [])
      setLoading(false)
    }, 200)
    return () => clearTimeout(timer)
  }, [query, limit])

  return { results, loading }
}
