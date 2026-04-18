import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef(function Input(
  { label, error, hint, className, dark = false, ...props },
  ref,
) {
  const base = dark
    ? 'bg-transparent border-gold/30 text-ivory placeholder:text-ivory/40 focus:border-gold'
    : 'bg-transparent border-black/20 text-black placeholder:text-black/40 focus:border-black'

  return (
    <label className="block">
      {label && (
        <span
          className={cn(
            'block mb-2 text-[10px] font-medium uppercase tracking-[0.2em]',
            dark ? 'text-ivory/70' : 'text-black/60',
          )}
        >
          {label}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full h-12 border-b bg-transparent outline-none transition-colors text-[14px] tracking-[0.03em] px-1',
          base,
          error && 'border-rose-nude',
          className,
        )}
        {...props}
      />
      {hint && !error && (
        <span className={cn('block mt-1 text-[11px]', dark ? 'text-ivory/40' : 'text-black/40')}>{hint}</span>
      )}
      {error && <span className="block mt-1 text-[11px] text-rose-nude">{error}</span>}
    </label>
  )
})

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, rows = 5, className, dark = false, ...props },
  ref,
) {
  const base = dark
    ? 'bg-transparent border-gold/30 text-ivory placeholder:text-ivory/40 focus:border-gold'
    : 'bg-transparent border-black/20 text-black placeholder:text-black/40 focus:border-black'

  return (
    <label className="block">
      {label && (
        <span
          className={cn(
            'block mb-2 text-[10px] font-medium uppercase tracking-[0.2em]',
            dark ? 'text-ivory/70' : 'text-black/60',
          )}
        >
          {label}
        </span>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'w-full border bg-transparent outline-none transition-colors text-[14px] tracking-[0.03em] p-3 resize-y',
          base,
          error && 'border-rose-nude',
          className,
        )}
        {...props}
      />
      {hint && !error && (
        <span className={cn('block mt-1 text-[11px]', dark ? 'text-ivory/40' : 'text-black/40')}>{hint}</span>
      )}
      {error && <span className="block mt-1 text-[11px] text-rose-nude">{error}</span>}
    </label>
  )
})

export default Input
