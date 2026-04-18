import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { generateOrderNumber } from '../lib/utils'

export function useUserOrders() {
  const user = useAuthStore((s) => s.user)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setOrders([]); setLoading(false); return }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!cancelled) {
        setOrders(data || [])
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [user])

  return { orders, loading }
}

export function useOrder(orderId) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!orderId) return
    let cancelled = false
    ;(async () => {
      const { data } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle()
      if (!cancelled) {
        setOrder(data)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [orderId])
  return { order, loading }
}

export function usePlaceOrder() {
  const user = useAuthStore((s) => s.user)

  const placeOrder = useCallback(async ({
    items, subtotal, discountAmount, shippingCost, taxAmount, total,
    promoCode, shippingAddress, billingAddress, paymentMethod = 'card',
    guestEmail, notes,
  }) => {
    const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true })
    const orderNumber = generateOrderNumber((count || 0) + 1)

    const payload = {
      order_number: orderNumber,
      user_id: user?.id || null,
      guest_email: user ? null : guestEmail,
      status: 'confirmed',
      items,
      subtotal,
      discount_amount: discountAmount,
      shipping_cost: shippingCost,
      tax_amount: taxAmount,
      total,
      promo_code: promoCode || null,
      shipping_address: shippingAddress,
      billing_address: billingAddress || shippingAddress,
      payment_method: paymentMethod,
      payment_status: 'paid',
      notes,
    }

    const { data, error } = await supabase.from('orders').insert(payload).select().single()
    if (error) throw error

    for (const it of items) {
      try {
        if (it.variantId) {
          const { data: v } = await supabase.from('product_variants').select('stock').eq('id', it.variantId).single()
          if (v) {
            await supabase
              .from('product_variants')
              .update({ stock: Math.max(0, (v.stock || 0) - it.qty) })
              .eq('id', it.variantId)
          }
        } else {
          const { data: p } = await supabase.from('products').select('stock').eq('id', it.productId).single()
          if (p) {
            await supabase
              .from('products')
              .update({ stock: Math.max(0, (p.stock || 0) - it.qty) })
              .eq('id', it.productId)
          }
        }
      } catch (_e) { /* non-blocking */ }
    }

    if (promoCode) {
      try {
        const { data: promo } = await supabase
          .from('promo_codes')
          .select('id, uses_count')
          .eq('code', promoCode)
          .single()
        if (promo) {
          await supabase
            .from('promo_codes')
            .update({ uses_count: (promo.uses_count || 0) + 1 })
            .eq('id', promo.id)
          if (user) {
            await supabase.from('user_promo_usage').insert({ user_id: user.id, promo_code: promoCode })
          }
        }
      } catch (_e) { /* non-blocking */ }
    }

    return data
  }, [user])

  return { placeOrder }
}
