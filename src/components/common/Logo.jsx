import { cn } from '../../lib/utils'

const sizeMap = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-3xl',
  xl: 'text-5xl',
  '2xl': 'text-7xl',
}

const colorMap = {
  ivory: 'text-ivory',
  black: 'text-black',
  gold: 'text-gold',
}

export default function Logo({ size = 'md', color = 'ivory', className, goldAccent = true, as: Component = 'span' }) {
  return (
    <Component
      aria-label="Novaël"
      className={cn(
        'font-display font-semibold tracking-[0.28em] uppercase leading-none whitespace-nowrap inline-flex items-baseline',
        colorMap[color],
        sizeMap[size],
        className,
      )}
    >
      <span>NOVA</span>
      <span className={goldAccent ? 'text-gold' : 'text-inherit'}>Ë</span>
      <span>L</span>
    </Component>
  )
}
