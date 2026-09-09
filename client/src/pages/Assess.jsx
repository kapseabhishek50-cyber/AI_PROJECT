import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardCheck, ArrowRight, ArrowLeft, Check, X, Sparkles, RotateCcw, Lightbulb, BrainCircuit } from 'lucide-react'
import { api } from '../lib/api.js'
import { ProgressRing, Spinner, SectionTitle } from '../components/ui.jsx'

export default function Assess() {
  const [phase, setPhase] = useState('intro') // intro | quiz | results
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const start = async () => {
    setLoading(true)
    const { questions } = await api('/assessment/questions')
    setQuestions(questions)
    setAnswers({})
    setIdx(0)
    setResult(null)
    setLoading(false)
    setPhase('quiz')
  }

  const choose = (qid, optIdx) => {
    setAnswers((a) => ({ ...a, [qid]: optIdx }))
    // brief pause then advance
    setTimeout(() => {
      if (idx < questions.length - 1) setIdx((i) => i + 1)
      else submit({ ...answers, [qid]: optIdx })
    }, 350)
  }

  const submit = async (finalAnswers = answers) => {
    setLoading(true)
    const payload = questions.map((q) => ({ questionId: q.id, answer: finalAnswers[q.id] }))
    const res = await api('/assessment/evaluate', { method: 'POST', body: { answers: payload } })
    setResult(res)
    setPhase('results')
    setLoading(false)
  }

  if (loading && phase === 'intro') return <Spinner label="Preparing adaptive questions…" />

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <SectionTitle
        eyebrow="Adaptive assessment"
        title="Competency check"
        desc="AI selects questions targeting your highest-priority skill gaps."
      />

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-10 text-center">
            <div className="w-16 h-16 rounded-2xl grid place-items-center bg-indigo-400/10 border border-indigo-400/25 mx-auto mb-6">
              <ClipboardCheck size={28} className="text-indigo-300" />
            </div>
            <h2 className="font-display font-700 text-2xl text-white">Ready to benchmark yourself?</h2>
            <p className="text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">
              A short adaptive quiz drawn from your weakest competency areas. Your results update
              your profile and refine your recommendations instantly.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4 text-sm text-slate-400">
              <span className="chip bg-white/[0.04]">Up to 12 questions</span>
              <span className="chip bg-white/[0.04]">Instant evaluation</span>
              <span className="chip bg-white/[0.04]">Detailed explanations</span>
            </div>
            <button onClick={start} className="btn-primary px-8 py-3.5 mt-8 text-base">
              <Sparkles size={17} /> Start assessment
            </button>
          </motion.div>
        )}

        {phase === 'quiz' && questions.length > 0 && (
          <motion.div key="quiz" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
            {/* progress */}
            <div className="flex items-center justify-between mb-4 text-sm text-slate-400">
              <span>Question {idx + 1} of {questions.length}</span>
              <span>{Math.round(((idx + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="bar-track mb-8">
              <motion.div className="bar-fill" animate={{ width: `${((idx + 1) / questions.length) * 100}%` }} style={{ background: 'linear-gradient(90deg,#6366f1,#22d3ee)' }} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="card p-8"
              >
                <div className="chip bg-indigo-400/10 border border-indigo-400/25 text-indigo-200 mb-4">
                  {questions[idx].competency ? <BrainCircuit size={12} /> : null}
                  {questions[idx].competency?.replace(/-/g, ' ') || 'Competency'}
                </div>
                <h3 className="font-display font-600 text-xl text-white leading-snug">{questions[idx].q}</h3>
                <div className="mt-6 space-y-3">
                  {questions[idx].options.map((opt, oi) => {
                    const chosen = answers[questions[idx].id] === oi
                    return (
                      <button
                        key={oi}
                        onClick={() => choose(questions[idx].id, oi)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                          chosen
                            ? 'border-indigo-400/50 bg-indigo-400/10'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-lg grid place-items-center text-sm font-bold shrink-0 ${chosen ? 'bg-indigo-400 text-white' : 'bg-white/[0.06] text-slate-400'}`}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className="text-slate-200">{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {phase === 'results' && result && (
          <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="card p-8 text-center">
              <div className="flex justify-center mb-4">
                <ProgressRing value={result.score} size={150} stroke={12} color={result.score >= 70 ? '#34d399' : result.score >= 40 ? '#fbbf24' : '#fb7185'} label="score" />
              </div>
              <h2 className="font-display font-700 text-2xl text-white">
                {result.score >= 70 ? 'Excellent work! 🎉' : result.score >= 40 ? 'Solid effort — keep going 💪' : 'Good start — your pathway will adapt 📈'}
              </h2>
              <p className="text-slate-400 mt-2">
                {result.correct} of {result.total} correct. Your competency profile has been updated.
              </p>
              <button onClick={start} className="btn-ghost px-6 py-3 mt-6">
                <RotateCcw size={16} /> Retake assessment
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="font-display font-600 text-lg text-white flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-300" /> Review & explanations
              </h3>
              {result.results.map((r, i) => (
                <div key={i} className={`card p-5 border-l-2 ${r.correct ? 'border-l-emerald-400/60' : 'border-l-rose-400/60'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full grid place-items-center shrink-0 mt-0.5 ${r.correct ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'}`}>
                      {r.correct ? <Check size={14} /> : <X size={14} />}
                    </span>
                    <div className="flex-1">
                      <div className="text-white font-medium">{r.question}</div>
                      {!r.correct && (
                        <div className="text-sm mt-2 text-rose-300">Your answer: {r.options[r.chosen]}</div>
                      )}
                      <div className="text-sm mt-1 text-emerald-300">Correct: {r.options[r.answer]}</div>
                      {r.explanation && <div className="text-sm text-slate-400 mt-2 leading-relaxed">{r.explanation}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
