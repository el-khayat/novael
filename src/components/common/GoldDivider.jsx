import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export default function GoldDivider({ width = 80, center = false, className, animate = true, delay = 0.2 }) {
  const Component = animate ? motion.div : 'div'
  const animationProps = animate
    ? {
        initial: { scaleX: 0 },
        whileInView: { scaleX: 1 },
        viewport: { once: true, margin: '-10%' },
        transition: { duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] },
      }
    : {}

  return (
    <Component
      style={{ width: typeof width === 'number' ? `${width}px` : width, transformOrigin: 'left' }}
      className={cn('h-px bg-gold/70', center && 'mx-auto', className)}
      {...animationProps}
    />
  )
}
