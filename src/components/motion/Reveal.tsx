'use client'

import { motion, useReducedMotion } from 'motion/react'

interface Props {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
}

/** Fade-up on scroll into view. Wraps content in a motion.div. */
export default function Reveal({ children, delay = 0, y = 22, className }: Props) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
