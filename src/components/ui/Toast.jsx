import { create } from 'zustand'
import * as RToast from '@radix-ui/react-toast'
import { nanoid } from 'nanoid'
import { cn } from '../../lib/utils'

const useToastStore = create((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = nanoid()
    set({ toasts: [...get().toasts, { id, variant: 'success', ...toast }] })
    return id
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}))

export const toast = {
  success: (title, description) => useToastStore.getState().push({ title, description, variant: 'success' }),
  error: (title, description) => useToastStore.getState().push({ title, description, variant: 'error' }),
  info: (title, description) => useToastStore.getState().push({ title, description, variant: 'info' }),
}

const variantBorder = {
  success: 'border-l-gold',
  error: 'border-l-rose-nude',
  info: 'border-l-mauve',
}

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return toasts.map((t) => (
    <RToast.Root
      key={t.id}
      className={cn(
        'bg-black text-ivory border-l-2 pl-5 pr-10 py-4 shadow-2xl relative',
        'data-[state=open]:animate-[slideIn_0.25s_cubic-bezier(0.16,1,0.3,1)]',
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
        variantBorder[t.variant],
      )}
      onOpenChange={(open) => !open && dismiss(t.id)}
    >
      <RToast.Title className="font-display uppercase tracking-[0.2em] text-[11px] text-gold mb-1">
        {t.title}
      </RToast.Title>
      {t.description && (
        <RToast.Description className="text-[13px] text-ivory/80 leading-snug">{t.description}</RToast.Description>
      )}
      <RToast.Close className="absolute top-2 right-2 text-ivory/40 hover:text-gold text-sm leading-none">×</RToast.Close>
    </RToast.Root>
  ))
}
