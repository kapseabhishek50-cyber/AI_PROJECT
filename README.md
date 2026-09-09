# Pragyan — AI-enabled Skill Intelligence & Learning Platform

An AI-powered Learning Management System for **India's Official Statistical System** (MoSPI — Data
Informatics & Innovation Division). Pragyan assesses competencies, identifies skill gaps, and
recommends personalised learning pathways integrated with the **iGOT Karmayogi** ecosystem and
**NSSTA · TPAC** programmes — and generates MCQs/quizzes from uploaded learning materials.

Built as a full-stack web application: **React (Vite) + Tailwind + Framer Motion + Three.js** on the
frontend, **Express + Node** on the backend, with a file-based JSON store (no database setup needed).

---

## ✨ Feature highlights

| Capability | Implementation |
|---|---|
| **AI competency assessment** | Auto-builds a profile from role, experience, education & qualifications; adaptive quiz engine with instant evaluation and explanations |
| **Automated skill-gap analysis** | Maps 33 competencies across 4 domains (Statistical, Technical, Digital Governance, Behavioural) against role-specific targets |
| **iGOT Karmayogi integration** | Course catalogue mirroring iGOT modules + NSSTA · TPAC programmes, with enrolment/completion tracking and auto competency updates |
| **Personalised recommendations** | Ranked by gap severity, interests and career goals — updated dynamically as you learn |
| **AI MCQ / quiz generation** | Upload PDF/DOCX/TXT or paste text → generate MCQs with answers + explanations; LLM-powered when a key is set, smart offline engine as fallback |
| **AI virtual assistant** | Conversational guidance on gaps, progress and course suggestions |
| **Dashboards** | Learner dashboard (competency score, domain radar, top gaps, pathways) and admin console (distribution, training effectiveness, predictive emerging-skill needs) |
| **Security & scale** | Role-based access, token auth, SSO-ready architecture, scrypt password hashing, API-first design |

---

## 🚀 Quick start

```bash
npm install        # install dependencies
npm run build      # build the frontend (client/dist)
npm start          # start the server on http://localhost:4000
```

For hot-reload development (Vite dev server on :5173 proxying to the API on :4000):

```bash
npm run dev        # run alongside `node server/index.js`
```

### Demo accounts (seeded on first run)

| Role | Email | Password |
|---|---|---|
| Official / Learner | `officer@mospi.gov.in` | `demo123` |
| Administrator | `admin@mospi.gov.in` | `admin123` |

> These are seeded for evaluation only. In production they should be removed and replaced with
> SSO (e.g. Parichay / iGOT) integration.

---

## 🔑 Connecting your LLM (optional)

The platform works **fully offline** out of the box using a built-in heuristic engine. To power
higher-quality LLM-based question generation and AI-assisted assessment, add an OpenAI-compatible key.

**Option A — environment variables** (`.env`, see `.env.example`):

```bash
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1   # any OpenAI-compatible endpoint
OPENAI_MODEL=gpt-4o-mini
```

**Option B — Admin UI:** sign in as admin → *Admin Console → AI engine settings* → paste your key.
Keys are stored server-side only and never sent to the browser.

---

## 🗂️ Project structure

```
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── pages/           # Landing, Auth, Onboarding, Dashboard, Competencies,
│   │   │                    #   Pathways, Assess, Generator, Assistant, Admin
│   │   ├── components/      # AppShell, ThreeBackground, Aurora, ui, …
│   │   └── lib/             # api client, auth context
│   └── index.html
├── server/                  # Express API
│   ├── index.js             # routes & orchestration
│   ├── ai.js                # LLM + heuristic MCQ generator, AI assessment
│   ├── seed.js              # competency framework, courses, question bank
│   ├── auth.js              # scrypt hashing + session tokens
│   ├── extract.js           # PDF / DOCX / TXT text extraction
│   ├── db.js                # file-based JSON store
│   └── data/                # runtime data (gitignored)
├── tailwind.config.js
└── vite.config.js
```

---

## 🔌 API surface (abridged)

```
POST /api/auth/register | /login | /logout     GET /api/auth/me
POST /api/onboard                             GET /api/me/overview
GET  /api/assessment/questions                POST /api/assessment/evaluate
POST /api/self-assessment                     GET/POST /api/courses…
POST /api/courses/enroll | /complete
GET  /api/assistant?q=…
POST /api/upload (multipart)                  POST /api/generate
GET  /api/generated | /api/generated/:id      POST /api/quiz/submit
GET  /api/admin/stats | /api/admin/competencies
GET/POST /api/settings (admin)
```

---

*Pragyan is a concept demonstrator for the "Smart Education" theme — designed to be extended with
live iGOT Karmayogi APIs, SSO, and production-grade data stores.*
