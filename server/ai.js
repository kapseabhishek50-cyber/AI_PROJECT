import dotenv from 'dotenv'
dotenv.config()

const DEFAULT_BASE_URL = 'https://api.openai.com/v1'

export function aiConfig(store) {
  const s = store.data.settings || {}
  return {
    apiKey: s.aiApiKey || process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '',
    baseUrl: s.aiBaseUrl || process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL,
    model: s.aiModel || process.env.OPENAI_MODEL || 'gpt-4o-mini',
    enabled: true,
  }
}

export function isAiConfigured(store) {
  return Boolean(aiConfig(store).apiKey)
}

async function chatCompletion(store, messages, { json = false, temperature = 0.4 } = {}) {
  const cfg = aiConfig(store)
  if (!cfg.apiKey) throw new Error('no-api-key')
  const url = cfg.baseUrl.replace(/\/+$/, '') + '/chat/completions'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`AI API error ${res.status}: ${body.slice(0, 300)}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

function parseJsonLoose(str) {
  const cleaned = str.replace(/```json|```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1))
    } catch {
      /* fall through */
    }
  }
  try {
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

// ---------------- Heuristic (offline) MCQ generator ----------------

const STOP = new Set(['the', 'a', 'an', 'of', 'to', 'in', 'on', 'for', 'and', 'or', 'is', 'are', 'was', 'were', 'be', 'been', 'as', 'at', 'by', 'with', 'from', 'that', 'this', 'these', 'those', 'it', 'its', 'their', 'they', 'we', 'you', 'he', 'she', 'has', 'have', 'had', 'not', 'but', 'if', 'then', 'than', 'so', 'such', 'into', 'also', 'can', 'may', 'will', 'would', 'could', 'should', 'which', 'who', 'whom', 'whose', 'what', 'when', 'where', 'why', 'how', 'there', 'here', 'each', 'all', 'some', 'any', 'more', 'most', 'other', 'per', 'between', 'during', 'about', 'over', 'under', 'above', 'below', 'among', 'used', 'uses', 'using', 'use', 'based', 'including', 'includes', 'include', 'such', 'data', 'number', 'numbers', 'one', 'two', 'three', 'first', 'second'])

// Curated domain glossary — gives the offline engine a strong, relevant vocabulary.
const GLOSSARY = [
  // statistical
  'Survey Design', 'Sampling', 'Simple Random Sampling', 'Stratified Sampling', 'Cluster Sampling', 'Systematic Sampling', 'Multistage Sampling', 'Sampling Frame', 'Sampling Error', 'Non-Sampling Error', 'Estimation', 'Estimator', 'Variance', 'Standard Error', 'Confidence Interval', 'Questionnaire', 'Census', 'Enumeration', 'National Accounts', 'Gross Domestic Product', 'GDP', 'Gross Value Added', 'GVA', 'Consumer Price Index', 'CPI', 'Wholesale Price Index', 'WPI', 'Inflation', 'Base Year', 'Labour Force', 'Employment', 'Unemployment', 'Labour Force Participation Rate', 'Periodic Labour Force Survey', 'PLFS', 'Agricultural Statistics', 'Crop Cutting Experiment', 'Yield', 'Industrial Statistics', 'Annual Survey of Industries', 'SDG', 'Sustainable Development Goals', 'Indicator', 'Metadata', 'SDMX', 'Data Quality', 'Timeliness', 'Accuracy', 'Coherence', 'Imputation', 'Weighting', 'Seasonal Adjustment', 'Official Statistics', 'Index Number', 'Price Statistics', 'National Statistical Office', 'NSO', 'MoSPI',
  // technical
  'Python', 'NumPy', 'pandas', 'R', 'SQL', 'Stata', 'SPSS', 'SAS', 'Machine Learning', 'Artificial Intelligence', 'Neural Network', 'Deep Learning', 'Regression', 'Classification', 'Clustering', 'Supervised Learning', 'Unsupervised Learning', 'Data Visualization', 'Dashboard', 'Histogram', 'Scatter Plot', 'GIS', 'Geospatial', 'Cloud Computing', 'Big Data', 'Hadoop', 'API', 'REST', 'Open Data', 'Database', 'Data Warehouse', 'ETL', 'Algorithm', 'Model', 'Overfitting', 'Data Science', 'Statistics', 'Statistical Computing',
  // governance
  'Cybersecurity', 'Data Privacy', 'Encryption', 'Digital Signature', 'Digital Public Infrastructure', 'Aadhaar', 'UPI', 'DigiLocker', 'Government Cloud', 'Information Technology Act', 'DPDP Act', 'Authentication', 'Phishing', 'Malware', 'Firewall',
  // behavioural
  'Leadership', 'Communication', 'Project Management', 'Ethics', 'Decision Making', 'Change Management', 'Stakeholder', 'Governance',
]

function sentences(text) {
  return text
    .replace(/\r/g, ' ')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40 && s.length < 500)
}

function candidateTerms(text) {
  const lower = text.toLowerCase()
  const seen = new Map()
  const add = (term) => {
    term = (term || '').trim()
    if (term.length < 2 || term.length > 40) return
    const l = term.toLowerCase()
    if (STOP.has(l)) return
    if (/^[a-z]+$/.test(term) && term.length < 4) return
    seen.set(l, term)
  }

  // 1. glossary terms present in text (prioritise longest match first for quality)
  const glossaryMatches = GLOSSARY.filter((g) => lower.includes(g.toLowerCase()))
  glossaryMatches.sort((a, b) => b.length - a.length)
  for (const g of glossaryMatches) add(g)

  // 2. title-case multi-word phrases
  const phraseRe = /\b(?:[A-Z][a-zA-Z0-9]*(?:[-'][a-zA-Z0-9]+)?\s*){1,4}\b/g
  let m
  while ((m = phraseRe.exec(text)) !== null) {
    const term = m[0].trim()
    const words = term.split(/\s+/)
    if (words.length < 2) continue
    // require the phrase to actually be title-cased (every significant word capitalised)
    if (words.every((w) => /^[A-Z]/.test(w))) add(term)
  }

  // 3. all-caps acronyms
  const acroRe = /\b[A-Z]{2,6}\b/g
  while ((m = acroRe.exec(text)) !== null) add(m[0])

  // 4. CamelCase / snake / kebab technical terms
  const techRe = /\b[A-Z][a-z]+[A-Z][a-zA-Z0-9]*\b|\b[a-z][a-z0-9]*(?:[-_][a-z0-9]+)+\b/g
  while ((m = techRe.exec(text)) !== null) add(m[0])

  return [...seen.values()]
}

function pickAnswerTerm(sentence, terms) {
  const lower = sentence.toLowerCase()
  const present = terms
    .filter((t) => lower.includes(t.toLowerCase()))
    // prefer multi-word or acronym terms (more informative for a cloze), but not a full clause
    .filter((t) => t.split(/\s+/).length <= 4)
  if (!present.length) return null
  present.sort((a, b) => scoreTerm(b) - scoreTerm(a))
  return present[0]
}

function scoreTerm(term) {
  const words = term.split(/\s+/).length
  let s = 0
  if (words >= 2 && words <= 3) s += 3
  if (/^[A-Z]{2,6}$/.test(term)) s += 2.5
  if (term.length >= 6) s += 1
  return s
}

function distractors(answer, terms, n = 3) {
  const pool = terms.filter((t) => t.toLowerCase() !== answer.toLowerCase())
  const scored = pool.map((t) => {
    let score = Math.random()
    if (t.length >= answer.length - 4 && t.length <= answer.length + 8) score += 0.6
    if (/^[A-Z]/.test(t) === /^[A-Z]/.test(answer)) score += 0.4
    const aw = answer.split(/\s+/).length
    const tw = t.split(/\s+/).length
    if (Math.abs(aw - tw) <= 1) score += 0.3
    return { t, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, n).map((x) => x.t)
}

export function heuristicMCQs(text, count = 8) {
  const sents = sentences(text)
  const terms = candidateTerms(text)
  const out = []
  const used = new Set()

  for (const s of sents) {
    if (out.length >= count) break
    const answer = pickAnswerTerm(s, terms)
    if (!answer) continue
    const blanked = s.replace(new RegExp(escapeRegExp(answer), 'i'), '____')
    if (blanked === s) continue
    if (used.has(answer.toLowerCase())) continue
    const dist = distractors(answer, terms)
    if (dist.length < 3) continue
    used.add(answer.toLowerCase())

    // shuffle options
    const options = [answer, ...dist].sort(() => Math.random() - 0.5)
    const answerIdx = options.indexOf(answer)

    out.push({
      question: `Fill in the blank: "${blanked}"`,
      options,
      answer: answerIdx,
      explanation: `The term "${answer}" completes the statement based on the source material.`,
      difficulty: 2,
      source: 'heuristic',
    })
  }

  // If not enough cloze questions, add definition-style ones
  if (out.length < Math.min(count, 4)) {
    for (const t of terms) {
      if (out.length >= count) break
      const s = sents.find((x) => x.toLowerCase().includes(t.toLowerCase()))
      if (!s) continue
      const dist = distractors(t, terms)
      if (dist.length < 3) continue
      const options = [t, ...dist].sort(() => Math.random() - 0.5)
      out.push({
        question: `Which concept best matches this description from the material? "${s}"`,
        options,
        answer: options.indexOf(t),
        explanation: `"${t}" is the concept described by the source text.`,
        difficulty: 2,
        source: 'heuristic',
      })
    }
  }

  return out
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ---------------- AI-powered generation ----------------

export async function generateMCQs(store, text, { count = 8, difficulty = 'mixed', topic = '', domain = '' } = {}) {
  const trimmed = text.replace(/\s+/g, ' ').trim()
  if (trimmed.length < 200) {
    return { questions: heuristicMCQs(trimmed, count), engine: 'heuristic' }
  }
  const context = trimmed.slice(0, 14000)

  if (isAiConfigured(store)) {
    try {
      const prompt = `You are an assessment author for India's Official Statistical System. Generate ${count} high-quality multiple-choice questions (MCQs) from the provided learning material.

Requirements:
- Each question must test comprehension of the material.
- 4 answer options; exactly one correct.
- Provide a concise explanation for the correct answer.
- Assign a difficulty of 1 (easy), 2 (medium) or 3 (hard).
- Tag each with the most relevant competency from: Survey Design, Sampling, National Accounts, Price Statistics, Labour Statistics, Agricultural Statistics, Industrial Statistics, SDG Indicators, Metadata, Data Quality, Python, R, SQL, GIS, Data Visualization, AI/ML, Cloud, APIs, Open Data, Cybersecurity, Data Privacy, Digital Governance, Leadership, Communication, Project Management, Ethics, Decision Making, Change Management${topic ? `, or "${topic}"` : ''}.

Respond ONLY with JSON in this exact shape:
{"questions":[{"question":"...","options":["a","b","c","d"],"answer":0,"explanation":"...","difficulty":2,"competency":"Sampling"}]}

Material:
"""${context}"""`

      const raw = await chatCompletion(store, [
        { role: 'system', content: 'You generate precise, accurate assessment questions. Reply with valid JSON only.' },
        { role: 'user', content: prompt },
      ], { json: true, temperature: 0.4 })

      const parsed = parseJsonLoose(raw)
      const qs = parsed?.questions
      if (Array.isArray(qs) && qs.length) {
        const clean = qs
          .filter((q) => q.question && Array.isArray(q.options) && q.options.length >= 2)
          .map((q) => ({
            question: q.question,
            options: q.options.slice(0, 6),
            answer: clamp(Number(q.answer) || 0, 0, (q.options.length || 2) - 1),
            explanation: q.explanation || '',
            difficulty: clamp(Number(q.difficulty) || 2, 1, 3),
            competency: q.competency || '',
            source: 'llm',
          }))
        if (clean.length) return { questions: clean, engine: 'llm' }
      }
    } catch (e) {
      if (e.message === 'no-api-key') {
        // fall through to heuristic
      } else {
        console.error('AI generation failed, using heuristic fallback:', e.message)
      }
    }
  }

  return { questions: heuristicMCQs(trimmed, count), engine: 'heuristic' }
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}

// ---------------- AI-assisted competency assessment ----------------

export async function assessWithAI(store, profile, selfRatings) {
  if (!isAiConfigured(store)) return null
  try {
    const prompt = `Given an official's profile and self-rated competencies (1-5), produce an adjusted competency profile. The official works in India's Official Statistical System.

Profile:
${JSON.stringify(profile, null, 2)}

Self-ratings (competency -> level 1-5):
${JSON.stringify(selfRatings, null, 2)}

Adjust each rating realistically based on experience, education and role (e.g. more experience may warrant slightly higher technical/statistical scores; a technical role may justify higher technical scores). Return JSON only:
{"adjusted":{"competencyId":level, ...},"summary":"2-3 sentence summary of strengths and gaps"}`

    const raw = await chatCompletion(store, [
      { role: 'user', content: prompt },
    ], { json: true, temperature: 0.3 })
    const parsed = parseJsonLoose(raw)
    if (parsed?.adjusted) return parsed
  } catch (e) {
    console.error('AI assessment failed:', e.message)
  }
  return null
}
