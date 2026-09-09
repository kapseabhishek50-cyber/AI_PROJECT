import crypto from 'crypto'

const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex')

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const test = crypto.scryptSync(password, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'))
}

export function issueToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyToken(token) {
  try {
    const [body, sig] = token.split('.')
    const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

export function createSession(store, user) {
  const token = issueToken({ uid: user.id, ts: Date.now() })
  const session = {
    token,
    userId: user.id,
    createdAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
  }
  store.data.sessions = store.get('sessions').filter((s) => s.userId !== user.id)
  store.insert('sessions', session)
  return token
}

export function userFromRequest(store, req) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : (req.cookies?.sid || '')
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  const session = store.get('sessions').find((s) => s.token === token)
  if (!session || session.expiresAt < Date.now()) return null
  return store.find('users', payload.uid) || null
}

export function requireAuth(store, req, res, roles = []) {
  const user = userFromRequest(store, req)
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' })
    return null
  }
  if (roles.length && !roles.includes(user.role)) {
    res.status(403).json({ error: 'Forbidden' })
    return null
  }
  return user
}

export function publicUser(u) {
  if (!u) return null
  const { password, ...rest } = u
  return rest
}
