import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, Sparkles, User, BookOpen, ArrowRight } from 'lucide-react'
import { api } from '../lib/api.js'
import { SectionTitle } from '../components/ui.jsx'

const SUGGESTIONS = [
  'What are my biggest skill gaps?',
  'Recommend courses for me',
  'What is my overall progress?',
  'How can I improve my sampling skills?',
  'Explain my domain strengths',
]

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Namaste! I'm your learning assistant. Ask me about your skill gaps, progress, or which courses to take next. 👋",
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const q = (text ?? input).trim()
    if (!q || busy) return
    setMessages((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setBusy(true)
    try {
      const res = await api(`/assistant?q=${encodeURIComponent(q)}`)
      setMessages((m) => [...m, { role: 'ai', text: res.answer, courses: res.courses }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'ai', text: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <SectionTitle
        eyebrow="AI Virtual Assistant"
        title="Your learning companion"
        desc="Conversational support for competencies, gaps and recommendations."
      />

      <div className="card flex flex-col h-[62vh]">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl grid place-items-center shrink-0 ${m.role === 'ai' ? 'bg-gradient-to-br from-indigo-500 to-cyan-400' : 'bg-white/10'}`}>
                  {m.role === 'ai' ? <Bot size={16} className="text-white" /> : <User size={16} className="text-slate-300" />}
                </div>
                <div className={`max-w-[80%] space-y-2 ${m.role === 'user' ? 'items-end' : ''}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'ai' ? 'glass rounded-tl-sm' : 'bg-gradient-to-br from-indigo-500/30 to-violet-500/20 border border-indigo-400/20 rounded-tr-sm'}`}>
                    {m.text}
                  </div>
                  {m.courses?.length > 0 && (
                    <div className="space-y-1.5">
                      {m.courses.map((c) => (
                        <div key={c.id} className="glass rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
                          <BookOpen size={13} className="text-indigo-300 shrink-0" />
                          <span className="text-slate-300 flex-1">{c.title}</span>
                          <span className="text-slate-500">{c.hours}h</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {busy && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl grid place-items-center bg-gradient-to-br from-indigo-500 to-cyan-400">
                <Bot size={16} className="text-white" />
              </div>
              <div className="flex gap-1.5 items-center px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="w-2 h-2 rounded-full bg-slate-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* suggestions */}
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} className="chip border border-white/10 bg-white/[0.03] text-slate-400 hover:border-indigo-400/40 hover:text-indigo-200 transition-colors">
              <Sparkles size={11} /> {s}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/[0.06]">
          <form
            onSubmit={(e) => { e.preventDefault(); send() }}
            className="flex items-center gap-2"
          >
            <input
              className="input flex-1"
              placeholder="Ask about your learning journey…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={busy || !input.trim()} className="btn-primary p-3 rounded-xl">
              <Send size={17} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
