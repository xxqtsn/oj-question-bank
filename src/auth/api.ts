import type { User } from './types'

// ================ 运行模式探测 ================
// 生产（Pages）：用相对路径 /api → Pages Functions 代理到 Worker
// 开发（localhost）：探测 Vite proxy 或 fallback localStorage mock
const API_BASE = import.meta.env.VITE_API_BASE || '/api'
const TOKEN_KEY = 'oj_token'

// 是否在 Pages 生产环境（非 localhost）
const IS_PROD = typeof window !== 'undefined' &&
  !/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(window.location.hostname)

// 生产环境强制走 Worker（相对路径 /api → Pages Functions 代理）
// 开发环境先探测 Vite proxy 可达性
let proxyChecked = false
let proxyAvailable = false

async function shouldUseWorker(): Promise<boolean> {
  if (IS_PROD) return true
  if (proxyChecked) return proxyAvailable
  proxyChecked = true
  try {
    const res = await fetch('/api/auth/login', {
      method: 'OPTIONS',
      signal: AbortSignal.timeout(3000),
    })
    proxyAvailable = res.ok || res.status === 204
  } catch {
    proxyAvailable = false
  }
  return proxyAvailable
}

// ================ Worker 字段映射 ================
// Worker 用 snake_case，前端 types.ts 用 camelCase
function mapWorkerUser(u: any): User {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    passwordHash: u.password_hash ?? '',
    role: u.role,
    createdAt: typeof u.created_at === 'string' ? parseInt(u.created_at) : u.created_at,
    bannedUntil: u.banned_until ?? undefined,
    bannedReason: u.banned_reason ?? undefined,
  }
}

// ================ Worker fetch 封装 ================
function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function workerFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const base = API_BASE || '/api'
  const url = `${base}${path}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined) ?? {},
  }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { ...options, headers })
  let data: any
  try {
    data = await res.json()
  } catch {
    data = { ok: false, error: `HTTP ${res.status}` }
  }
  return data
}

// ================ Worker 模式实现 ================
async function w_register(email: string, username: string, password: string) {
  const data = await workerFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password }),
  })
  if (data.ok && data.user) {
    // 注册成功后立即登录获取 token
    const loginRes = await w_login(email, password)
    if (loginRes.ok) {
      return { ok: true, user: loginRes.user }
    }
    return { ok: true, user: mapWorkerUser(data.user) as User }
  }
  return { ok: false, error: data.error || '注册失败' }
}

async function w_login(email: string, password: string) {
  // Worker login 接口接受 username 或 email 作为第一个参数
  const data = await workerFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: email, password }),
  })
  if (data.ok && data.token) {
    setToken(data.token)
  }
  if (data.ok && data.user) {
    return { ok: true, user: mapWorkerUser(data.user) as User }
  }
  return { ok: false, error: data.error || '登录失败', banned: data.error?.includes('封禁') }
}

function w_logout() {
  clearToken()
}

async function w_getCurrentUser(): Promise<User | null> {
  const data = await workerFetch('/users/me', { method: 'GET' })
  if (data.ok && data.user) return mapWorkerUser(data.user)
  return null
}

async function w_listUsers(search?: string) {
  const q = search ? `?search=${encodeURIComponent(search)}` : ''
  const data = await workerFetch(`/admin/users${q}`, { method: 'GET' })
  if (data.ok) {
    return {
      ok: true,
      users: (data.users || []).map((u: any) => mapWorkerUser(u)),
      currentUser: data.currentUser ? mapWorkerUser(data.currentUser) : null,
    }
  }
  return { ok: false, error: data.error || '获取用户列表失败', users: [], currentUser: null }
}

async function w_updateUser(targetId: string, body: { username?: string; password?: string; role?: string }) {
  const data = await workerFetch(`/admin/users/${targetId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  if (data.ok && data.user) {
    return { ok: true, user: mapWorkerUser(data.user) as User }
  }
  return { ok: false, error: data.error || '修改失败' }
}

async function w_banUser(targetId: string, durationDays: number) {
  const data = await workerFetch(`/admin/users/${targetId}/ban`, {
    method: 'POST',
    body: JSON.stringify({ duration_days: durationDays }),
  })
  return data.ok
    ? { ok: true }
    : { ok: false, error: data.error || '封禁失败' }
}

async function w_unbanUser(targetId: string) {
  const data = await workerFetch(`/admin/users/${targetId}/unban`, {
    method: 'POST',
  })
  return data.ok
    ? { ok: true }
    : { ok: false, error: data.error || '解封失败' }
}

async function w_createOwnerAccount(password: string) {
  const data = await workerFetch('/owner/create-user', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
  if (data.ok) {
    return { ok: true, username: data.username, email: data.email }
  }
  return { ok: false, error: data.error || '创建失败' }
}

// ================ LocalStorage Mock（fallback） ================
const USERS_KEY = 'oj_users_mock'
const SESSION_KEY = 'oj_session_mock'

const OWNER_EMAIL = 'admin@oj.com'
const OWNER_USERNAME = 'admin'
const OWNER_PASSWORD = 'TRAE'

function loadUsersMock(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  } catch {
    return []
  }
}
function saveUsersMock(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}
function genIdMock() {
  return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
function ensureOwnerMock() {
  const users = loadUsersMock()
  if (!users.find(u => u.role === 'owner')) {
    users.unshift({
      id: 'u_owner_00000000',
      username: OWNER_USERNAME,
      email: OWNER_EMAIL,
      passwordHash: OWNER_PASSWORD,
      role: 'owner',
      createdAt: Date.now(),
    })
    saveUsersMock(users)
  }
}
ensureOwnerMock()

function saveSessionMock(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, loginAt: Date.now() }))
}
function loadSessionMock(): User | null {
  try {
    const sess = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    if (!sess) return null
    const users = loadUsersMock()
    return users.find(u => u.id === sess.userId) || null
  } catch {
    return null
  }
}
function autoUnbanMock(user: User): User {
  if (user.role === 'banned') {
    if (user.bannedUntil === -1) return user
    if (user.bannedUntil && user.bannedUntil < Date.now()) {
      user.role = 'user'
      user.bannedUntil = undefined
      saveUsersMock(loadUsersMock().map(u => (u.id === user.id ? user : u)))
    }
  }
  return user
}

async function m_register(email: string, username: string, password: string) {
  const users = loadUsersMock()
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) return { ok: false, error: '邮箱格式不正确' }
  if (users.find(u => u.email === email)) return { ok: false, error: '该邮箱已注册' }
  if (users.find(u => u.username === username)) return { ok: false, error: '用户名已被占用' }
  if (username.length < 2) return { ok: false, error: '用户名至少 2 字符' }
  if (password.length < 6) return { ok: false, error: '密码至少 6 位' }

  const newUser: User = {
    id: genIdMock(),
    username,
    email,
    passwordHash: password,
    role: 'user',
    createdAt: Date.now(),
  }
  users.push(newUser)
  saveUsersMock(users)
  saveSessionMock(newUser)
  return { ok: true, user: newUser }
}

async function m_login(email: string, password: string) {
  const users = loadUsersMock()
  const user = users.find(u => u.email === email)
  if (!user) return { ok: false, error: '邮箱或密码错误' }
  if (user.passwordHash !== password) return { ok: false, error: '邮箱或密码错误' }
  if (user.role === 'banned') {
    if (user.bannedUntil === -1) return { ok: false, error: '账号已被永久封禁', banned: true }
    if (user.bannedUntil && user.bannedUntil > Date.now()) {
      const left = Math.ceil((user.bannedUntil - Date.now()) / 86400000)
      return { ok: false, error: `账号已被封禁，剩余 ${left} 天`, banned: true }
    }
    autoUnbanMock(user)
  }
  saveSessionMock(user)
  return { ok: true, user }
}

function m_logout() {
  localStorage.removeItem(SESSION_KEY)
}

async function m_getCurrentUser(): Promise<User | null> {
  return loadSessionMock()
}

async function m_listUsers(search?: string) {
  const users = loadUsersMock()
  const me = loadSessionMock()
  if (!me) return { ok: false, error: '未登录', users: [], currentUser: null }
  if (me.role === 'banned') return { ok: false, error: '无权限', users: [], currentUser: me }

  let filtered = users
  if (search) filtered = filtered.filter(u => u.username.includes(search!) || u.email.includes(search!))

  const isOwner = me.role === 'owner'
  const isAdmin = me.role === 'admin'
  const result = filtered.map(u => {
    const base: any = {
      id: u.id, username: u.username, email: u.email,
      role: u.role, createdAt: u.createdAt,
      bannedUntil: u.bannedUntil, bannedReason: u.bannedReason,
    }
    if (isOwner) base.passwordHash = u.passwordHash
    else if (isAdmin && u.role !== 'owner') base.passwordHash = u.passwordHash
    if (!isOwner && !isAdmin && (u.role === 'admin' || u.role === 'owner')) base.email = undefined
    return base
  })
  return { ok: true, users: result, currentUser: me }
}

async function m_updateUser(targetId: string, body: { username?: string; password?: string; role?: string }) {
  const me = loadSessionMock()
  if (!me) return { ok: false, error: '未登录' }
  const users = loadUsersMock()
  const idx = users.findIndex(u => u.id === targetId)
  if (idx === -1) return { ok: false, error: '用户不存在' }
  const target = users[idx]
  if (me.role === 'admin' && target.role === 'owner') return { ok: false, error: '无权修改站主' }
  if (me.role === 'user' && me.id !== targetId) return { ok: false, error: '无权操作' }
  if (body.username) {
    if (body.username.length < 2) return { ok: false, error: '用户名至少 2 字符' }
    if (users.find(u => u.username === body.username && u.id !== targetId)) return { ok: false, error: '用户名已存在' }
    target.username = body.username
  }
  if (body.password) {
    if (body.password.length < 6) return { ok: false, error: '密码至少 6 位' }
    target.passwordHash = body.password
  }
  if (body.role && me.role === 'owner') {
    const validRoles: User['role'][] = ['user', 'admin', 'banned']
    if (validRoles.includes(body.role as User['role'])) target.role = body.role as User['role']
  }
  users[idx] = target
  saveUsersMock(users)
  return { ok: true, user: target }
}

async function m_banUser(targetId: string, durationDays: number) {
  const me = loadSessionMock()
  if (!me) return { ok: false, error: '未登录' }
  const users = loadUsersMock()
  const idx = users.findIndex(u => u.id === targetId)
  if (idx === -1) return { ok: false, error: '用户不存在' }
  const target = users[idx]
  if (target.role === 'owner') return { ok: false, error: '不能封禁站主' }
  if (target.role === 'admin' && me.role !== 'owner') return { ok: false, error: '只有站主能封禁管理员' }
  let bannedUntil: number
  if (durationDays === -1) bannedUntil = -1
  else {
    if (!durationDays || durationDays < 1) return { ok: false, error: '请输入封禁天数（-1 为永久）' }
    bannedUntil = Date.now() + durationDays * 86400000
  }
  target.role = 'banned'
  target.bannedUntil = bannedUntil
  users[idx] = target
  saveUsersMock(users)
  return { ok: true }
}

async function m_unbanUser(targetId: string) {
  const me = loadSessionMock()
  if (!me) return { ok: false, error: '未登录' }
  const users = loadUsersMock()
  const idx = users.findIndex(u => u.id === targetId)
  if (idx === -1) return { ok: false, error: '用户不存在' }
  const target = users[idx]
  if (me.role === 'admin' && target.role === 'owner') return { ok: false, error: '无权解封站主' }
  target.role = 'user'
  target.bannedUntil = undefined
  users[idx] = target
  saveUsersMock(users)
  return { ok: true }
}

async function m_createOwnerAccount(password: string) {
  const me = loadSessionMock()
  if (!me || me.role !== 'owner') return { ok: false, error: '只有站主能创建账号' }
  if (!password || password.length < 6) return { ok: false, error: '密码至少 6 位' }
  const users = loadUsersMock()
  let username = ''
  let attempts = 0
  do {
    username = 'usr_' + Math.random().toString(36).slice(2, 8)
    attempts++
  } while (attempts < 10 && users.find(u => u.username === username))
  const newUser: User = {
    id: genIdMock(), username, email: `${username}@internal.local`,
    passwordHash: password, role: 'user', createdAt: Date.now(),
  }
  users.push(newUser)
  saveUsersMock(users)
  return { ok: true, username, email: newUser.email }
}

// ================ 导出层：自动路由 ================
async function useWorker(): Promise<boolean> {
  return shouldUseWorker()
}

export async function register(email: string, username: string, password: string) {
  if (await useWorker()) return w_register(email, username, password)
  return m_register(email, username, password)
}

export async function login(email: string, password: string) {
  if (await useWorker()) return w_login(email, password)
  return m_login(email, password)
}

export function logout() {
  if (IS_PROD) {
    w_logout()
  } else {
    // 开发环境：同时清理 Worker token 和 mock session
    w_logout()
    m_logout()
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (await useWorker()) return w_getCurrentUser()
  return m_getCurrentUser()
}

export async function fetchMe(): Promise<User | null> {
  return getCurrentUser()
}

export async function listUsers(search?: string) {
  if (await useWorker()) return w_listUsers(search)
  return m_listUsers(search)
}

export async function updateUser(targetId: string, body: { username?: string; password?: string; role?: string }) {
  if (await useWorker()) return w_updateUser(targetId, body)
  return m_updateUser(targetId, body)
}

export async function banUser(targetId: string, durationDays: number) {
  if (await useWorker()) return w_banUser(targetId, durationDays)
  return m_banUser(targetId, durationDays)
}

export async function unbanUser(targetId: string) {
  if (await useWorker()) return w_unbanUser(targetId)
  return m_unbanUser(targetId)
}

export async function createOwnerAccount(password: string) {
  if (await useWorker()) return w_createOwnerAccount(password)
  return m_createOwnerAccount(password)
}
