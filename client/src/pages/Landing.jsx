import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BrainCircuit,
  Route,
  ClipboardCheck,
  WandSparkles,
  Bot,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Check,
  Play,
  Building2,
  GitBranch,
  Layers,
} from 'lucide-react'
import ThreeBackground from '../components/ThreeBackground.jsx'
import Reveal from '../components/Reveal.jsx'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../lib/auth.jsx'

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'AI Competency Assessment',
    desc: 'Auto-build a full competency profile from designation, role, experience and qualifications — then benchmark against the Official Statistics framework.',
    accent: '#818cf8',
  },
  {
    icon: GitBranch,
    title: 'Skill-Gap Analysis',
    desc: 'Precision mapping of knowledge gaps across statistical, technical, governance and behavioural domains, ranked by urgency.',
    accent: '#22d3ee',
  },
  {
    icon: Route,
    title: 'Personalised Pathways',
    desc: 'Smart recommendations from the iGOT Karmayogi catalogue and NSSTA · TPAC programmes, matched to your role and career progression.',
    accent: '#a78bfa',
  },
  {
    icon: WandSparkles,
    title: 'AI Quiz & MCQ Engine',
    desc: 'Upload documents, notes or transcripts and instantly generate MCQs and quizzes with explanations and instant evaluation.',
    accent: '#34d399',
  },
  {
    icon: Bot,
    title: 'AI Virtual Assistant',
    desc: 'A conversational guide that explains gaps, suggests next steps and answers questions about your learning journey in real time.',
    accent: '#fbbf24',
  },
  {
    icon: BarChart3,
    title: 'Intelligence Dashboards',
    desc: 'Learner and administrator analytics — progress, competency distribution and predictive insights for workforce planning.',
    accent: '#fb7185',
  },
]

const DOMAINS = [
  { name: 'Statistical', items: 'Survey Design · Sampling · National Accounts · SDG', color: '#22d3ee' },
  { name: 'Technical', items: 'Python · R · SQL · AI/ML · Cloud · GIS', color: '#a78bfa' },
  { name: 'Digital Governance', items: 'Cybersecurity · Privacy · DPI · Gov Cloud', color: '#34d399' },
  { name: 'Behavioural', items: 'Leadership · Ethics · Change Management', color: '#fbbf24' },
]

function useCountUp(target, active, duration = 1400) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active, duration])
  return val
}

function StatCounter({ value, suffix, label, active }) {
  const v = useCountUp(value, active)
  return (
    <div className="text-center">
      <div className="font-display font-700 text-4xl sm:text-5xl text-white">
        {v}
        {suffix}
      </div>
      <div className="text-sm text-slate-400 mt-2">{label}</div>
    </div>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const [statsOn, setStatsOn] = useState(false)

  useEffect(() => {
    const el = document.getElementById('stats-section')
    if (!el) return
    const io = new IntersectionObserver((e) => e[0].isIntersecting && setStatsOn(true), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#05070f] text-slate-100 overflow-x-hidden">
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mt-4 glass-strong rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between">
            <Logo size={34} />
            <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
              <a href="#features" className="hover:text-white transition-colors">Platform</a>
              <a href="#domains" className="hover:text-white transition-colors">Domains</a>
              <a href="#workflow" className="hover:text-white transition-colors">How it works</a>
            </nav>
            <div className="flex items-center gap-3">
              {user ? (
                <Link to="/app" className="btn-primary px-4 py-2 text-sm">
                  Open Dashboard <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link to="/auth" className="btn-ghost px-4 py-2 text-sm hidden sm:inline-flex">
                    Sign in
                  </Link>
                  <Link to="/auth?mode=register" className="btn-primary px-4 py-2 text-sm">
                    Get started <ArrowRight size={16} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-28 pb-20">
        <ThreeBackground />
        <div className="absolute inset-0 bg-grid" aria-hidden />
        <div className="absolute inset-0 bg-radial-fade" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2 chip border border-indigo-400/25 bg-indigo-400/10 text-indigo-200 px-3 py-1.5"
            >
              <Sparkles size={14} className="text-indigo-300" />
              AI Skill Intelligence for India's Official Statistical System
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display font-700 text-5xl sm:text-6xl lg:text-7xl leading-[1.02] mt-6"
            >
              Build a future-ready
              <br />
              <span className="text-gradient">statistical workforce.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg text-slate-400 mt-6 max-w-xl leading-relaxed"
            >
              Pragyan assesses competencies, pinpoints skill gaps, and recommends personalised
              learning pathways — integrating with the iGOT Karmayogi ecosystem and generating
              AI-powered assessments from your own materials.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 mt-9"
            >
              {user ? (
                <Link to="/app" className="btn-primary px-6 py-3.5 text-base">
                  Open your dashboard <ArrowRight size={18} />
                </Link>
              ) : (
                <Link to="/auth?mode=register" className="btn-primary px-6 py-3.5 text-base">
                  Start your journey <ArrowRight size={18} />
                </Link>
              )}
              <a href="#workflow" className="btn-ghost px-6 py-3.5 text-base">
                <Play size={16} /> See how it works
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex flex-wrap gap-x-6 gap-y-2 mt-10 text-sm text-slate-500"
            >
              {['iGOT Karmayogi integration', 'NSSTA · TPAC programmes', 'Role-based access', 'SSO-ready'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-400" /> {t}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <div className="w-6 h-10 rounded-full border border-slate-700 flex justify-center pt-2">
              <div className="w-1 h-2 rounded-full bg-slate-500" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* STATS */}
      <section id="stats-section" className="relative py-20 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-10">
          <StatCounter value={33} suffix="+" label="Competency areas mapped" active={statsOn} />
          <StatCounter value={26} suffix="" label="Curated courses catalogued" active={statsOn} />
          <StatCounter value={4} suffix="" label="Competency domains" active={statsOn} />
          <StatCounter value={100} suffix="%" label="Personalised pathways" active={statsOn} />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-[11px] uppercase tracking-[0.25em] text-indigo-300/80 font-medium">The platform</div>
            <h2 className="font-display font-700 text-4xl sm:text-5xl mt-3">
              One intelligence layer for <span className="text-gradient">continuous capacity building</span>
            </h2>
            <p className="text-slate-400 mt-4 text-lg">
              From competency profiling to adaptive assessments — everything a statistical official needs to grow.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 70}>
                <div className="group card p-7 h-full hover:-translate-y-1.5 transition-transform duration-300 relative overflow-hidden">
                  <div
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500"
                    style={{ background: f.accent }}
                  />
                  <div
                    className="w-12 h-12 rounded-2xl grid place-items-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: `${f.accent}1a`, border: `1px solid ${f.accent}33` }}
                  >
                    <f.icon size={22} style={{ color: f.accent }} />
                  </div>
                  <h3 className="font-display font-600 text-xl text-white mb-2.5">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DOMAINS */}
      <section id="domains" className="relative py-24 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="mb-14">
            <div className="text-[11px] uppercase tracking-[0.25em] text-indigo-300/80 font-medium">Competency framework</div>
            <h2 className="font-display font-700 text-4xl sm:text-5xl mt-3 max-w-2xl">
              Four domains, <span className="text-gradient">one unified profile</span>
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DOMAINS.map((d, i) => (
              <Reveal key={d.name} delay={i * 80}>
                <div className="card p-6 h-full relative overflow-hidden group">
                  <div className="absolute inset-x-0 top-0 h-1" style={{ background: d.color }} />
                  <div className="flex items-center gap-2 mb-4">
                    <Layers size={18} style={{ color: d.color }} />
                    <span className="font-display font-600 text-lg text-white">{d.name}</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{d.items}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="relative py-24 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-[11px] uppercase tracking-[0.25em] text-indigo-300/80 font-medium">How it works</div>
            <h2 className="font-display font-700 text-4xl sm:text-5xl mt-3">
              From profile to <span className="text-gradient-warm">mastery</span> in four steps
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-4 gap-5">
            {[
              { n: '01', icon: Building2, t: 'Profile', d: 'Designation, role, experience and qualifications auto-build your competency baseline.' },
              { n: '02', icon: BrainCircuit, t: 'Assess', d: 'AI benchmarks you against targets and pinpoints precise skill gaps.' },
              { n: '03', icon: Route, t: 'Learn', d: 'Personalised pathways draw from iGOT Karmayogi and NSSTA · TPAC.' },
              { n: '04', icon: ClipboardCheck, t: 'Reinforce', d: 'AI-generated quizzes and instant feedback lock in new skills.' },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="relative card p-7 h-full">
                  <div className="font-display font-700 text-4xl text-white/10 absolute top-5 right-5">{s.n}</div>
                  <div className="w-11 h-11 rounded-xl grid place-items-center bg-indigo-400/10 border border-indigo-400/25 mb-5">
                    <s.icon size={20} className="text-indigo-300" />
                  </div>
                  <div className="font-display font-600 text-lg text-white mb-2">{s.t}</div>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="relative glass-strong rounded-3xl p-10 sm:p-16 text-center overflow-hidden">
              <div className="aurora" style={{ width: 420, height: 420, left: '50%', top: '-60%', transform: 'translateX(-50%)', background: '#4f46e5', opacity: 0.4 }} />
              <ShieldCheck size={40} className="mx-auto text-indigo-300 mb-6 relative" />
              <h2 className="font-display font-700 text-4xl sm:text-5xl relative">
                Ready to close your <span className="text-gradient">skill gaps?</span>
              </h2>
              <p className="text-slate-400 text-lg mt-4 max-w-xl mx-auto relative">
                Join the platform and get a personalised, competency-based learning pathway
                tailored to your role in India's Official Statistical System.
              </p>
              <div className="mt-8 relative">
                {user ? (
                  <Link to="/app" className="btn-primary px-8 py-4 text-base">
                    Open dashboard <ArrowRight size={18} />
                  </Link>
                ) : (
                  <Link to="/auth?mode=register" className="btn-primary px-8 py-4 text-base">
                    Create your profile <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo size={30} />
          <div className="text-sm text-slate-500 text-center sm:text-right">
            <div>Ministry of Statistics & Programme Implementation · Data Informatics & Innovation Division</div>
            <div className="text-slate-600 text-xs mt-1">Pragyan — AI-enabled Skill Intelligence Platform (concept demonstrator)</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
