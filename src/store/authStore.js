import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  isAdmin: false,
  isLoading: true,
  initialized: false,

  init: async () => {
    if (get().initialized) return
    set({ initialized: true, isLoading: true })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await get().setUserFromSession(session)
      }
    } catch (err) {
      console.warn('[Novaël] auth init failed', err)
    } finally {
      set({ isLoading: false })
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await get().setUserFromSession(session)
      } else {
        set({ user: null, profile: null, session: null, isAdmin: false })
      }
    })
  },

  setUserFromSession: async (session) => {
    set({ session, user: session.user })
    await get().refreshProfile()
  },

  refreshProfile: async () => {
    const user = get().user
    if (!user) return
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (!error && data) {
      set({ profile: data, isAdmin: Boolean(data.is_admin) })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    set({ isLoading: false })
    if (error) throw error
    if (data.session) await get().setUserFromSession(data.session)
    return data
  },

  register: async (email, password, fullName) => {
    set({ isLoading: true })
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    set({ isLoading: false })
    if (error) throw error
    if (data.session) await get().setUserFromSession(data.session)
    return data
  },

  loginWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/account' },
    })
    if (error) throw error
  },

  sendPasswordReset: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    })
    if (error) throw error
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, session: null, isAdmin: false })
  },

  updateProfile: async (patch) => {
    const user = get().user
    if (!user) throw new Error('Not signed in')
    const { error } = await supabase.from('profiles').update(patch).eq('id', user.id)
    if (error) throw error
    await get().refreshProfile()
  },
}))
