import React from 'react'
import { motion } from 'framer-motion'

// Animated aurora blobs used across pages
export default function Aurora({ variant = 'hero' }) {
  const blobs =
    variant === 'hero'
      ? [
          { c: '#4f46e5', s: 520, x: '-8%', y: '-12%', d: 16 },
          { c: '#0e7490', s: 460, x: '62%', y: '-4%', d: 20 },
          { c: '#7c3aed', s: 420, x: '30%', y: '38%', d: 24 },
        ]
      : [
          { c: '#4f46e5', s: 360, x: '70%', y: '-10%', d: 18 },
          { c: '#0e7490', s: 300, x: '-6%', y: '40%', d: 22 },
        ]
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="aurora"
          style={{
            width: b.s,
            height: b.s,
            left: b.x,
            top: b.y,
            background: b.c,
          }}
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -30, 30, 0],
          }}
          transition={{ duration: b.d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

export function GridOverlay() {
  return <div className="absolute inset-0 bg-grid pointer-events-none" aria-hidden />
}
