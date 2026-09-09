import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  Sparkles,
  AlertTriangle,
  Play,
  CheckCircle2,
} from 'lucide-react'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import { ProgressRing, Stat, LevelDots, GapPill, SectionTitle, Spinner } from '../components/ui.jsx'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts'

export default function Dashboard() {
  const { user } = useAuth()
  const [ov, setOv] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/me/overview').then(setOv).finally(() => setLoading(false))
  }, [])

  if (loading || !ov) return <Spinner label="Computing your competency profile…" />

  const radarData = ov.byDomain.map((d) => ({ domain: d.name.replace(' Competencies', '').replace(' & ', ' & '), value: d.pct, color: d.color }))

  return (
    <div className="space-y-8">
      {/* greeting */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-700 text-3xl text-white">
              Namaste, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-400 mt-1.5">
              Here's your competency snapshot as a {user?.profile?.role ? user.profile.role.replace(/-/g, ' ') : 'statistical official'}.
            </p>
          </div>
          <Link to="/app/assess" className="btn-primary px-5 py-3">
            <Sparkles size={16} /> Assess my skills
          </Link>
        </div>
      </motion.div>

      {/* top stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Target} label="Overall competency" value={`${ov.overall}%`} accent="#818cf8" />
        <Stat icon={AlertTriangle} label="Skill gaps identified" value={ov.topGaps.length} accent="#fb7185" hint="priority" />
        <Stat icon={Clock} label="Learning hours" value={`${ov.learningHours}h`} accent="#22d3ee" />
        <Stat icon={BookOpen} label="Recommended courses" value={ov.recommendations.length} accent="#34d399" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* overall ring + radar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6">
          <SectionTitle eyebrow="Profile" title="Competency score" />
          <div className="flex items-center justify-center py-2">
            <ProgressRing value={ov.overall} size={170} stroke={12} color="#818cf8" label="of target" />
          </div>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="rgba(255,255,255,.08)" />
                <PolarAngleAxis dataKey="domain" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar dataKey="value" stroke="#818cf8" fill="#6366f1" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* domain bars */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <SectionTitle eyebrow="Domains" title="Domain mastery" />
          <div className="space-y-5">
            {ov.byDomain.map((d) => (
              <div key={d.id}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300 font-medium">{d.name}</span>
                  <span className="text-slate-500">{d.pct}%</span>
                </div>
                <div className="bar-track">
                  <motion.div
                    className="bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${d.pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ background: `linear-gradient(90deg, ${d.color}88, ${d.color})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* top gaps */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
          <SectionTitle eyebrow="Priorities" title="Top skill gaps" />
          <div className="space-y-3">
            {ov.topGaps.map((g, i) => (
              <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition-colors">
                <div className="w-7 h-7 rounded-lg grid place-items-center text-xs font-bold text-white bg-gradient-to-br from-rose-500/80 to-orange-500/80 shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">{g.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <LevelDots level={g.level} color="#fb7185" />
                    <span className="text-[11px] text-slate-500">→ {g.target}</span>
                  </div>
                </div>
                <GapPill level={g.level} target={g.target} />
              </div>
            ))}
          </div>
          <Link to="/app/competencies" className="btn-ghost w-full mt-5 py-2.5 text-sm">
            View full competency map <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>

      {/* recommendations */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <SectionTitle
          eyebrow="Personalised for you"
          title="Recommended learning pathways"
          desc="Ranked by your skill gaps and career goals — sourced from iGOT Karmayogi and NSSTA · TPAC."
          right={
            <Link to="/app/pathways" className="btn-ghost px-4 py-2 text-sm">
              Browse all <ArrowRight size={15} />
            </Link>
          }
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ov.recommendations.map((c, i) => (
            <CourseCard key={c.id} course={c} index={i} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function CourseCard({ course, index }) {
  const [enrolled, setEnrolled] = useState(course.enrolled)
  const [completed, setCompleted] = useState(course.completed)

  const toggleEnroll = async () => {
    const { enrollments } = await api('/courses/enroll', { method: 'POST', body: { courseId: course.id } })
    setEnrolled(enrollments.includes(course.id))
  }

  const complete = async () => {
    await api('/courses/complete', { method: 'POST', body: { courseId: course.id } })
    setCompleted(true)
  }

  const domainColor = { statistical: '#22d3ee', technical: '#a78bfa', governance: '#34d399', behavioural: '#fbbf24' }[course.domain] || '#818cf8'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="card p-5 flex flex-col group hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="chip border" style={{ background: `${domainColor}1a`, borderColor: `${domainColor}33`, color: domainColor }}>
          {course.domain}
        </span>
        <span className="flex items-center gap-1 text-xs text-amber-300">
          <TrendingUp size={12} /> {course.match}% match
        </span>
      </div>
      <h3 className="font-display font-600 text-white leading-snug">{course.title}</h3>
      <div className="text-xs text-slate-500 mt-1.5">{course.provider}</div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {course.competencies.slice(0, 3).map((c) => (
          <span key={c} className="chip bg-white/[0.04] text-slate-400">{c}</span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 mt-4">
        <span className="flex items-center gap-1"><Clock size={12} /> {course.hours}h</span>
        <span className="flex items-center gap-1"><Play size={12} /> {course.level === 1 ? 'Beginner' : course.level === 2 ? 'Foundation' : course.level === 3 ? 'Intermediate' : 'Advanced'}</span>
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
              <button onClick={complete} className="btn-outline px-3 py-2 text-xs flex-1">
                Mark done
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
