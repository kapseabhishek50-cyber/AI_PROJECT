import React from 'react'

export default function Logo({ size = 40, showText = true, light = false }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative grid place-items-center rounded-xl shrink-0"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg,#6366f1,#4f46e5 55%,#0ea5e9)',
          boxShadow: '0 8px 24px -8px rgba(99,102,241,.7)',
        }}
      >
        <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none">
          <path d="M4 17V8l8-4 8 4v9l-8 4-8-4Z" stroke="white" strokeWidth="1.4" />
          <path d="M4 8l8 4 8-4" stroke="white" strokeWidth="1.4" />
          <path d="M12 12v9" stroke="white" strokeWidth="1.4" />
          <circle cx="12" cy="12" r="1.8" fill="white" />
        </svg>
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-300 animate-pulse-glow" />
      </div>
      {showText && (
        <div className="leading-none">
          <div className={`font-display font-700 text-xl tracking-tight ${light ? 'text-white' : 'text-white'}`}>
            Pragyan<span className="text-gradient">.</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1">
            Skill Intelligence · MoSPI
          </div>
        </div>
      )}
    </div>
  )
}
