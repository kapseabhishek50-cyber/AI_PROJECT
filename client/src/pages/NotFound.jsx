import React from 'react'
import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Logo from '../components/Logo.jsx'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#05070f] grid place-items-center px-6">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Logo size={40} />
        </div>
        <div className="font-display font-700 text-7xl text-gradient">404</div>
        <p className="text-slate-400 mt-3">This page seems to have drifted off the statistical grid.</p>
        <Link to="/" className="btn-primary px-6 py-3 mt-8 inline-flex">
          <Compass size={16} /> Back to home
        </Link>
      </div>
    </div>
  )
}
