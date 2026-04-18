import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { calculateOrderTotals } from '../lib/utils'

const makeId = (productId, variantId) => `${productId}::${variantId || 'default'}`

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      promo: null,
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      addItem: (product, variant = null, qty = 1) => {
        const id = makeId(product.id, variant?.id)
        const items = [...get().items]
        const existing = items.find((it) => it.id === id)
        const basePrice = Number(product.price) + Number(variant?.price_modifier || 0)
        const maxQty = variant?.stock ?? product.stock ?? 99

        if (existing) {
          existing.qty = Math.min(existing.qty + qty, maxQty)
        } else {
          items.push({
            id,
            productId: product.id,
            variantId: variant?.id || null,
            slug: product.slug,
            name: product.name,
            variantName: variant?.name || null,
            image: product.images?.[0] || null,
            price: basePrice,
            qty: Math.min(qty, maxQty),
            maxQty,
          })
        }
        set({ items, isOpen: true })
      },

      removeItem: (id) => set({ items: get().items.filter((it) => it.id !== id) }),

      updateQty: (id, qty) => {
        const items = get().items.map((it) =>
          it.id === id ? { ...it, qty: Math.max(1, Math.min(qty, it.maxQty)) } : it,
        )
        set({ items })
      },

      clearCart: () => set({ items: [], promo: null, isOpen: false }),

      applyPromo: (promo) => set({ promo }),
      removePromo: () => set({ promo: null }),

      getItemCount: () => get().items.reduce((n, it) => n + it.qty, 0),

      getTotals: (shippingCost = 0, taxRate = 0) =>
        calculateOrderTotals({ items: get().items, promo: get().promo, shippingCost, taxRate }),
    }),
    {
      name: 'novael-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, promo: state.promo }),
    },
  ),
)
