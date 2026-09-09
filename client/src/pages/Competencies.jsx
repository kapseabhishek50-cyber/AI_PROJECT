import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Check, BrainCircuit } from 'lucide-react'
import { api } from '../lib/api.js'
import { LevelDots, GapPill, SectionTitle, Spinner } from '../components/ui.jsx'

export default function Competencies() {
  const [ov, setOv] = useState(null)
  const [data, setData] = useState(null)
  const [filter, setFilter] = useState('')
  const [domainFilter, setDomainFilter] = useState('all')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([api('/me/overview'), api('/bootstrap')]).then(([o, b]) => {
      setOv(o)
      setData(b)
    })
  }, [])

  if (!ov || !data) return <Spinner label="Loading competency framework…" />

  const domains = data.domains
  const compMap = Object.fromEntries(ov.competencies.map((c) => [c.id, c]))

  const save = async (id, val) => {
    setSaved(true)
    await api('/self-assessment', { method: 'POST', body: { ratings: { [id]: val } } })
    const o = await api('/me/overview')
    setOv(o)
    setTimeout(() => setSaved(false), 1500)
  }

  const filtered = domains
    .filter((d) => domainFilter === 'all' || d.id === domainFilter)
    .map((d) => ({
      ...d,
      comps: data.competencies
        .filter((c) => c.domain === d.id)
        .filter((c) => !filter || c.name.toLowerCase().includes(filter.toLowerCase())),
    }))
    .filter((d) => d.comps.length > 0)

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-700 text-3xl text-white">Competency map</h1>
          <p className="text-slate-400 mt-1.5">Your current level versus your role targets, across all four domains.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-emerald-300 flex items-center gap-1">
              <Check size={15} /> Saved
            </motion.span>
          )}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input pl-10 w-56" placeholder="Search competency…" value={filter} onChange={(e) => setFilter(e.target.value)} />
          </div>
        </div>
      </div>

      {/* domain filter chips */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={domainFilter === 'all'} onClick={() => setDomainFilter('all')}>
          All domains
        </FilterChip>
        {domains.map((d) => (
          <FilterChip key={d.id} active={domainFilter === d.id} onClick={() => setDomainFilter(d.id)} dot={d.color}>
            {d.name}
          </FilterChip>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {filtered.map((d) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-9 h-9 rounded-xl grid place-items-center" style={{ background: `${d.color}1a`, border: `1px solid ${d.color}33` }}>
                <BrainCircuit size={18} style={{ color: d.color }} />
              </span>
              <div>
                <h2 className="font-display font-600 text-lg text-white">{d.name}</h2>
                <p className="text-xs text-slate-500">{d.comps.length} competencies</p>
              </div>
            </div>

            <div className="space-y-4">
              {d.comps.map((c) => {
                const info = compMap[c.id]
                return (
                  <div key={c.id} className="group p-3 rounded-xl border border-white/[0.05] hover:border-white/15 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-white font-medium truncate">{c.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{c.desc}</div>
                      </div>
                      <GapPill level={info.level} target={info.target} />
                    </div>
                    <div className="flex items-center gap-3 mt-2.5">
                      <div className="flex-1">
                        <input
                          type="range"
                          min={0}
                          max={5}
                          value={info.level}
                          onChange={(e) => save(c.id, Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <LevelDots level={info.level} color={d.color} />
                      <span className="text-xs text-slate-500 w-12 text-right">
                        {info.level}/{info.target}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, children, dot }) {
  return (
    <button
      onClick={onClick}
      className={`chip border px-3.5 py-1.5 transition-all ${active ? 'bg-indigo-400/15 border-indigo-400/40 text-indigo-100' : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/25'}`}
    >
      {dot && <span className="w-2 h-2 rounded-full" style={{ background: dot }} />}
      {children}
    </button>
  )
}
