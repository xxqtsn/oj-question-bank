import type { User } from './types'

// ================ Mock 存储 ================
const USERS_KEY = 'oj_users'
const SESSION_KEY = 'oj_session'

const OWNER_EMAIL = 'admin@oj.com'
const OWNER_USERNAME = 'admin'
const OWNER_PASSWORD = 'TRAE'

// ================ 工具 ================

function loadUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function genId() {
  return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// 初始化站主（每次启动检查）
function ensureOwner() {
  const users = loadUsers()
  if (!users.find(u => u.role === 'owner')) {
    users.unshift({
      id: 'u_owner_00000000',
      username: OWNER_USERNAME,
      email: OWNER_EMAIL,
      passwordHash: OWNER_PASSWORD, // mock 存明文
      role: 'owner',
      createdAt: Date.now(),
    })
    saveUsers(users)
  }
}
ensureOwner()

function saveSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, loginAt: Date.now() }))
}

function loadSession(): User | null {
  try {
    const sess = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    if (!sess) return null
    const users = loadUsers()
    return users.find(u => u.id === sess.userId) || null
  } catch {
    return null
  }
}

// 清理封禁过期用户
function autoUnban(user: User): User {
  if (user.role === 'banned') {
    if (user.bannedUntil === -1) return user // 永久
    if (user.bannedUntil && user.bannedUntil < Date.now()) {
      user.role = 'user'
      user.bannedUntil = undefined
      saveUsers(loadUsers().map(u => u.id === user.id ? user : u))
    }
  }
  return user
}

// ================ 认证 API ================

/** 注册（一步完成） */
export async function register(email: string, username: string, password: string) {
  const users = loadUsers()
  // 检查邮箱
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return { ok: false, error: '邮箱格式不正确' }
  }
  if (users.find(u => u.email === email)) {
    return { ok: false, error: '该邮箱已注册' }
  }
  if (users.find(u => u.username === username)) {
    return { ok: false, error: '用户名已被占用' }
  }
  if (username.length < 2) return { ok: false, error: '用户名至少 2 字符' }
  if (password.length < 6) return { ok: false, error: '密码至少 6 位' }

  const newUser: User = {
    id: genId(),
    username,
    email,
    passwordHash: password, // mock 明文
    role: 'user',
    createdAt: Date.now(),
  }
  users.push(newUser)
  saveUsers(users)
  saveSession(newUser)
  return { ok: true, user: newUser }
}

/** 登录（邮箱 + 密码） */
export async function login(email: string, password: string) {
  const users = loadUsers()
  const user = users.find(u => u.email === email)
  if (!user) return { ok: false, error: '邮箱或密码错误' }
  if (user.passwordHash !== password) return { ok: false, error: '邮箱或密码错误' }

  // 封禁检查
  if (user.role === 'banned') {
    if (user.bannedUntil === -1) return { ok: false, error: '账号已被永久封禁', banned: true }
    if (user.bannedUntil && user.bannedUntil > Date.now()) {
      const left = Math.ceil((user.bannedUntil - Date.now()) / 86400000)
      return { ok: false, error: `账号已被封禁，剩余 ${left} 天`, banned: true }
    }
    autoUnban(user)
  }

  saveSession(user)
  return { ok: true, user }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export async function getCurrentUser(): Promise<User | null> {
  return loadSession()
}

export async function fetchMe(): Promise<User | null> {
  return getCurrentUser()
}

// ================ 管理 API ================

/** 用户列表（带权限过滤） */
export async function listUsers(search?: string) {
  const users = loadUsers()
  const me = loadSession()
  if (!me) return { ok: false, error: '未登录', users: [], currentUser: null }
  if (me.role === 'banned') return { ok: false, error: '无权限', users: [], currentUser: me }

  let filtered = users
  if (search) {
    filtered = filtered.filter(u =>
      u.username.includes(search!) || u.email.includes(search!)
    )
  }

  const isOwner = me.role === 'owner'
  const isAdmin = me.role === 'admin'

  const result = filtered.map(u => {
    const base: any = {
      id: u.id, username: u.username, email: u.email,
      role: u.role, createdAt: u.createdAt,
      bannedUntil: u.bannedUntil, bannedReason: u.bannedReason,
    }
    // 密码可见性
    if (isOwner) {
      base.passwordHash = u.passwordHash
    } else if (isAdmin && u.role !== 'owner') {
      base.passwordHash = u.passwordHash
    }
    // 邮箱可见性（普通用户看不到管理员/站主邮箱）
    if (!isOwner && !isAdmin && (u.role === 'admin' || u.role === 'owner')) {
      base.email = undefined
    }
    return base
  })

  return { ok: true, users: result, currentUser: me }
}

/** 修改用户 */
export async function updateUser(targetId: string, body: { username?: string; password?: string; role?: string }) {
  const me = loadSession()
  if (!me) return { ok: false, error: '未登录' }
  const users = loadUsers()
  const idx = users.findIndex(u => u.id === targetId)
  if (idx === -1) return { ok: false, error: '用户不存在' }
  const target = users[idx]

  // 权限矩阵
  if (me.role === 'admin' && target.role === 'owner') {
    return { ok: false, error: '无权修改站主' }
  }
  if (me.role === 'user' && me.id !== targetId) {
    return { ok: false, error: '无权操作' }
  }

  if (body.username) {
    if (body.username.length < 2) return { ok: false, error: '用户名至少 2 字符' }
    if (users.find(u => u.username === body.username && u.id !== targetId)) {
      return { ok: false, error: '用户名已存在' }
    }
    target.username = body.username
  }
  if (body.password) {
    if (body.password.length < 6) return { ok: false, error: '密码至少 6 位' }
    target.passwordHash = body.password
  }
  if (body.role && me.role === 'owner') {
    if (['user', 'admin', 'banned'].includes(body.role)) {
      target.role = body.role
    }
  }

  users[idx] = target
  saveUsers(users)
  return { ok: true, user: target }
}

/** 封禁 */
export async function banUser(targetId: string, durationDays: number) {
  const me = loadSession()
  if (!me) return { ok: false, error: '未登录' }
  const users = loadUsers()
  const idx = users.findIndex(u => u.id === targetId)
  if (idx === -1) return { ok: false, error: '用户不存在' }
  const target = users[idx]

  if (target.role === 'owner') return { ok: false, error: '不能封禁站主' }
  if (target.role === 'admin' && me.role !== 'owner') {
    return { ok: false, error: '只有站主能封禁管理员' }
  }

  let bannedUntil: number
  if (durationDays === -1) {
    bannedUntil = -1
  } else {
    if (!durationDays || durationDays < 1) return { ok: false, error: '请输入封禁天数（-1 为永久）' }
    bannedUntil = Date.now() + durationDays * 86400000
  }

  target.role = 'banned'
  target.bannedUntil = bannedUntil
  users[idx] = target
  saveUsers(users)
  return { ok: true }
}

/** 解封 */
export async function unbanUser(targetId: string) {
  const me = loadSession()
  if (!me) return { ok: false, error: '未登录' }
  const users = loadUsers()
  const idx = users.findIndex(u => u.id === targetId)
  if (idx === -1) return { ok: false, error: '用户不存在' }
  const target = users[idx]

  if (me.role === 'admin' && target.role === 'owner') {
    return { ok: false, error: '无权解封站主' }
  }

  target.role = 'user'
  target.bannedUntil = undefined
  users[idx] = target
  saveUsers(users)
  return { ok: true }
}

/** 站主免邮箱创建账号 */
export async function createOwnerAccount(password: string) {
  const me = loadSession()
  if (!me || me.role !== 'owner') return { ok: false, error: '只有站主能创建账号' }
  if (!password || password.length < 6) return { ok: false, error: '密码至少 6 位' }

  const users = loadUsers()
  let username = ''
  let attempts = 0
  do {
    username = 'usr_' + Math.random().toString(36).slice(2, 8)
    attempts++
  } while (attempts < 10 && users.find(u => u.username === username))

  const newUser: User = {
    id: genId(),
    username,
    email: `${username}@internal.local`,
    passwordHash: password,
    role: 'user',
    createdAt: Date.now(),
  }
  users.push(newUser)
  saveUsers(users)
  return { ok: true, username, email: newUser.email }
}
