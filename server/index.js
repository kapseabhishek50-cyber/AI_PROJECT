import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { Store } from './db.js'
import { seedStore } from './seed.js'
import { extractText } from './extract.js'
import { generateMCQs, assessWithAI, isAiConfigured, aiConfig } from './ai.js'
import {
  hashPassword,
  verifyPassword,
  createSession,
  userFromRequest,
  requireAuth,
  publicUser,
} from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 4000
const UPLOAD_DIR = path.join(__dirname, 'data', 'uploads')

fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const store = new Store()
seedStore(store)

// Ensure a demo employee + admin exist
ensureDemoUsers()

function ensureDemoUsers() {
  if (store.get('users').length === 0) {
    const admin = {
      id: 1,
      name: 'Administrator',
      email: 'admin@mospi.gov.in',
      password: hashPassword('admin123'),
      role: 'admin',
      designation: 'Deputy Director General',
      department: 'Data Informatics & Innovation Division (DIID)',
      createdAt: Date.now(),
      onboarded: true,
      profile: {
        role: 'ddg',
        experience: 18,
        education: "Master's in Statistics",
        qualifications: ['Statistics', 'Leadership'],
        interests: ['ai-ml', 'data-quality'],
        previousTrainings: [],
        languages: ['English', 'Hindi'],
      },
      competencies: {
        'survey-design': 4, sampling: 4, 'national-accounts': 4, 'price-statistics': 4,
        'labour-statistics': 3, 'agricultural-statistics': 3, 'industrial-statistics': 3,
        'sdg-indicators': 4, metadata: 3, 'data-quality': 4,
        python: 2, r: 2, sql: 2, stata: 2, spss: 1, sas: 1, gis: 2, 'data-viz': 3,
        'ai-ml': 2, cloud: 2, apis: 2, 'open-data': 3,
        cybersecurity: 3, 'data-privacy': 3, 'digital-signatures': 3, 'gov-cloud': 3, dpi: 3,
        leadership: 5, communication: 5, 'project-mgmt': 4, ethics: 5, 'decision-making': 5, 'change-mgmt': 4,
      },
      enrollments: [],
      completions: [],
    }
    const officer = {
      id: 2,
      name: 'Priya Sharma',
      email: 'officer@mospi.gov.in',
      password: hashPassword('demo123'),
      role: 'employee',
      designation: 'Statistical Officer',
      department: 'National Statistical Office',
      createdAt: Date.now(),
      onboarded: true,
      profile: {
        role: 'statistical-officer',
        experience: 6,
        education: "Master's in Statistics",
        qualifications: ['Statistics', 'Data Analysis'],
        interests: ['python', 'data-viz', 'ai-ml'],
        previousTrainings: ['Fundamentals of Survey Design & Instrumentation'],
        languages: ['English', 'Hindi'],
      },
      competencies: {
        'survey-design': 4, sampling: 3, 'national-accounts': 2, 'price-statistics': 2,
        'labour-statistics': 2, 'agricultural-statistics': 1, 'industrial-statistics': 1,
        'sdg-indicators': 2, metadata: 1, 'data-quality': 2,
        python: 2, r: 2, sql: 1, stata: 1, spss: 1, sas: 0, gis: 1, 'data-viz': 2,
        'ai-ml': 1, cloud: 1, apis: 1, 'open-data': 2,
        cybersecurity: 2, 'data-privacy': 2, 'digital-signatures': 2, 'gov-cloud': 1, dpi: 2,
        leadership: 3, communication: 3, 'project-mgmt': 2, ethics: 4, 'decision-making': 3, 'change-mgmt': 2,
      },
      enrollments: [],
      completions: [],
    }
    store.data.users.push(admin, officer)
    store.persist()
  }
}

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '5mb' }))

// -------- helpers --------

function framework() {
  return store.data.framework
}

function competency(id) {
  return framework().competencies.find((c) => c.id === id)
}

function buildCompetencies(profile) {
  const roleId = profile?.role || 'statistical-officer'
  const targets = framework().targets[roleId] || {}
  return framework().competencies.map((c) => ({
    ...c,
    target: targets[c.id] ?? 3,
  }))
}

function getCurrent(user) {
  const comps = buildCompetencies(user.profile)
  const out = {}
  for (const c of comps) out[c.id] = user.competencies?.[c.id] ?? 0
  return out
}

function computeGaps(user) {
  const comps = buildCompetencies(user.profile)
  const current = getCurrent(user)
  const gaps = comps
    .map((c) => {
      const target = c.target
      const level = current[c.id] ?? 0
      const gap = Math.max(0, target - level)
      return { ...c, level, gap, pct: target > 0 ? Math.round((level / target) * 100) : 0 }
    })
    .sort((a, b) => b.gap - a.gap)
  return { gaps, current }
}

function recommendCourses(user, limit = 6) {
  const { gaps } = computeGaps(user)
  const courses = store.get('courses')
  const enrolled = new Set(user.enrollments || [])
  const completed = new Set(user.completions || [])
  const scored = []

  for (const course of courses) {
    const comps = course.competencies || []
    // relevance = sum of gaps of competencies the course covers
    const relevance = comps.reduce((acc, cid) => {
      const g = gaps.find((x) => x.id === cid)
      return acc + (g ? g.gap : 0)
    }, 0)
    let score = relevance
    if (enrolled.has(course.id)) score += 3
    if (completed.has(course.id)) score -= 10
    // boost courses matching interests
    const interests = user.profile?.interests || []
    if (comps.some((c) => interests.includes(c))) score += 2
    scored.push({ course, score, relevance })
  }

  scored.sort((a, b) => b.score - a.score)
  const recs = scored.filter((s) => s.relevance > 0 || s.score > 0).slice(0, limit)

  return recs.map(({ course, relevance }) => {
    const comps = (course.competencies || []).map((cid) => competency(cid)?.name).filter(Boolean)
    return {
      ...course,
      relevance,
      match: Math.min(100, Math.round(40 + relevance * 18)),
      competencies: comps,
      enrolled: enrolled.has(course.id),
      completed: completed.has(course.id),
    }
  })
}

function overview(user) {
  const { gaps, current } = computeGaps(user)
  const comps = buildCompetencies(user.profile)
  const totalTarget = comps.reduce((a, c) => a + c.target, 0)
  const totalCurrent = comps.reduce((a, c) => a + (current[c.id] || 0), 0)
  const overall = Math.round((totalCurrent / Math.max(1, totalTarget)) * 100)
  const byDomain = {}
  for (const d of framework().domains) {
    const ids = d.competencies.map((c) => c.id)
    const target = ids.reduce((a, id) => a + (currentTargetFor(user, id) || 0), 0)
    const cur = ids.reduce((a, id) => a + (current[id] || 0), 0)
    byDomain[d.id] = {
      id: d.id,
      name: d.name,
      color: d.color,
      pct: target ? Math.round((cur / target) * 100) : 0,
    }
  }
  const recommendations = recommendCourses(user, 6)
  const topGaps = gaps.filter((g) => g.gap > 0).slice(0, 5)
  const learningHours = (user.completions || []).reduce(
    (acc, id) => acc + (store.find('courses', id)?.hours || 0),
    0
  )
  return {
    overall,
    byDomain: Object.values(byDomain),
    topGaps,
    recommendations,
    learningHours,
    competencies: gaps,
    totalTarget,
    totalCurrent,
  }
}

function currentTargetFor(user, id) {
  const comps = buildCompetencies(user.profile)
  return comps.find((c) => c.id === id)?.target || 3
}

// -------- public / bootstrap --------

app.get('/api/health', (req, res) => res.json({ ok: true, time: Date.now() }))

app.get('/api/bootstrap', (req, res) => {
  res.json({
    domains: framework().domains.map((d) => ({
      id: d.id,
      name: d.name,
      icon: d.icon,
      color: d.color,
      blurb: d.blurb,
      competencies: d.competencies.map((c) => c.id),
    })),
    competencies: framework().competencies,
    roles: framework().roles,
    courses: store.get('courses'),
  })
})

// -------- auth --------

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role = 'employee', designation = '', department = '' } = req.body || {}
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
  if (store.get('users').some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'An account with this email already exists' })
  }
  const user = store.insert('users', {
    id: store.nextId('users'),
    name,
    email: email.toLowerCase(),
    password: hashPassword(password),
    role,
    designation,
    department,
    onboarded: false,
    profile: {},
    competencies: {},
    enrollments: [],
    completions: [],
    createdAt: Date.now(),
  })
  const token = createSession(store, user)
  res.json({ token, user: publicUser(user) })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}
  const user = store.get('users').find((u) => u.email.toLowerCase() === (email || '').toLowerCase())
  if (!user || !verifyPassword(password || '', user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  const token = createSession(store, user)
  res.json({ token, user: publicUser(user) })
})

app.post('/api/auth/logout', (req, res) => {
  const user = userFromRequest(store, req)
  if (user) store.data.sessions = store.get('sessions').filter((s) => s.userId !== user.id)
  store.persist()
  res.json({ ok: true })
})

app.get('/api/auth/me', (req, res) => {
  const user = userFromRequest(store, req)
  res.json({ user: publicUser(user) })
})

// -------- onboarding / profile --------

app.post('/api/onboard', (req, res) => {
  const user = requireAuth(store, req, res)
  if (!user) return
  const { profile } = req.body || {}
  if (!profile?.role) return res.status(400).json({ error: 'Role is required' })
  user.profile = {
    role: profile.role,
    experience: Number(profile.experience) || 0,
    education: profile.education || '',
    qualifications: profile.qualifications || [],
    interests: profile.interests || [],
    previousTrainings: profile.previousTrainings || [],
    languages: profile.languages || [],
  }
  // initialise competencies from experience + a base
  const base = Math.max(1, Math.min(4, Math.round((Number(profile.experience) || 0) / 3)))
  const comps = buildCompetencies(user.profile)
  for (const c of comps) {
    if (user.competencies?.[c.id] == null) user.competencies[c.id] = base
  }
  user.onboarded = true
  store.persist()
  res.json({ user: publicUser(user), overview: overview(user) })
})

app.get('/api/me/overview', (req, res) => {
  const user = requireAuth(store, req, res)
  if (!user) return
  if (!user.onboarded) return res.json({ onboarded: false })
  res.json({ onboarded: true, ...overview(user) })
})

app.post('/api/me/profile', (req, res) => {
  const user = requireAuth(store, req, res)
  if (!user) return
  const { profile } = req.body || {}
  if (profile) user.profile = { ...user.profile, ...profile }
  store.persist()
  res.json({ user: publicUser(user), overview: overview(user) })
})

// -------- competency assessment --------

app.get('/api/assessment/questions', (req, res) => {
  const user = requireAuth(store, req, res)
  if (!user) return
  const { gaps } = computeGaps(user)
  const focusIds = gaps.slice(0, 10).map((g) => g.id)
  const bank = store.get('questions')
  const byComp = {}
  for (const q of bank) (byComp[q.competency] ||= []).push(q)

  // 1 question for each of the top gaps, up to ~12 total
  const picked = []
  for (const id of focusIds) {
    const pool = (byComp[id] || []).filter((q) => !picked.some((p) => p.id === q.id))
    if (pool.length && picked.length < 12) {
      const q = pool[Math.floor(Math.random() * pool.length)]
      picked.push(q)
    }
  }
  res.json({ questions: picked.map((q) => ({ ...q, exp: undefined })) })
})

app.post('/api/assessment/evaluate', (req, res) => {
  const user = requireAuth(store, req, res)
  if (!user) return
  const { answers } = req.body || {} // [{questionId, answer}]
  if (!Array.isArray(answers)) return res.status(400).json({ error: 'answers required' })
  const bank = store.get('questions')
  const byComp = {}
  const results = []

  for (const a of answers) {
    const q = bank.find((x) => x.id === a.questionId)
    if (!q) continue
    const correct = Number(a.answer) === q.answer
    results.push({
      questionId: q.id,
      question: q.question,
      correct,
      chosen: a.answer,
      answer: q.answer,
      explanation: q.exp,
      competency: q.competency,
    })
    byComp[q.competency] ||= { right: 0, total: 0 }
    byComp[q.competency].total += 1
    if (correct) byComp[q.competency].right += 1
  }

  // update competency scores: blend current with new evidence
  for (const [cid, stat] of Object.entries(byComp)) {
    const pct = stat.right / stat.total
    const current = user.competencies[cid] ?? 0
    const target = currentTargetFor(user, cid)
    const evidence = Math.round(pct * target)
    user.competencies[cid] = Math.max(current, Math.round((current + evidence) / 2))
  }

  const score = results.length ? Math.round((results.filter((r) => r.correct).length / results.length) * 100) : 0
  store.persist()
  res.json({ score, correct: results.filter((r) => r.correct).length, total: results.length, results, overview: overview(user) })
})

app.post('/api/self-assessment', async (req, res) => {
  const user = requireAuth(store, req, res)
  if (!user) return
  const { ratings } = req.body || {} // {competencyId: 1-5}
  if (!ratings || typeof ratings !== 'object') return res.status(400).json({ error: 'ratings required' })
  for (const [cid, val] of Object.entries(ratings)) {
    user.competencies[cid] = Math.max(0, Math.min(5, Math.round(Number(val) || 0)))
  }
  // optional AI refinement
  let aiNote = null
  const ai = await assessWithAI(store, user.profile, ratings)
  if (ai?.adjusted) {
    for (const [cid, val] of Object.entries(ai.adjusted)) {
      const n = Math.round(Number(val))
      if (!Number.isNaN(n) && n >= 0 && n <= 5) user.competencies[cid] = n
    }
    aiNote = ai.summary
  }
  store.persist()
  res.json({ overview: overview(user), aiNote })
})

// -------- courses --------

app.get('/api/courses', (req, res) => {
  res.json(store.get('courses'))
})

app.post('/api/courses/enroll', (req, res) => {
  const user = requireAuth(store, req, res)
  if (!user) return
  const { courseId } = req.body || {}
  const course = store.find('courses', courseId)
  if (!course) return res.status(404).json({ error: 'Course not found' })
  const list = user.enrollments || []
  const idx = list.indexOf(course.id)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(course.id)
  user.enrollments = list
  store.persist()
  res.json({ enrollments: list })
})

app.post('/api/courses/complete', (req, res) => {
  const user = requireAuth(store, req, res)
  if (!user) return
  const { courseId } = req.body || {}
  const course = store.find('courses', courseId)
  if (!course) return res.status(404).json({ error: 'Course not found' })
  if (!(user.completions || []).includes(course.id)) {
    user.completions = [...(user.completions || []), course.id]
    // bump competency scores for covered competencies
    for (const cid of course.competencies || []) {
      const target = currentTargetFor(user, cid)
      user.competencies[cid] = Math.min(target, (user.competencies[cid] || 0) + 1)
    }
  }
  store.persist()
  res.json({ completions: user.completions, overview: overview(user) })
})

// -------- assistant --------

app.get('/api/assistant', (req, res) => {
  const user = requireAuth(store, req, res)
  if (!user) return
  const q = ((req.query.q || '') + '').toLowerCase().trim()
  if (!q) return res.json({ answer: 'Ask me anything about your learning pathway, competencies, or available courses.' })

  const answers = []
  const matchedCourses = []

  // competency match
  const allComp = framework().competencies
  const hit = allComp.find((c) => {
    const name = c.name.toLowerCase()
    if (name.length <= 2) {
      // short names (e.g. "R") require a word-boundary match
      return new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(q)
    }
    return q.includes(name) || name.split(/[\s&/]+/).some((w) => w.length > 3 && q.includes(w))
  })
  if (hit) {
    const level = user.competencies[hit.id] ?? 0
    const target = currentTargetFor(user, hit.id)
    answers.push(`Your current level in ${hit.name} is ${level}/5 against a target of ${target}/5. ${level >= target ? 'You have met the target — consider advanced practice.' : `Recommended next step: ${target - level} level(s) of improvement.`}`)
    matchedCourses.push(...store.get('courses').filter((c) => (c.competencies || []).includes(hit.id)).slice(0, 3))
  }

  if (/gap|weak|improve|improve|deficient|skill/.test(q)) {
    const { gaps } = computeGaps(user)
    const open = gaps.filter((g) => g.gap > 0)
    if (open.length) {
      answers.push(`Your top skill gaps are: ${open.slice(0, 3).map((g) => `${g.name} (${g.level}/${g.target})`).join(', ')}.`)
      matchedCourses.push(...recommendCourses(user, 3))
    } else {
      answers.push('You have no significant skill gaps right now — excellent work.')
    }
  }

  if (/course|learn|training|recommend|what should i|study/.test(q)) {
    const recs = recommendCourses(user, 3)
    if (!matchedCourses.length) matchedCourses.push(...recs)
    answers.push('Here are personalised course recommendations based on your profile.')
  }

  if (/progress|score|level|overall|dashboard/.test(q)) {
    const ov = overview(user)
    answers.push(`Your overall competency score is ${ov.overall}% with ${ov.learningHours} learning hours completed.`)
  }

  if (/domain|statistic|technical|governance|behaviour|managerial/.test(q)) {
    const ov = overview(user)
    const d = ov.byDomain.find((x) => q.includes(x.name.split(' ')[0].toLowerCase()))
    if (d) answers.push(`${d.name}: ${d.pct}% of target competency achieved.`)
  }

  if (!answers.length) {
    answers.push('I can help you understand your skill gaps, suggest courses, or explain your progress. Try asking about "sampling", "my skill gaps", or "recommended courses".')
  }

  res.json({
    answer: answers.join(' '),
    courses: matchedCourses.map((c) => ({ id: c.id, title: c.title, provider: c.provider, hours: c.hours })),
  })
})

// -------- upload + generation --------

const upload = multer({ dest: UPLOAD_DIR, limits: { fileSize: 25 * 1024 * 1024 } })

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const user = requireAuth(store, req, res)
  if (!user) return
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  try {
    const text = await extractText(req.file.path, req.file.originalname)
    const record = store.insert('uploads', {
      id: store.nextId('uploads'),
      userId: user.id,
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      text: text.slice(0, 60000),
      charCount: text.length,
      createdAt: Date.now(),
    })
    res.json({ uploadId: record.id, name: record.name, charCount: record.charCount })
  } catch (e) {
    res.status(400).json({ error: e.message || 'Could not read the file' })
  } finally {
    try {
      fs.unlinkSync(req.file.path)
    } catch {}
  }
})

app.post('/api/generate', async (req, res) => {
  const user = requireAuth(store, req, res)
  if (!user) return
  const { uploadId, text, count = 8, difficulty = 'mixed', topic = '', title = '' } = req.body || {}
  let source = ''
  let sourceName = ''
  if (uploadId) {
    const up = store.find('uploads', uploadId)
    if (!up) return res.status(404).json({ error: 'Upload not found' })
    source = up.text
    sourceName = up.name
  } else if (text) {
    source = text
    sourceName = title || 'Pasted content'
  }
  if (!source) return res.status(400).json({ error: 'Provide a file upload or pasted text' })
  if (source.trim().length < 60) return res.status(400).json({ error: 'Content is too short to generate questions (need ~60+ characters)' })

  const result = await generateMCQs(store, source, { count: Math.min(20, Math.max(1, Number(count) || 8)), difficulty, topic })
  const quiz = store.insert('generatedQuizzes', {
    id: store.nextId('generatedQuizzes'),
    userId: user.id,
    title: title || `Quiz from ${sourceName || 'content'}`,
    sourceName,
    engine: result.engine,
    createdAt: Date.now(),
    questions: result.questions,
  })
  res.json({ quizId: quiz.id, engine: result.engine, count: result.questions.length })
})

app.get('/api/generated', (req, res) => {
  const user = requireAuth(store, req, res)
  if (!user) return
  const quizzes = store
    .get('generatedQuizzes')
    .filter((q) => q.userId === user.id)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((q) => ({ id: q.id, title: q.title, sourceName: q.sourceName, engine: q.engine, createdAt: q.createdAt, count: q.questions.length }))
  res.json(quizzes)
})

app.get('/api/generated/:id', (req, res) => {
  const user = requireAuth(store, req, res)
  if (!user) return
  const quiz = store.find('generatedQuizzes', req.params.id)
  if (!quiz || quiz.userId !== user.id) return res.status(404).json({ error: 'Quiz not found' })
  res.json({ ...quiz, questions: quiz.questions.map((q) => ({ ...q, answer: undefined, explanation: undefined })) })
})

app.post('/api/quiz/submit', (req, res) => {
  const user = requireAuth(store, req, res)
  if (!user) return
  const { quizId, answers } = req.body || {}
  const quiz = store.find('generatedQuizzes', quizId)
  if (!quiz || quiz.userId !== user.id) return res.status(404).json({ error: 'Quiz not found' })
  const results = quiz.questions.map((q, i) => {
    const chosen = answers[i]
    return { ...q, chosen: chosen == null ? null : Number(chosen), correct: Number(chosen) === q.answer }
  })
  const score = results.length ? Math.round((results.filter((r) => r.correct).length / results.length) * 100) : 0
  store.insert('attempts', {
    id: store.nextId('attempts'),
    userId: user.id,
    quizId: quiz.id,
    title: quiz.title,
    score,
    createdAt: Date.now(),
  })
  res.json({ score, correct: results.filter((r) => r.correct).length, total: results.length, results })
})

// -------- admin --------

function adminOnly(req, res) {
  const user = requireAuth(store, req, res, ['admin'])
  return user
}

app.get('/api/admin/stats', (req, res) => {
  const user = adminOnly(req, res)
  if (!user) return
  const users = store.get('users').filter((u) => u.role === 'employee')
  const comps = framework().competencies
  const avgLevel = {}
  for (const c of comps) {
    const vals = users.map((u) => u.competencies?.[c.id] ?? 0).filter((v) => v > 0)
    avgLevel[c.id] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0
  }
  const domainDist = framework().domains.map((d) => {
    const ids = d.competencies.map((c) => c.id)
    const avg = ids.reduce((a, id) => a + (avgLevel[id] || 0), 0) / Math.max(1, ids.length)
    return { id: d.id, name: d.name, color: d.color, avg: Math.round(avg * 10) / 10 }
  })
  const roleDist = framework().roles.map((r) => ({
    id: r.id,
    name: r.name,
    count: users.filter((u) => u.profile?.role === r.id).length,
  }))
  const quizzes = store.get('generatedQuizzes').length
  const attempts = store.get('attempts')
  const avgQuizScore = attempts.length ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length) : 0
  res.json({
    totals: {
      users: users.length,
      courses: store.get('courses').length,
      quizzesGenerated: quizzes,
      assessments: attempts.length,
      avgQuizScore,
    },
    domainDist,
    roleDist,
    avgLevel,
    gapForecast: framework().domains.map((d) => {
      const ids = d.competencies.map((c) => c.id)
      const need = ids.filter((id) => avgLevel[id] > 0 && avgLevel[id] < 3).length
      return { id: d.id, name: d.name, color: d.color, emergingNeed: need }
    }),
  })
})

app.get('/api/admin/competencies', (req, res) => {
  const user = adminOnly(req, res)
  if (!user) return
  const users = store.get('users').filter((u) => u.role === 'employee')
  const rows = framework().competencies.map((c) => {
    const vals = users.map((u) => u.competencies?.[c.id] ?? 0).filter((v) => v > 0)
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
    return { id: c.id, name: c.name, domain: c.domainName, avg: Math.round(avg * 10) / 10, assessed: vals.length }
  })
  res.json(rows)
})

// -------- settings (AI keys etc.) --------

app.get('/api/settings', (req, res) => {
  const user = adminOnly(req, res)
  if (!user) return
  const s = store.data.settings || {}
  res.json({
    aiConfigured: isAiConfigured(store),
    aiProvider: s.aiProvider || 'openai',
    aiModel: s.aiModel || process.env.OPENAI_MODEL || 'gpt-4o-mini',
    aiBaseUrl: s.aiBaseUrl || '',
    hasKey: Boolean(s.aiApiKey || process.env.OPENAI_API_KEY),
  })
})

app.post('/api/settings', (req, res) => {
  const user = adminOnly(req, res)
  if (!user) return
  const { aiProvider, aiModel, aiBaseUrl, aiApiKey } = req.body || {}
  store.data.settings = {
    ...(store.data.settings || {}),
    aiProvider: aiProvider || 'openai',
    aiModel: aiModel || 'gpt-4o-mini',
    aiBaseUrl: aiBaseUrl || '',
    aiApiKey: aiApiKey || undefined,
  }
  store.persist()
  res.json({ ok: true, aiConfigured: isAiConfigured(store) })
})

// -------- serve built frontend --------
const clientDist = path.join(__dirname, '..', 'client', 'dist')
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Pragyan API server running on http://0.0.0.0:${PORT}`)
})
