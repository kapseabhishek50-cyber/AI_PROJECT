import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth.jsx'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Onboarding from './pages/Onboarding.jsx'
import AppShell from './components/AppShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Competencies from './pages/Competencies.jsx'
import Pathways from './pages/Pathways.jsx'
import Assess from './pages/Assess.jsx'
import Generator from './pages/Generator.jsx'
import Assistant from './pages/Assistant.jsx'
import Admin from './pages/Admin.jsx'
import NotFound from './pages/NotFound.jsx'

function Protected({ children }) {
  const { user, booted } = useAuth()
  if (!booted) return <BootScreen />
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function RequireOnboarded({ children }) {
  const { user } = useAuth()
  if (user && !user.onboarded) return <Navigate to="/onboarding" replace />
  return children
}

function BootScreen() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#05070f]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 animate-pulse" />
        <div className="text-slate-400 text-sm font-display tracking-widest uppercase">Loading Pragyan…</div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/onboarding"
        element={
          <Protected>
            <Onboarding />
          </Protected>
        }
      />
      <Route
        path="/app"
        element={
          <Protected>
            <RequireOnboarded>
              <AppShell />
            </RequireOnboarded>
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="competencies" element={<Competencies />} />
        <Route path="pathways" element={<Pathways />} />
        <Route path="assess" element={<Assess />} />
        <Route path="generator" element={<Generator />} />
        <Route path="assistant" element={<Assistant />} />
        <Route path="admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
