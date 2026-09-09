import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BrainCircuit,
  Route,
  ClipboardCheck,
  WandSparkles,
  Bot,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import Logo from './Logo.jsx'

const NAV = [
  { to: '/app', end: true, icon: LayoutDashboard, label: 'Overview' },
  { to: '/app/competencies', icon: BrainCircuit, label: 'Competencies' },
  { to: '/app/pathways', icon: Route, label: 'Learning Pathways' },
  { to: '/app/assess', icon: ClipboardCheck, label: 'Assessments' },
  { to: '/app/generator', icon: WandSparkles, label: 'Quiz Generator' },
  { to: '/app/assistant', icon: Bot, label: 'AI Assistant' },
]

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const Sidebar = (
    <div className="h-full flex flex-col">
      <div className="px-5 pt-6 pb-5">
        <Logo size={36} />
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-white bg-gradient-to-r from-indigo-500/20 to-transparent border border-indigo-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/app/admin"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-white bg-gradient-to-r from-cyan-500/20 to-transparent border border-cyan-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <ShieldCheck size={18} />
            Admin Console
          </NavLink>
        )}
      </nav>
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full grid place-items-center text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-fuchsia-500 shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-[11px] text-slate-500 truncate">{user?.designation || user?.email}</div>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-rose-400 transition-colors" title="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#05070f] text-slate-100">
      {/* desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 glass-strong border-r border-white/[0.06] z-30">
        {Sidebar}
      </aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-64 glass-strong z-50 lg:hidden"
            >
              <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-slate-400">
                <X size={20} />
              </button>
              {Sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 lg:hidden flex items-center justify-between px-4 py-3 glass-strong border-b border-white/[0.06]">
          <Logo size={30} />
          <button onClick={() => setOpen(true)} className="text-slate-200">
            <Menu size={22} />
          </button>
        </header>

        <div className="relative min-h-screen">
          {/* ambient background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
            <div className="aurora" style={{ width: 420, height: 420, left: '55%', top: '-12%', background: '#4f46e5', opacity: 0.35 }} />
            <div className="aurora" style={{ width: 360, height: 360, left: '-8%', top: '45%', background: '#0e7490', opacity: 0.25 }} />
          </div>
          <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
