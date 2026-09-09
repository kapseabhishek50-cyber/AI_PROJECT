import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Briefcase, GraduationCap, Sparkles, Check, ChevronRight } from 'lucide-react'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import Aurora from '../components/Aurora.jsx'
import Logo from '../components/Logo.jsx'

const EXPERIENCE = ['0–2 years', '3–5 years', '6–10 years', '11–20 years', '20+ years']
const EDUCATIONS = [
  "Bachelor's in Statistics", "Master's in Statistics", 'Post-graduate diploma', 'Engineering / Technology',
  'MBA / Management', 'PhD / Research', 'Other',
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, refresh } = useAuth()
  const [data, setData] = useState(null)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [profile, setProfile] = useState({
    role: '',
    experience: '3–5 years',
    education: "Master's in Statistics",
    interests: [],
    previousTrainings: [],
    languages: ['English'],
  })

  useEffect(() => {
    api('/bootstrap').then(setData).catch(() => setData({ roles: [], competencies: [] }))
  }, [])

  const steps = ['Role & Experience', 'Competencies & Interests', 'Review & Launch']

  const toggle = (list, key) => (val) =>
    setProfile((p) => ({ ...p, [key]: p[key].includes(val) ? p[key].filter((x) => x !== val) : [...p[key], val] }))

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      await api('/onboard', { method: 'POST', body: { profile } })
      await refresh()
      navigate('/app')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!data) return <Boot />

  const roles = data.roles || []
  const competencies = data.competencies || []
  const byDomain = (data.domains || []).map((d) => ({
    ...d,
    comps: competencies.filter((c) => c.domain === d.id),
  }))

  return (
    <div className="min-h-screen bg-[#05070f] relative">
      <Aurora variant="hero" />
      <div className="absolute inset-0 bg-grid" aria-hidden />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Logo size={34} />
          <div className="text-sm text-slate-400">
            Step <span className="text-white font-semibold">{step + 1}</span> of {steps.length}
          </div>
        </div>

        {/* progress */}
        <div className="flex gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-gradient-to-r from-indigo-500 to-cyan-400' : 'bg-white/10'}`} />
              <div className={`text-xs mt-2 ${i <= step ? 'text-indigo-200' : 'text-slate-600'}`}>{s}</div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
            className="glass-strong rounded-3xl p-8 sm:p-10"
          >
            {step === 0 && (
              <div>
                <h2 className="font-display font-700 text-3xl text-white flex items-center gap-3">
                  <Briefcase size={26} className="text-indigo-300" /> Your role
                </h2>
                <p className="text-slate-400 mt-2">This determines your competency targets across all four domains.</p>

                <div className="mt-7 grid sm:grid-cols-2 gap-3">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setProfile((p) => ({ ...p, role: r.id }))}
                      className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
                        profile.role === r.id
                          ? 'border-indigo-400/50 bg-indigo-400/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">{r.name}</span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 chip bg-white/5">{r.tier}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">{r.blurb}</p>
                    </button>
                  ))}
                </div>

                <div className="mt-8 grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm text-slate-300 font-medium block mb-2">Experience</label>
                    <div className="flex flex-wrap gap-2">
                      {EXPERIENCE.map((e) => (
                        <Chip key={e} active={profile.experience === e} onClick={() => setProfile((p) => ({ ...p, experience: e }))}>
                          {e}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 font-medium block mb-2">Education</label>
                    <select className="input" value={profile.education} onChange={(e) => setProfile((p) => ({ ...p, education: e.target.value }))}>
                      {EDUCATIONS.map((e) => (
                        <option key={e} value={e} className="bg-ink-800">
                          {e}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="font-display font-700 text-3xl text-white flex items-center gap-3">
                  <GraduationCap size={26} className="text-cyan-300" /> Interests & aspirations
                </h2>
                <p className="text-slate-400 mt-2">Select the areas you want to strengthen — recommendations will prioritise them.</p>

                <div className="mt-7 space-y-6 max-h-[52vh] overflow-y-auto pr-2">
                  {byDomain.map((d) => (
                    <div key={d.id}>
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-sm font-medium text-slate-200">{d.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {d.comps.map((c) => (
                          <Chip key={c.id} active={profile.interests.includes(c.id)} onClick={toggle(profile.interests, 'interests')(c.id)}>
                            {c.name}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="font-display font-700 text-3xl text-white flex items-center gap-3">
                  <Sparkles size={26} className="text-amber-300" /> Review & launch
                </h2>
                <p className="text-slate-400 mt-2">Here's the profile we'll use to generate your personalised pathway.</p>

                <div className="mt-7 grid sm:grid-cols-2 gap-4">
                  <Info label="Role" value={roles.find((r) => r.id === profile.role)?.name || '—'} />
                  <Info label="Experience" value={profile.experience} />
                  <Info label="Education" value={profile.education} />
                  <Info label="Languages" value={profile.languages.join(', ')} />
                </div>

                <div className="mt-5">
                  <div className="text-sm text-slate-400 mb-2">
                    Interests <span className="text-slate-600">({profile.interests.length} selected)</span>
                  </div>
                  {profile.interests.length ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((id) => (
                        <span key={id} className="chip bg-indigo-400/10 border border-indigo-400/25 text-indigo-200">
                          {competencies.find((c) => c.id === id)?.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">No interests selected — we'll optimise purely on role gaps.</div>
                  )}
                </div>

                {error && <div className="mt-5 text-sm text-rose-300 bg-rose-400/10 border border-rose-400/20 rounded-xl px-4 py-3">{error}</div>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-ghost px-5 py-3"
          >
            <ArrowLeft size={16} /> Back
          </button>
          {step < steps.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} className="btn-primary px-6 py-3">
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={submit} disabled={loading} className="btn-primary px-6 py-3">
              {loading ? 'Building your profile…' : 'Launch my dashboard'} <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`chip border transition-all duration-200 px-3 py-1.5 ${
        active ? 'bg-indigo-400/15 border-indigo-400/40 text-indigo-100' : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/25'
      }`}
    >
      {active && <Check size={12} />} {children}
    </button>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
      <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-white font-medium mt-1">{value}</div>
    </div>
  )
}

function Boot() {
  return (
    <div className="min-h-screen bg-[#05070f] grid place-items-center">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 animate-pulse" />
    </div>
  )
}
