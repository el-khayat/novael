import { motion } from 'framer-motion'

export default function AnimatedReveal({
  children,
  as: Component = motion.div,
  delay = 0,
  y = 60,
  duration = 0.7,
  stagger = 0,
  once = true,
  className,
  ...rest
}) {
  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  }
  const item = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: [0.16, 1, 0.3, 1] },
    },
  }

  if (stagger) {
    return (
      <Component
        className={className}
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: '-10%' }}
        {...rest}
      >
        {Array.isArray(children)
          ? children.map((child, i) => (
              <motion.div key={i} variants={item}>
                {child}
              </motion.div>
            ))
          : children}
      </Component>
    )
  }

  return (
    <Component
      className={className}
      variants={item}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-10%' }}
      {...rest}
    >
      {children}
    </Component>
  )
}
