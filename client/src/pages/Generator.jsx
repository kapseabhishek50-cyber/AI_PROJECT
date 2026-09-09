import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  WandSparkles,
  UploadCloud,
  FileText,
  X,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  History,
  Plus,
  Lightbulb,
  Cpu,
} from 'lucide-react'
import { api } from '../lib/api.js'
import { Spinner, SectionTitle, ProgressRing, EmptyState } from '../components/ui.jsx'

export default function Generator() {
  const [tab, setTab] = useState('generate') // generate | history | take
  const [uploadId, setUploadId] = useState(null)
  const [fileName, setFileName] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [paste, setPaste] = useState('')
  const [title, setTitle] = useState('')
  const [count, setCount] = useState(8)
  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [quiz, setQuiz] = useState(null)
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)
  const fileRef = useRef(null)

  const loadHistory = () => api('/generated').then(setHistory)
  useEffect(() => {
    loadHistory()
  }, [])

  const upload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await api('/upload', { method: 'POST', formData: fd })
      setUploadId(res.uploadId)
      setFileName(res.name)
      setCharCount(res.charCount)
      if (!title) setTitle(`Quiz from ${res.name.replace(/\.[^.]+$/, '')}`)
    } catch (err) {
      setError(err.message)
    }
  }

  const generate = async () => {
    if (!uploadId && paste.trim().length < 60) {
      setError('Upload a document or paste at least ~60 characters of content.')
      return
    }
    setGenerating(true)
    setError('')
    try {
      const res = await api('/generate', {
        method: 'POST',
        body: { uploadId, text: paste || undefined, count, topic, title: title || undefined },
      })
      setTab('take')
      await openQuiz(res.quizId)
      loadHistory()
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const openQuiz = async (id) => {
    const q = await api(`/generated/${id}`)
    setQuiz(q)
    setQuizIdx(0)
    setQuizAnswers({})
    setQuizResult(null)
  }

  const choose = (qid, oi) => {
    setQuizAnswers((a) => ({ ...a, [qid]: oi }))
  }

  const submitQuiz = async () => {
    const answers = quiz.questions.map((q) => (quizAnswers[q.question] == null ? null : quizAnswers[q.question]))
    const res = await api('/quiz/submit', { method: 'POST', body: { quizId: quiz.id, answers } })
    setQuizResult(res)
  }

  const reset = () => {
    setUploadId(null)
    setFileName('')
    setCharCount(0)
    setPaste('')
    setTitle('')
    setTopic('')
    setError('')
    setQuiz(null)
    setQuizResult(null)
    setTab('generate')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SectionTitle
        eyebrow="AI Assessment Engine"
        title="Generate MCQs & quizzes"
        desc="Upload learning material or paste text — AI generates objective questions with answers and explanations."
      />

      {/* tabs */}
      <div className="flex gap-2">
        <TabBtn active={tab === 'generate'} onClick={() => setTab('generate')} icon={Plus}>Generate</TabBtn>
        <TabBtn active={tab === 'history'} onClick={() => { setTab('history'); loadHistory() }} icon={History}>My quizzes</TabBtn>
        {quiz && tab === 'take' && <TabBtn active onClick={() => setTab('take')} icon={FileText}>{quiz.title.slice(0, 20)}…</TabBtn>}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'generate' && (
          <motion.div key="gen" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-7 space-y-6">
            {/* upload */}
            <div>
              <div className="text-sm font-medium text-slate-200 mb-3">Source material</div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); upload({ target: { files: e.dataTransfer.files } }) }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  fileName ? 'border-emerald-400/40 bg-emerald-400/[0.04]' : 'border-white/15 hover:border-indigo-400/40 hover:bg-indigo-400/[0.03]'
                }`}
              >
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.docx,.txt,.md,.csv" onChange={upload} />
                {fileName ? (
                  <div className="flex items-center justify-center gap-3 text-emerald-300">
                    <FileText size={22} />
                    <div className="text-left">
                      <div className="font-medium">{fileName}</div>
                      <div className="text-xs text-slate-400">{charCount.toLocaleString()} characters extracted</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setUploadId(null); setFileName(''); setCharCount(0) }} className="ml-2 text-slate-400 hover:text-rose-300">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="text-slate-400">
                    <UploadCloud size={28} className="mx-auto mb-2 text-slate-500" />
                    <div className="font-medium text-slate-300">Drop a file here or click to browse</div>
                    <div className="text-xs mt-1.5 text-slate-500">PDF · DOCX · TXT · MD · CSV (up to 25 MB)</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex-1 h-px bg-white/10" /> or paste text <div className="flex-1 h-px bg-white/10" />
            </div>

            <textarea
              className="input min-h-32 resize-y"
              placeholder="Paste notes, slides text, or a transcript here…"
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
            />

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Quiz title (optional)</label>
                <input className="input" placeholder="e.g. Sampling Fundamentals" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Number of questions</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={3} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} className="flex-1" />
                  <span className="text-sm text-white w-8 text-right font-medium">{count}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Topic focus (optional)</label>
                <input className="input" placeholder="e.g. National Accounts" value={topic} onChange={(e) => setTopic(e.target.value)} />
              </div>
            </div>

            {error && <div className="text-sm text-rose-300 bg-rose-400/10 border border-rose-400/20 rounded-xl px-4 py-3">{error}</div>}

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Cpu size={14} />
                Uses AI (LLM) when a key is configured, with a smart offline engine as fallback.
              </div>
              <button onClick={generate} disabled={generating} className="btn-primary px-6 py-3">
                {generating ? <Spinner /> : <><WandSparkles size={16} /> Generate quiz</>}
              </button>
            </div>
          </motion.div>
        )}

        {tab === 'history' && (
          <motion.div key="hist" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {history.length === 0 ? (
              <EmptyState icon={FileText} title="No quizzes yet" desc="Generate your first quiz from your learning materials." action={<button onClick={() => setTab('generate')} className="btn-primary px-5 py-2.5 mt-2 text-sm"><Plus size={15} /> New quiz</button>} />
            ) : (
              history.map((q) => (
                <div key={q.id} className="card p-4 flex items-center justify-between gap-4 hover:border-white/15 transition-colors cursor-pointer" onClick={() => { setTab('take'); openQuiz(q.id) }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl grid place-items-center bg-indigo-400/10 border border-indigo-400/25 shrink-0">
                      <FileText size={18} className="text-indigo-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-medium truncate">{q.title}</div>
                      <div className="text-xs text-slate-500">{q.sourceName || 'Pasted content'} · {q.count} questions</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="chip bg-white/[0.04] text-slate-400">{q.engine === 'llm' ? 'AI · LLM' : 'Smart engine'}</span>
                    <ChevronRight size={16} className="text-slate-500" />
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {tab === 'take' && quiz && (
          <motion.div key="take" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {!quizResult ? (
              <>
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Question {quizIdx + 1} of {quiz.questions.length}</span>
                  <span className="chip bg-white/[0.04]">{quiz.title}</span>
                </div>
                <div className="bar-track">
                  <motion.div className="bar-fill" animate={{ width: `${((quizIdx + 1) / quiz.questions.length) * 100}%` }} style={{ background: 'linear-gradient(90deg,#a78bfa,#22d3ee)' }} />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={quizIdx} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="card p-8">
                    <h3 className="font-display font-600 text-xl text-white leading-snug">{quiz.questions[quizIdx].question}</h3>
                    <div className="mt-6 space-y-3">
                      {quiz.questions[quizIdx].options.map((opt, oi) => {
                        const chosen = quizAnswers[quiz.questions[quizIdx].question] === oi
                        return (
                          <button key={oi} onClick={() => choose(quiz.questions[quizIdx].question, oi)} className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 ${chosen ? 'border-violet-400/50 bg-violet-400/10' : 'border-white/10 bg-white/[0.02] hover:border-white/25'}`}>
                            <span className={`w-7 h-7 rounded-lg grid place-items-center text-sm font-bold shrink-0 ${chosen ? 'bg-violet-400 text-white' : 'bg-white/[0.06] text-slate-400'}`}>{String.fromCharCode(65 + oi)}</span>
                            <span className="text-slate-200">{opt}</span>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-between">
                  <button onClick={() => setQuizIdx((i) => Math.max(0, i - 1))} disabled={quizIdx === 0} className="btn-ghost px-4 py-2.5"><ChevronLeft size={16} /> Back</button>
                  {quizIdx < quiz.questions.length - 1 ? (
                    <button onClick={() => setQuizIdx((i) => i + 1)} className="btn-primary px-5 py-2.5">Next <ChevronRight size={16} /></button>
                  ) : (
                    <button onClick={submitQuiz} className="btn-primary px-6 py-2.5"><Check size={16} /> Submit quiz</button>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="card p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <ProgressRing value={quizResult.score} size={140} stroke={12} color={quizResult.score >= 70 ? '#34d399' : quizResult.score >= 40 ? '#fbbf24' : '#fb7185'} label="score" />
                  </div>
                  <h2 className="font-display font-700 text-2xl text-white">
                    {quizResult.score >= 70 ? 'Great retention! 🎯' : 'Good attempt — review the explanations ✨'}
                  </h2>
                  <p className="text-slate-400 mt-2">{quizResult.correct} of {quizResult.total} correct</p>
                  <div className="flex justify-center gap-3 mt-6">
                    <button onClick={() => { setQuizResult(null); setQuizIdx(0); setQuizAnswers({}) }} className="btn-ghost px-5 py-2.5"><RotateCcw size={15} /> Retake</button>
                    <button onClick={reset} className="btn-primary px-5 py-2.5"><Plus size={15} /> New quiz</button>
                  </div>
                </div>

                <h3 className="font-display font-600 text-lg text-white flex items-center gap-2"><Lightbulb size={18} className="text-amber-300" /> Explanations</h3>
                <div className="space-y-3">
                  {quizResult.results.map((r, i) => (
                    <div key={i} className={`card p-5 border-l-2 ${r.correct ? 'border-l-emerald-400/60' : 'border-l-rose-400/60'}`}>
                      <div className="flex items-start gap-3">
                        <span className={`w-6 h-6 rounded-full grid place-items-center shrink-0 mt-0.5 ${r.correct ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'}`}>
                          {r.correct ? <Check size={14} /> : <X size={14} />}
                        </span>
                        <div className="flex-1">
                          <div className="text-white font-medium">{r.question}</div>
                          {!r.correct && <div className="text-sm mt-2 text-rose-300">Your answer: {r.options[r.chosen] ?? '—'}</div>}
                          <div className="text-sm mt-1 text-emerald-300">Correct: {r.options[r.answer]}</div>
                          {r.explanation && <div className="text-sm text-slate-400 mt-2 leading-relaxed">{r.explanation}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TabBtn({ active, onClick, icon: Icon, children }) {
  return (
    <button onClick={onClick} className={`chip border px-4 py-2 transition-all ${active ? 'bg-indigo-400/15 border-indigo-400/40 text-indigo-100' : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/25'}`}>
      <Icon size={14} /> {children}
    </button>
  )
}
