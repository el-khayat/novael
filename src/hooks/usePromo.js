import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export function usePromo() {
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const validate = useCallback(async (code, subtotal = 0) => {
    setLoading(true)
    setError(null)
    try {
      const normalized = String(code || '').trim().toUpperCase()
      if (!normalized) throw new Error('Enter a code')
      const { data, error: err } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', normalized)
        .eq('is_active', true)
        .maybeSingle()
      if (err) throw err
      if (!data) throw new Error('Invalid code')
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('This code has expired')
      }
      if (data.max_uses && data.uses_count >= data.max_uses) {
        throw new Error('This code has reached its limit')
      }
      if (subtotal && data.min_order && subtotal < Number(data.min_order)) {
        throw new Error(`Minimum order of $${data.min_order} required`)
      }
      if (data.one_per_user && user) {
        const { data: usage } = await supabase
          .from('user_promo_usage')
          .select('id')
          .eq('user_id', user.id)
          .eq('promo_code', normalized)
          .maybeSingle()
        if (usage) throw new Error('You have already used this code')
      }
      return data
    } catch (e) {
      setError(e.message || 'Could not validate code')
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  return { validate, loading, error }
}

export function useUserPromos() {
  const user = useAuthStore((s) => s.user)
  const [available, setAvailable] = useState([])
  const [used, setUsed] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    const [{ data: all }, { data: usage }] = await Promise.all([
      supabase.from('promo_codes').select('*').eq('is_active', true),
      supabase.from('user_promo_usage').select('*').eq('user_id', user.id),
    ])
    const usedCodes = new Set((usage || []).map((u) => u.promo_code))
    setAvailable((all || []).filter((p) => !usedCodes.has(p.code)))
    setUsed(usage || [])
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  return { available, used, loading, refresh: load }
}
