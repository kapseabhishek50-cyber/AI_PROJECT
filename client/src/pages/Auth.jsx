import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Mail, Lock, User, Building2, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import Aurora from '../components/Aurora.jsx'
import { useAuth } from '../lib/auth.jsx'

export default function Auth() {
  const [params] = useSearchParams()
  const mode = params.get('mode') === 'register' ? 'register' : 'login'
  const navigate = useNavigate()
  const { login, register } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    designation: '',
    department: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const afterAuth = (u) => {
        if (u.role === 'admin') return navigate('/app/admin')
        navigate(u.onboarded ? '/app' : '/onboarding')
      }
      if (mode === 'register') {
        const u = await register({
          name: form.name,
          email: form.email,
          password: form.password,
          designation: form.designation,
          department: form.department,
        })
        afterAuth(u)
      } else {
        const u = await login(form.email, form.password)
        afterAuth(u)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const demoFill = (role) => {
    if (role === 'admin') {
      setForm((f) => ({ ...f, email: 'admin@mospi.gov.in', password: 'admin123' }))
    } else {
      setForm((f) => ({ ...f, email: 'officer@mospi.gov.in', password: 'demo123' }))
    }
  }

  return (
    <div className="min-h-screen bg-[#05070f] relative flex flex-col">
      <Aurora variant="hero" />
      <div className="absolute inset-0 bg-grid" aria-hidden />

      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-6">
        <Link to="/">
          <Logo size={36} />
        </Link>
      </header>

      <div className="relative z-10 flex-1 grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto w-full px-6 py-10 items-center">
        {/* left pitch */}
        <div className="hidden lg:block">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="font-display font-700 text-5xl leading-tight">
              Your career in official statistics, <span className="text-gradient">amplified by AI.</span>
            </div>
            <p className="text-slate-400 text-lg mt-5 max-w-md leading-relaxed">
              One sign-in to see your competency profile, skill gaps, personalised pathways and
              AI-generated assessments — all in one place.
            </p>
            <div className="mt-8 space-y-4">
              {[
                'Instant competency gap analysis',
                'iGOT Karmayogi course recommendations',
                'AI quiz generation from your materials',
              ].map((t) => (
                <div key={t} className="flex items-center gap-3 text-slate-300">
                  <span className="w-6 h-6 rounded-full grid place-items-center bg-emerald-400/15 border border-emerald-400/30">
                    <ArrowRight size={13} className="text-emerald-300" />
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* form card */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
          <div className="glass-strong rounded-3xl p-8 shadow-2xl">
            <h2 className="font-display font-700 text-2xl text-white">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-slate-400 text-sm mt-1.5">
              {mode === 'login' ? 'Sign in to continue your learning journey.' : 'Set up your profile to begin competency mapping.'}
            </p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              {mode === 'register' && (
                <Field icon={User}>
                  <input className="input pl-11" placeholder="Full name" value={form.name} onChange={update('name')} required />
                </Field>
              )}
              <Field icon={Mail}>
                <input className="input pl-11" type="email" placeholder="Official email" value={form.email} onChange={update('email')} required />
              </Field>
              <Field icon={Lock}>
                <input
                  className="input pl-11 pr-11"
                  type={showPw ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Password (min 6 chars)' : 'Password'}
                  value={form.password}
                  onChange={update('password')}
                  required
                />
                <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </Field>
              {mode === 'register' && (
                <>
                  <Field icon={Building2}>
                    <input className="input pl-11" placeholder="Designation (e.g. Statistical Officer)" value={form.designation} onChange={update('designation')} />
                  </Field>
                  <Field icon={Building2}>
                    <input className="input pl-11" placeholder="Department / Division" value={form.department} onChange={update('department')} />
                  </Field>
                </>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-rose-300 bg-rose-400/10 border border-rose-400/20 rounded-xl px-4 py-3">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <div className="mt-5 flex items-center gap-3 text-xs text-slate-500">
              <div className="flex-1 h-px bg-white/10" /> or <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => demoFill('employee')} className="btn-ghost py-2.5 text-xs">
                Demo · Officer
              </button>
              <button onClick={() => demoFill('admin')} className="btn-ghost py-2.5 text-xs">
                Demo · Admin
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-slate-400">
              {mode === 'login' ? (
                <>
                  New here?{' '}
                  <Link to="/auth?mode=register" className="text-indigo-300 hover:text-indigo-200 font-medium">
                    Create an account
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link to="/auth" className="text-indigo-300 hover:text-indigo-200 font-medium">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function Field({ icon: Icon, children }) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
        <Icon size={17} />
      </span>
      {children}
    </div>
  )
}
