import React from 'react'
import { motion } from 'framer-motion'

export function ProgressRing({ value, size = 120, stroke = 9, label, sublabel, color = '#818cf8' }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (clamped / 100) * c }}
          transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display font-700 text-2xl" style={{ color: '#fff' }}>
          {clamped}%
        </div>
        {label && <div className="text-[11px] text-slate-400 mt-0.5">{label}</div>}
        {sublabel && <div className="text-[10px] text-slate-500">{sublabel}</div>}
      </div>
    </div>
  )
}

export function LevelDots({ level, max = 5, color = '#818cf8' }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full transition-colors"
          style={{
            background: i < level ? color : 'rgba(255,255,255,.1)',
            boxShadow: i < level ? `0 0 6px ${color}88` : 'none',
          }}
        />
      ))}
    </div>
  )
}

export function GapPill({ level, target }) {
  const gap = target - level
  const tone = gap <= 0 ? 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20' : gap === 1 ? 'text-amber-300 bg-amber-400/10 border-amber-400/20' : 'text-rose-300 bg-rose-400/10 border-rose-400/20'
  return (
    <span className={`chip border ${tone}`}>
      {gap <= 0 ? 'On target' : `Gap +${gap}`}
    </span>
  )
}

export function Stat({ icon: Icon, label, value, accent = '#818cf8', hint }) {
  return (
    <div className="card p-5 relative overflow-hidden group">
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity"
        style={{ background: accent }}
      />
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-xl grid place-items-center"
          style={{ background: `${accent}1a`, border: `1px solid ${accent}33` }}
        >
          <Icon size={18} style={{ color: accent }} />
        </div>
        {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
      </div>
      <div className="mt-4 font-display font-700 text-2xl">{value}</div>
      <div className="text-sm text-slate-400 mt-0.5">{label}</div>
    </div>
  )
}

export function SectionTitle({ eyebrow, title, desc, right }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
      <div>
        {eyebrow && (
          <div className="text-[11px] uppercase tracking-[0.2em] text-indigo-300/80 font-medium mb-2">{eyebrow}</div>
        )}
        <h2 className="font-display font-700 text-2xl text-white">{title}</h2>
        {desc && <p className="text-sm text-slate-400 mt-1.5 max-w-xl">{desc}</p>}
      </div>
      {right}
    </div>
  )
}

export function Sparkline({ data, color = '#818cf8', width = 120, height = 36 }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  })
  const id = `spark-${Math.random().toString(36).slice(2, 8)}`
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts.join(' ')} ${width},${height}`} fill={`url(#${id})`} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r="2.5" fill={color} />
    </svg>
  )
}

export function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-indigo-400 animate-spin" />
      {label && <div className="text-sm text-slate-400">{label}</div>}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="card p-10 text-center flex flex-col items-center gap-3">
      <div className="w-14 h-14 rounded-2xl grid place-items-center bg-white/[0.04] border border-white/10">
        <Icon size={26} className="text-slate-400" />
      </div>
      <div className="font-display font-600 text-lg text-white">{title}</div>
      {desc && <p className="text-sm text-slate-400 max-w-sm">{desc}</p>}
      {action}
    </div>
  )
}
