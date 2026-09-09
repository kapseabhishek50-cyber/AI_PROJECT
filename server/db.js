import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

export class Store {
  constructor() {
    this.data = null
    this.load()
  }

  load() {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8')
      this.data = JSON.parse(raw)
    } catch {
      this.data = this.empty()
    }
  }

  empty() {
    return {
      users: [],
      sessions: [],
      courses: [],
      framework: { domains: [], competencies: [], roles: [] },
      questions: [],
      generatedQuizzes: [],
      attempts: [],
      uploads: [],
      settings: {},
    }
  }

  persist() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    const tmp = DB_FILE + '.tmp'
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2))
    fs.renameSync(tmp, DB_FILE)
  }

  // --- generic helpers ---
  nextId(collection) {
    const arr = this.data[collection] || []
    return arr.reduce((m, r) => Math.max(m, parseInt(r.id) || 0), 0) + 1
  }

  get(collection) {
    return this.data[collection] || []
  }

  find(collection, id) {
    return this.get(collection).find((r) => String(r.id) === String(id))
  }

  insert(collection, record) {
    this.data[collection].push(record)
    this.persist()
    return record
  }

  update(collection, id, patch) {
    const rec = this.find(collection, id)
    if (rec) Object.assign(rec, patch)
    this.persist()
    return rec
  }

  remove(collection, id) {
    this.data[collection] = this.get(collection).filter((r) => String(r.id) !== String(id))
    this.persist()
  }
}
