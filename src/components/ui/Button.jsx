import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const variantClasses = {
  outline: 'btn-luxe',
  filled: 'btn-luxe btn-luxe--filled',
  dark: 'btn-luxe btn-luxe--dark',
  ghost:
    'inline-flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ivory/80 hover:text-gold transition-colors',
  link: 'link-luxe text-[11px] font-semibold uppercase tracking-[0.25em] text-ivory/80 hover:text-gold transition-colors',
}

const sizeClasses = {
  sm: 'h-9 px-4 text-[10px]',
  md: '',
  lg: 'h-14 px-10 text-[12px]',
  xl: 'h-16 px-12 text-[13px]',
}

const Button = forwardRef(function Button(
  { as: Component = 'button', variant = 'outline', size = 'md', className, children, loading, disabled, ...props },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cn(variantClasses[variant], sizeClasses[size], loading || disabled ? 'opacity-50 pointer-events-none' : '', className)}
      disabled={disabled || loading}
      {...props}
    >
      <span className="relative z-[1] inline-flex items-center gap-2">
        {loading ? <span className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin" /> : null}
        {children}
      </span>
    </Component>
  )
})

export default Button
