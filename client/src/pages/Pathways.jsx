import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Route, Sparkles, Clock, Play, TrendingUp, BookOpen, Star, CheckCircle2, Search } from 'lucide-react'
import { api } from '../lib/api.js'
import { Spinner, SectionTitle } from '../components/ui.jsx'

const DOMAIN_META = {
  statistical: { label: 'Statistical', color: '#22d3ee' },
  technical: { label: 'Technical', color: '#a78bfa' },
  governance: { label: 'Governance', color: '#34d399' },
  behavioural: { label: 'Behavioural', color: '#fbbf24' },
}

export default function Pathways() {
  const [courses, setCourses] = useState(null)
  const [ov, setOv] = useState(null)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    Promise.all([api('/courses'), api('/me/overview')]).then(([c, o]) => {
      setCourses(c)
      setOv(o)
    })
  }, [])

  if (!courses || !ov) return <Spinner label="Loading courses…" />

  const recIds = new Set(ov.recommendations.map((r) => r.id))
  const filtered = courses
    .filter((c) => filter === 'all' || c.domain === filter)
    .filter((c) => !query || c.title.toLowerCase().includes(query.toLowerCase()) || c.provider.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="space-y-10">
      <SectionTitle
        eyebrow="Learning pathways"
        title="Personalised recommendations"
        desc="Courses ranked against your skill gaps, interests and role targets."
      />

      {/* recommended */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ov.recommendations.map((c, i) => (
          <CourseCard key={c.id} course={c} index={i} recommended onUpdate={async () => setOv(await api('/me/overview'))} />
        ))}
      </div>

      <div className="pt-6 border-t border-white/[0.06]">
        <SectionTitle
          eyebrow="Catalogue"
          title="Full course library"
          desc="iGOT Karmayogi modules and NSSTA · TPAC programmes."
          right={
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input pl-9 w-52" placeholder="Search courses…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          }
        />

        <div className="flex flex-wrap gap-2 mb-6">
          <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterBtn>
          {Object.entries(DOMAIN_META).map(([k, v]) => (
            <FilterBtn key={k} active={filter === k} onClick={() => setFilter(k)} dot={v.color}>
              {v.label}
            </FilterBtn>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <CourseCard key={c.id} course={c} index={i} recommended={recIds.has(c.id)} onUpdate={async () => setOv(await api('/me/overview'))} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FilterBtn({ active, onClick, children, dot }) {
  return (
    <button onClick={onClick} className={`chip border px-3.5 py-1.5 transition-all ${active ? 'bg-indigo-400/15 border-indigo-400/40 text-indigo-100' : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/25'}`}>
      {dot && <span className="w-2 h-2 rounded-full" style={{ background: dot }} />}
      {children}
    </button>
  )
}

function CourseCard({ course, index, recommended, onUpdate }) {
  const [enrolled, setEnrolled] = useState(course.enrolled)
  const [completed, setCompleted] = useState(course.completed)
  const meta = DOMAIN_META[course.domain] || { label: course.domain, color: '#818cf8' }

  const toggleEnroll = async () => {
    const { enrollments } = await api('/courses/enroll', { method: 'POST', body: { courseId: course.id } })
    setEnrolled(enrollments.includes(course.id))
    onUpdate()
  }
  const complete = async () => {
    await api('/courses/complete', { method: 'POST', body: { courseId: course.id } })
    setCompleted(true)
    onUpdate()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="card p-5 flex flex-col hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden"
    >
      {recommended && !completed && (
        <div className="absolute top-3 right-3 chip border border-amber-400/30 bg-amber-400/10 text-amber-300">
          <Sparkles size={11} /> For you
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <span className="chip border" style={{ background: `${meta.color}1a`, borderColor: `${meta.color}33`, color: meta.color }}>
          {meta.label}
        </span>
        <span className="chip bg-white/[0.04] text-slate-400">{course.format}</span>
      </div>
      <h3 className="font-display font-600 text-white leading-snug pr-16">{course.title}</h3>
      <div className="text-xs text-slate-500 mt-1.5">{course.provider}</div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {(course.competencies || []).slice(0, 3).map((c) => (
          <span key={c} className="chip bg-white/[0.04] text-slate-400">{c}</span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 mt-4">
        <span className="flex items-center gap-1"><Clock size={12} /> {course.hours}h</span>
        <span className="flex items-center gap-1"><BookOpen size={12} /> {course.level === 1 ? 'Beginner' : course.level === 2 ? 'Foundation' : course.level === 3 ? 'Intermediate' : 'Advanced'}</span>
        <span className="flex items-center gap-1 text-amber-300"><Star size={12} fill="currentColor" /> {course.rating}</span>
      </div>

      <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center gap-2">
        {completed ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-300">
            <CheckCircle2 size={15} /> Completed
          </span>
        ) : (
          <>
            <button onClick={toggleEnroll} className={enrolled ? 'btn-ghost px-3 py-2 text-xs flex-1' : 'btn-primary px-3 py-2 text-xs flex-1'}>
              {enrolled ? 'Enrolled ✓' : 'Enroll'}
            </button>
            {enrolled && (
              <button onClick={complete} className="btn-outline px-3 py-2 text-xs flex-1">Mark done</button>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
