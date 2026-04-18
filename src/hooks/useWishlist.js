import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export function useWishlist() {
  const user = useAuthStore((s) => s.user)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('wishlist')
      .select('*, product:products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setItems((data || []).filter((d) => d.product))
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const add = useCallback(async (productId) => {
    if (!user) return
    await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId })
    load()
  }, [user, load])

  const remove = useCallback(async (productId) => {
    if (!user) return
    await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId)
    load()
  }, [user, load])

  const toggle = useCallback(async (productId) => {
    if (!user) return false
    const has = items.some((it) => it.product_id === productId)
    if (has) await remove(productId)
    else await add(productId)
    return !has
  }, [user, items, add, remove])

  const has = useCallback((productId) => items.some((it) => it.product_id === productId), [items])

  return { items, loading, add, remove, toggle, has, refresh: load }
}
