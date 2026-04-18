import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

export default function Modal({ open, onOpenChange, title, description, children, className, size = 'md' }) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[900] bg-black/70 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={cn(
                  'fixed left-1/2 top-1/2 z-[950] w-[94vw] -translate-x-1/2 -translate-y-1/2 bg-ivory text-black shadow-2xl border border-gold/30 p-8 max-h-[90vh] overflow-y-auto',
                  sizeClasses[size],
                  className,
                )}
              >
                {title && (
                  <Dialog.Title className="font-display text-2xl tracking-[0.2em] uppercase mb-2">{title}</Dialog.Title>
                )}
                {description && <Dialog.Description className="text-sm text-black/60 mb-6">{description}</Dialog.Description>}
                <Dialog.Close asChild>
                  <button
                    aria-label="Close"
                    className="absolute top-5 right-5 text-black/60 hover:text-gold transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
