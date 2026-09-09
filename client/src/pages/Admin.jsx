import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  WandSparkles,
  ClipboardCheck,
  TrendingUp,
  ShieldCheck,
  KeyRound,
  Save,
  Cpu,
} from 'lucide-react'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import { Stat, SectionTitle, Spinner } from '../components/ui.jsx'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie } from 'recharts'

export default function Admin() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [settings, setSettings] = useState(null)
  const [compRows, setCompRows] = useState(null)

  useEffect(() => {
    if (user?.role === 'admin') {
      api('/admin/stats').then(setStats)
      api('/admin/competencies').then(setCompRows)
      api('/settings').then(setSettings)
    }
  }, [user])

  if (user?.role !== 'admin') {
    return (
      <div className="card p-10 text-center text-slate-400">
        This area is restricted to administrators. Sign in with an admin account to view it.
      </div>
    )
  }

  if (!stats) return <Spinner label="Loading organisation insights…" />

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Administrator console"
        title="Workforce intelligence"
        desc="Organisation-wide competency distribution, training effectiveness and emerging skill needs."
      />

      {/* top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Users} label="Active officials" value={stats.totals.users} accent="#818cf8" />
        <Stat icon={BookOpen} label="Courses catalogued" value={stats.totals.courses} accent="#a78bfa" />
        <Stat icon={WandSparkles} label="Quizzes generated" value={stats.totals.quizzesGenerated} accent="#34d399" />
        <Stat icon={ClipboardCheck} label="Assessments taken" value={stats.totals.assessments} accent="#fbbf24" hint={`avg ${stats.totals.avgQuizScore}%`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* domain avg */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <SectionTitle eyebrow="Distribution" title="Competency by domain" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.domainDist} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0d1226', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12 }} labelStyle={{ color: '#fff' }} />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                  {stats.domainDist.map((d, i) => (
                    <Cell key={i} fill={d.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* role distribution */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6">
          <SectionTitle eyebrow="Workforce" title="Officials by role" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.roleDist} dataKey="count" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4} stroke="none">
                  {stats.roleDist.map((_, i) => (
                    <Cell key={i} fill={['#818cf8', '#22d3ee', '#a78bfa', '#34d399', '#fbbf24'][i % 5]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d1226', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12 }} labelStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {stats.roleDist.map((r, i) => (
              <span key={r.id} className="chip bg-white/[0.04] text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ background: ['#818cf8', '#22d3ee', '#a78bfa', '#34d399', '#fbbf24'][i % 5] }} />
                {r.name}: {r.count}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* emerging needs */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <SectionTitle
          eyebrow="Predictive analytics"
          title="Emerging skill requirements"
          desc="Domains with the most officials below target — indicative of future capacity-building needs."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.gapForecast.map((d) => (
            <div key={d.id} className="rounded-2xl p-5 border border-white/[0.06]" style={{ background: `${d.color}0d` }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} style={{ color: d.color }} />
                <span className="font-medium text-white">{d.name}</span>
              </div>
              <div className="font-display font-700 text-3xl" style={{ color: d.color }}>{d.emergingNeed}</div>
              <div className="text-xs text-slate-500 mt-1">competencies below target</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* AI settings */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <SectionTitle eyebrow="Configuration" title="AI engine settings" desc="Connect your LLM provider (OpenAI-compatible) to power higher-quality question generation and assessment." />
        <AiSettings initial={settings} onSaved={() => api('/settings').then(setSettings)} />
      </motion.div>
    </div>
  )
}

function AiSettings({ initial, onSaved }) {
  const [form, setForm] = useState({ aiProvider: 'openai', aiModel: '', aiBaseUrl: '', aiApiKey: '' })
  const [saved, setSaved] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (initial) setForm({ aiProvider: initial.aiProvider, aiModel: initial.aiModel, aiBaseUrl: initial.aiBaseUrl, aiApiKey: '' })
  }, [initial])

  const save = async () => {
    setStatus('')
    try {
      await api('/settings', { method: 'POST', body: { ...form, aiApiKey: form.aiApiKey || undefined } })
      setSaved(true)
      onSaved()
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setStatus(e.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 text-sm ${initial?.aiConfigured ? 'text-emerald-300' : 'text-amber-300'}`}>
        <Cpu size={16} />
        {initial?.aiConfigured ? 'LLM connected — AI-powered generation active.' : 'No API key set — using the built-in smart engine.'}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1.5">Model</label>
          <input className="input" value={form.aiModel} placeholder="gpt-4o-mini" onChange={(e) => setForm((f) => ({ ...f, aiModel: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1.5">Base URL (optional)</label>
          <input className="input" value={form.aiBaseUrl} placeholder="https://api.openai.com/v1" onChange={(e) => setForm((f) => ({ ...f, aiBaseUrl: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-slate-400 block mb-1.5">API key</label>
          <input type="password" className="input" value={form.aiApiKey} placeholder="sk-… (leave blank to keep existing)" onChange={(e) => setForm((f) => ({ ...f, aiApiKey: e.target.value }))} />
        </div>
      </div>
      {status && <div className="text-sm text-rose-300">{status}</div>}
      <button onClick={save} className="btn-primary px-5 py-2.5">
        {saved ? <><Save size={15} /> Saved</> : <><KeyRound size={15} /> Save settings</>}
      </button>
    </div>
  )
}
