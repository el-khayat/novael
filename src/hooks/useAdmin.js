import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAdminStats() {
  const [stats, setStats] = useState({
    revenueThisMonth: 0,
    ordersThisMonth: 0,
    ordersLastMonth: 0,
    totalProducts: 0,
    totalCustomers: 0,
    loading: true,
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const startOfLast = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
      const endOfLast = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [thisMonth, lastMonth, productsRes, customersRes] = await Promise.all([
        supabase.from('orders').select('total, created_at').gte('created_at', startOfMonth),
        supabase.from('orders').select('id, total, created_at').gte('created_at', startOfLast).lt('created_at', endOfLast),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ])

      if (cancelled) return
      const revenue = (thisMonth.data || []).reduce((s, o) => s + Number(o.total || 0), 0)
      setStats({
        revenueThisMonth: revenue,
        ordersThisMonth: (thisMonth.data || []).length,
        ordersLastMonth: (lastMonth.data || []).length,
        totalProducts: productsRes.count || 0,
        totalCustomers: customersRes.count || 0,
        loading: false,
      })
    })()
    return () => { cancelled = true }
  }, [])

  return stats
}

export function useAdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, profile:profiles(full_name, email)')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const updateOrder = useCallback(async (id, patch) => {
    await supabase.from('orders').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
    load()
  }, [load])

  return { orders, loading, refresh: load, updateOrder }
}

export function useAdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const saveProduct = useCallback(async (product) => {
    if (product.id) {
      const { id, ...rest } = product
      const { error } = await supabase.from('products').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('products').insert(product)
      if (error) throw error
    }
    await load()
  }, [load])

  const deleteProduct = useCallback(async (id) => {
    await supabase.from('products').delete().eq('id', id)
    load()
  }, [load])

  const updateStock = useCallback(async (id, stock) => {
    await supabase.from('products').update({ stock, updated_at: new Date().toISOString() }).eq('id', id)
    load()
  }, [load])

  const toggleActive = useCallback(async (id, isActive) => {
    await supabase.from('products').update({ is_active: isActive }).eq('id', id)
    load()
  }, [load])

  return { products, loading, refresh: load, saveProduct, deleteProduct, updateStock, toggleActive }
}

export function useAdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [{ data: profiles }, { data: orders }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('user_id, total, created_at'),
      ])
      if (cancelled) return
      const byUser = {}
      ;(orders || []).forEach((o) => {
        if (!o.user_id) return
        if (!byUser[o.user_id]) byUser[o.user_id] = { count: 0, total: 0, last: null }
        byUser[o.user_id].count += 1
        byUser[o.user_id].total += Number(o.total || 0)
        if (!byUser[o.user_id].last || new Date(o.created_at) > new Date(byUser[o.user_id].last)) {
          byUser[o.user_id].last = o.created_at
        }
      })
      setCustomers(
        (profiles || []).map((p) => ({
          ...p,
          ordersCount: byUser[p.id]?.count || 0,
          totalSpent: byUser[p.id]?.total || 0,
          lastOrder: byUser[p.id]?.last || null,
        })),
      )
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  return { customers, loading }
}

export function useAdminSubscribers() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false })
    setSubscribers(data || [])
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  return { subscribers, loading, refresh: load }
}

export function useAdminPromos() {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false })
    setPromos(data || [])
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const savePromo = useCallback(async (promo) => {
    if (promo.id) {
      const { id, ...rest } = promo
      await supabase.from('promo_codes').update(rest).eq('id', id)
    } else {
      await supabase.from('promo_codes').insert(promo)
    }
    load()
  }, [load])

  const deletePromo = useCallback(async (id) => {
    await supabase.from('promo_codes').delete().eq('id', id)
    load()
  }, [load])

  return { promos, loading, savePromo, deletePromo, refresh: load }
}
