import type { User, Session, VerificationCode } from './types'

const KEY_USERS = 'oj_users'
const KEY_SESSION = 'oj_session'
const KEY_CODES = 'oj_verification_codes'

// ============ 存储层 ============
function loadUsers(): User[] {
  const raw = localStorage.getItem(KEY_USERS)
  let users: User[] = raw ? JSON.parse(raw) : []

  // 任何情况下都确保站主存在（不依赖 localStorage 初始状态）
  const ownerExists = users.some(u => u.role === 'owner')
  if (!ownerExists) {
    const owner: User = {
      id: 'u_owner_00000000',
      username: 'admin',
      email: 'admin@oj.com',
      passwordHash: 'TRAE',
      role: 'owner',
      createdAt: Date.now(),
    }
    users = [...users, owner]
    localStorage.setItem(KEY_USERS, JSON.stringify(users))
  }
  return users
}

function saveUsers(users: User[]) {
  localStorage.setItem(KEY_USERS, JSON.stringify(users))
}

function loadCodes(): VerificationCode[] {
  return JSON.parse(localStorage.getItem(KEY_CODES) || '[]')
}

function saveCodes(codes: VerificationCode[]) {
  localStorage.setItem(KEY_CODES, JSON.stringify(codes))
}

function loadSession(): Session | null {
  const raw = localStorage.getItem(KEY_SESSION)
  return raw ? JSON.parse(raw) : null
}

function saveSession(s: Session | null) {
  if (s) localStorage.setItem(KEY_SESSION, JSON.stringify(s))
  else localStorage.removeItem(KEY_SESSION)
}

// ============ 工具函数 ============
function genId(prefix = 'u') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function genCode() {
  // 6 位数字验证码
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// mock 邮件：验证码存在 localStorage + 控制台输出，方便演示
export function getLatestEmailCode(email: string): string | null {
  const codes = loadCodes()
  const match = codes
    .filter(c => c.email.toLowerCase() === email.toLowerCase() && !c.verified)
    .sort((a, b) => b.expiresAt - a.expiresAt)[0]
  if (!match) return null
  if (Date.now() > match.expiresAt) return null
  return match.code
}

// ============ API 层 ============

/** 发送注册验证码 */
export async function sendRegisterCode(email: string): Promise<{ ok: true; code: string; message: string } | { ok: false; error: string }> {
  await delay(300)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: '邮箱格式不正确' }
  }
  const users = loadUsers()
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: '该邮箱已被注册' }
  }

  const code = genCode()
  const codes = loadCodes().filter(c => c.email.toLowerCase() !== email.toLowerCase())
  codes.push({
    email: email.toLowerCase(),
    code,
    purpose: 'register',
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 分钟
  })
  saveCodes(codes)

  // mock：把验证码打到控制台，生产环境这里发邮件
  // eslint-disable-next-line no-console
  console.log(`[MOCK EMAIL] 验证码已发送到 ${email}: ${code}`)

  return {
    ok: true,
    code,
    message: '验证码已发送（请查看浏览器控制台 Console 面板）',
  }
}

/** 验证邮箱验证码 */
export async function verifyCode(email: string, code: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await delay(200)
  const codes = loadCodes()
  const idx = codes.findIndex(
    c => c.email.toLowerCase() === email.toLowerCase() && c.code === code && !c.verified
  )
  if (idx === -1) return { ok: false, error: '验证码错误或已过期' }
  if (Date.now() > codes[idx].expiresAt) return { ok: false, error: '验证码已过期' }

  codes[idx].verified = true
  saveCodes(codes)
  return { ok: true }
}

/** 完成注册（验证码验证后设置用户名+密码） */
export async function finishRegister(email: string, username: string, password: string): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  await delay(300)
  const codes = loadCodes()
  const verified = codes.find(
    c => c.email.toLowerCase() === email.toLowerCase() && c.verified && c.purpose === 'register'
  )
  if (!verified) return { ok: false, error: '请先完成邮箱验证' }

  if (username.trim().length < 2) return { ok: false, error: '用户名至少 2 个字符' }
  if (password.length < 6) return { ok: false, error: '密码至少 6 位' }

  const users = loadUsers()
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, error: '用户名已被占用' }
  }

  const newUser: User = {
    id: genId(),
    username: username.trim(),
    email: email.toLowerCase(),
    passwordHash: password, // mock 明文
    role: 'user',
    createdAt: Date.now(),
  }
  users.push(newUser)
  saveUsers(users)

  // 清除已使用的验证码
  saveCodes(codes.filter(c => c !== verified))

  return { ok: true, user: newUser }
}

/** 登录 */
export async function login(identifier: string, password: string): Promise<{ ok: true; user: User; token: string } | { ok: false; error: string }> {
  await delay(300)
  const users = loadUsers()

  // 站主特判：admin@oj.com + TRAE
  if (identifier === 'admin@oj.com' && password === 'TRAE') {
    const owner = users.find(u => u.role === 'owner')
    if (!owner) return { ok: false, error: '系统错误' }
    const token = genId('t')
    saveSession({ token, userId: owner.id, loginAt: Date.now() })
    return { ok: true, user: owner, token }
  }

  // 普通用户：username 登录（需求说"登录只需要输入用户名和密码"）
  const user = users.find(
    u => u.username.toLowerCase() === identifier.toLowerCase() && u.role !== 'owner' // 普通登录不能登陆站主
  )
  if (!user) return { ok: false, error: '用户名或密码错误' }

  // 站主/管理员也可以用这个方式登录自己账号（除了 owner 以外）
  if (user.passwordHash !== password) {
    return { ok: false, error: '用户名或密码错误' }
  }

  // 封禁检查
  if (user.role === 'banned') {
    if (user.bannedUntil === -1) {
      return { ok: false, error: '该账号已被永久封禁' }
    }
    if (user.bannedUntil && Date.now() < user.bannedUntil) {
      const until = new Date(user.bannedUntil).toLocaleString()
      return { ok: false, error: `该账号已被封禁，解封时间：${until}` }
    }
    // 过期封禁：自动解封
    user.role = 'user'
    user.bannedUntil = undefined
    user.bannedReason = undefined
    saveUsers(users)
  }

  const token = genId('t')
  saveSession({ token, userId: user.id, loginAt: Date.now() })
  return { ok: true, user, token }
}

export function logout() {
  saveSession(null)
}

export function getCurrentUser(): User | null {
  const session = loadSession()
  if (!session) return null
  const users = loadUsers()
  const user = users.find(u => u.id === session.userId)
  if (!user) {
    saveSession(null)
    return null
  }
  // 封禁检查
  if (user.role === 'banned') {
    if (user.bannedUntil === -1) return null
    if (user.bannedUntil && Date.now() < user.bannedUntil) return null
    user.role = 'user'
    user.bannedUntil = undefined
    user.bannedReason = undefined
    saveUsers(users)
  }
  return user
}

// ============ 用户管理 API ============

/** 权限判断：用户 u 是否可以查看目标 user 的信息 */
export function canView(me: User, target: User): boolean {
  if (me.role === 'owner' || me.role === 'admin') return true
  if (me.role === 'user') {
    // 普通用户：能看见所有除管理员/站主外的邮箱，以及所有用户名
    return target.role === 'user' || target.role === 'banned'
  }
  return false // 被封禁用户无查看权限
}

/** 获取可查看的用户列表 */
export function getVisibleUsers(me: User): User[] {
  const users = loadUsers()
  if (me.role === 'owner') return users
  if (me.role === 'admin') return users
  if (me.role === 'user') {
    // 普通用户看不到 admin / owner 的邮箱，但可以看到用户名
    return users
  }
  return []
}

/** 获取用户视图（根据权限裁剪敏感字段） */
export function projectUser(me: User, target: User): Partial<User> {
  const base: Partial<User> = {
    id: target.id,
    username: target.username,
    role: target.role,
    createdAt: target.createdAt,
    bannedUntil: target.bannedUntil,
    bannedReason: target.bannedReason,
  }

  // 只有 owner / admin 能看邮箱
  if (me.role === 'owner' || me.role === 'admin') {
    base.email = target.email
    if (me.role === 'owner') {
      // 只有站主能看密码哈希
      base.passwordHash = target.passwordHash
    }
  }

  return base
}

/** 修改用户名 */
export async function updateUsername(me: User, targetId: string, newName: string): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const users = loadUsers()
  const target = users.find(u => u.id === targetId)
  if (!target) return { ok: false, error: '用户不存在' }

  // 权限
  if (me.role === 'user') return { ok: false, error: '无权操作' }
  if (me.role === 'admin' && target.role === 'owner') return { ok: false, error: '无权修改站主' }

  if (newName.trim().length < 2) return { ok: false, error: '用户名至少 2 字符' }
  if (users.some(u => u.id !== targetId && u.username.toLowerCase() === newName.toLowerCase())) {
    return { ok: false, error: '用户名已被占用' }
  }

  target.username = newName.trim()
  saveUsers(users)
  return { ok: true, user: target }
}

/** 修改密码 */
export async function updatePassword(me: User, targetId: string, newPassword: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const users = loadUsers()
  const target = users.find(u => u.id === targetId)
  if (!target) return { ok: false, error: '用户不存在' }

  // 只有 owner 能改密码
  if (me.role !== 'owner') return { ok: false, error: '仅站主可修改密码' }

  if (newPassword.length < 6) return { ok: false, error: '密码至少 6 位' }
  target.passwordHash = newPassword
  saveUsers(users)
  return { ok: true }
}

/** 封禁用户 */
export async function banUser(
  me: User,
  targetId: string,
  untilDays: number, // -1 = 永久；正数 = 封禁天数
  reason?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const users = loadUsers()
  const target = users.find(u => u.id === targetId)
  if (!target) return { ok: false, error: '用户不存在' }

  // 封禁权限：owner 和 admin 都可以，但 admin 不能封禁 owner / admin
  if (me.role === 'user' || me.role === 'banned') return { ok: false, error: '无权操作' }
  if (me.role === 'admin' && (target.role === 'owner' || target.role === 'admin')) {
    return { ok: false, error: '无权封禁站主或管理员' }
  }
  if (me.role === 'owner' && target.role === 'owner') {
    return { ok: false, error: '不能封禁自己（站主）' }
  }

  target.role = 'banned'
  if (untilDays === -1) {
    target.bannedUntil = -1
  } else {
    target.bannedUntil = Date.now() + untilDays * 24 * 60 * 60 * 1000
  }
  target.bannedReason = reason
  saveUsers(users)
  return { ok: true }
}

/** 解封用户 */
export async function unbanUser(me: User, targetId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const users = loadUsers()
  const target = users.find(u => u.id === targetId)
  if (!target) return { ok: false, error: '用户不存在' }

  if (me.role === 'user' || me.role === 'banned') return { ok: false, error: '无权操作' }

  target.role = 'user'
  target.bannedUntil = undefined
  target.bannedReason = undefined
  saveUsers(users)
  return { ok: true }
}

/** 站主创建账号（无需邮箱，自动生成随机不重名用户名） */
export async function createOwnerAccount(me: User, password: string): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const users = loadUsers()
  if (me.role !== 'owner') return { ok: false, error: '仅站主可创建账号' }

  if (password.length < 6) return { ok: false, error: '密码至少 6 位' }

  // 生成随机用户名，保证不重名
  let username = ''
  const used = new Set(users.map(u => u.username.toLowerCase()))
  const adjectives = ['cyber', 'ghost', 'void', 'pixel', 'neon', 'dark', 'echo', 'flux', 'zero', 'core']
  const nouns = ['wolf', 'hawk', 'raven', 'phoenix', 'titan', 'shadow', 'blade', 'star', 'forge', 'nova']
  for (let attempt = 0; attempt < 50; attempt++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const num = Math.floor(Math.random() * 10000)
    const candidate = `${adj}_${noun}_${num}`
    if (!used.has(candidate.toLowerCase())) {
      username = candidate
      break
    }
  }
  if (!username) return { ok: false, error: '生成用户名失败，稍后再试' }

  const newUser: User = {
    id: genId(),
    username,
    email: '', // 无邮箱
    passwordHash: password,
    role: 'user',
    createdAt: Date.now(),
  }
  users.push(newUser)
  saveUsers(users)
  return { ok: true, user: newUser }
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}
