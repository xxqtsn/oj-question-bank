// ================================================================
// JPB OJ API — Cloudflare Worker + D1 + Resend
// ================================================================

const OWNER_EMAIL = 'admin@oj.com'
const OWNER_USERNAME = 'admin'
const OWNER_PASSWORD = 'TRAE'

// ================ 工具函数 ================

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

async function hashPassword(pwd) {
  // Worker 里用 SubtleCrypto 做 SHA-256
  const buf = new TextEncoder().encode(pwd)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function genId() {
  return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function getFrontendUrl(env) {
  return env.FRONTEND_URL || 'https://justpassingby.us.ci'
}

// ================ Resend 邮件发送 ================

async function sendEmail(env, { to, subject, html }) {
  if (!env.RESEND_API_KEY) {
    console.warn('[Resend] RESEND_API_KEY not set, skipping real send')
    return { ok: true, mock: true }
  }
  // 用 Resend 测试域名（免费免验证）。如果以后 Resend 支持你的域名了再改回来：
  // const from = `JPB OJ <noreply@${getFrontendUrl(env).replace('https://', '').replace('http://', '')}>`
  const from = `JPB OJ <onboarding@resend.dev>`
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    })
    if (!resp.ok) {
      const err = await resp.text()
      console.error('[Resend] failed:', err)
      return { ok: false, error: err }
    }
    return { ok: true }
  } catch (e) {
    console.error('[Resend] exception:', e)
    return { ok: false, error: String(e) }
  }
}

function verificationEmailHtml(code) {
  return `
  <!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="background:#000;font-family:JetBrains Mono,monospace;color:#b8ffdb;padding:40px;">
    <div style="max-width:480px;margin:0 auto;border:1px solid #0f2a1f;border-radius:8px;padding:32px;background:#0a1410;">
      <h1 style="color:#00ff88;margin:0 0 8px;font-size:24px;">// JPB OJ</h1>
      <p style="color:#5a9980;margin:0 0 24px;font-size:14px;">JUST PASSING BY · 算法题库</p>
      <p style="color:#b8ffdb;font-size:14px;margin:0 0 16px;">您的邮箱验证码：</p>
      <div style="text-align:center;font-size:36px;font-weight:bold;color:#00ff88;letter-spacing:12px;padding:16px;border:2px dashed #00ff88;border-radius:8px;background:rgba(0,255,136,0.05);margin-bottom:16px;">
        ${code}
      </div>
      <p style="color:#5a9980;font-size:12px;margin:0;">验证码 10 分钟内有效，请勿泄露。</p>
      <p style="color:#2e5a48;font-size:11px;margin:16px 0 0;">如果你没有申请注册，请忽略此邮件。</p>
    </div>
  </body></html>`
}

// ================ 初始化站主 ================

async function ensureOwner(env) {
  const existing = await env.DB.prepare(
    "SELECT * FROM users WHERE role = 'owner'"
  ).first()
  if (existing) return

  const id = 'u_owner_00000000'
  const hash = await hashPassword(OWNER_PASSWORD)
  await env.DB.prepare(
    `INSERT OR IGNORE INTO users (id, username, email, password_hash, role, created_at)
     VALUES (?, ?, ?, ?, 'owner', ?)`
  ).bind(id, OWNER_USERNAME, OWNER_EMAIL, hash, Date.now()).run()
  console.log('[init] owner account ensured')
}

// ================ 认证中间件 ================

async function authenticate(env, req) {
  const auth = req.headers.get('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  // token 格式: base64(username:password) 简化版
  try {
    const decoded = atob(token)
    const [username, password] = decoded.split(':')
    if (!username || !password) return null
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE username = ? OR email = ?'
    ).bind(username, username).first()
    if (!user) return null
    const hash = await hashPassword(password)
    if (user.password_hash !== hash) return null
    // 检查封禁
    if (user.role === 'banned') {
      if (user.banned_until === -1) return null
      if (user.banned_until && user.banned_until > Date.now()) return null
      // 过期自动解封
      await env.DB.prepare("UPDATE users SET role = 'user', banned_until = NULL WHERE id = ?").bind(user.id).run()
      user.role = 'user'
      user.banned_until = null
    }
    return sanitizeUser(user)
  } catch {
    return null
  }
}

function sanitizeUser(u) {
  if (!u) return null
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    banned_until: u.banned_until,
    created_at: u.created_at,
  }
}

// ================ 路由分发 ================

export default {
  async fetch(request, env, ctx) {
    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    // 确保站主存在
    ctx.waitUntil(ensureOwner(env))

    const url = new URL(request.url)
    const path = url.pathname.replace(/^\/api/, '')

    try {
      // ========== 公开接口 ==========

      // POST /auth/send-code — 发送邮箱验证码
      if (path === '/auth/send-code' && request.method === 'POST') {
        const { email } = await request.json()
        if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
          return json({ ok: false, error: '邮箱格式不正确' }, 400)
        }
        // 检查邮箱是否已注册
        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
        if (existing) {
          return json({ ok: false, error: '该邮箱已注册' }, 400)
        }
        // 生成验证码
        const code = genCode()
        const now = Date.now()
        await env.DB.prepare(
          `INSERT INTO verification_codes (email, code, purpose, expires_at, created_at)
           VALUES (?, ?, 'register', ?, ?)`
        ).bind(email, code, now + 10 * 60 * 1000, now).run()
        // 发邮件
        await sendEmail(env, {
          to: email,
          subject: '[JPB OJ] 邮箱验证码',
          html: verificationEmailHtml(code),
        })
        return json({ ok: true, mock: !env.RESEND_API_KEY })
      }

      // POST /auth/verify — 验证验证码
      if (path === '/auth/verify' && request.method === 'POST') {
        const { email, code } = await request.json()
        if (!email || !code) return json({ ok: false, error: '缺少参数' }, 400)
        const row = await env.DB.prepare(
          `SELECT * FROM verification_codes WHERE email = ? AND code = ? AND purpose = 'register'
           ORDER BY created_at DESC LIMIT 1`
        ).bind(email, code).first()
        if (!row) return json({ ok: false, error: '验证码错误' }, 400)
        if (row.expires_at < Date.now()) return json({ ok: false, error: '验证码已过期' }, 400)
        // 验证后删除
        await env.DB.prepare('DELETE FROM verification_codes WHERE id = ?').bind(row.id).run()
        return json({ ok: true })
      }

      // POST /auth/register — 完成注册
      if (path === '/auth/register' && request.method === 'POST') {
        const { email, username, password } = await request.json()
        if (!email || !username || !password) return json({ ok: false, error: '缺少参数' }, 400)
        if (username.length < 2) return json({ ok: false, error: '用户名至少 2 字符' }, 400)
        if (password.length < 6) return json({ ok: false, error: '密码至少 6 位' }, 400)
        // 检查用户名/邮箱唯一
        const dup = await env.DB.prepare(
          'SELECT id FROM users WHERE username = ? OR email = ?'
        ).bind(username, email).first()
        if (dup) return json({ ok: false, error: '用户名或邮箱已被注册' }, 400)
        const hash = await hashPassword(password)
        const id = genId()
        await env.DB.prepare(
          `INSERT INTO users (id, username, email, password_hash, role, created_at)
           VALUES (?, ?, ?, ?, 'user', ?)`
        ).bind(id, username, email, hash, Date.now()).run()
        const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first()
        return json({ ok: true, user: sanitizeUser(user) })
      }

      // POST /auth/login — 登录（返回 token）
      if (path === '/auth/login' && request.method === 'POST') {
        const { username, password } = await request.json()
        if (!username || !password) return json({ ok: false, error: '缺少参数' }, 400)
        const user = await env.DB.prepare(
          'SELECT * FROM users WHERE username = ? OR email = ?'
        ).bind(username, username).first()
        if (!user) return json({ ok: false, error: '用户名或密码错误' }, 401)
        const hash = await hashPassword(password)
        if (user.password_hash !== hash) return json({ ok: false, error: '用户名或密码错误' }, 401)
        // 封禁检查
        if (user.role === 'banned') {
          if (user.banned_until === -1) return json({ ok: false, error: '账号已被永久封禁' }, 403)
          if (user.banned_until && user.banned_until > Date.now()) {
            const left = Math.ceil((user.banned_until - Date.now()) / 86400000)
            return json({ ok: false, error: `账号已被封禁，剩余 ${left} 天` }, 403)
          }
          await env.DB.prepare("UPDATE users SET role = 'user', banned_until = NULL WHERE id = ?").bind(user.id).run()
          user.role = 'user'
        }
        // 生成 token
        const token = btoa(`${user.username}:${password}`)
        return json({ ok: true, user: sanitizeUser(user), token })
      }

      // ========== 需要登录的接口 ==========
      const authUser = await authenticate(env, request)

      // GET /users/me — 获取当前用户
      if (path === '/users/me' && request.method === 'GET') {
        if (!authUser) return json({ ok: false, error: '未登录' }, 401)
        return json({ ok: true, user: authUser })
      }

      // ========== 管理员 / 站主接口 ==========

      // GET /admin/users — 用户列表（带权限过滤）
      if (path === '/admin/users' && request.method === 'GET') {
        if (!authUser) return json({ ok: false, error: '未登录' }, 401)
        if (authUser.role === 'banned') return json({ ok: false, error: '无权限' }, 403)

        const { search } = url.searchParams
        let rows
        if (authUser.role === 'owner') {
          // 站主：看所有人（含密码哈希）
          const sql = search
            ? 'SELECT * FROM users WHERE username LIKE ? OR email LIKE ? ORDER BY created_at DESC'
            : 'SELECT * FROM users ORDER BY created_at DESC'
          rows = search
            ? await env.DB.prepare(sql).bind(`%${search}%`, `%${search}%`).all()
            : await env.DB.prepare(sql).all()
        } else if (authUser.role === 'admin') {
          // 管理员：看除站主外的所有人，不能看密码
          const sql = search
            ? "SELECT * FROM users WHERE role != 'owner' AND (username LIKE ? OR email LIKE ?) ORDER BY created_at DESC"
            : "SELECT * FROM users WHERE role != 'owner' ORDER BY created_at DESC"
          rows = search
            ? await env.DB.prepare(sql).bind(`%${search}%`, `%${search}%`).all()
            : await env.DB.prepare(sql).all()
        } else {
          // 普通用户：看除管理员/站主外的邮箱，所有人的用户名
          const sql = search
            ? "SELECT * FROM users WHERE role NOT IN ('admin','owner') AND (username LIKE ? OR email LIKE ?) ORDER BY created_at DESC"
            : "SELECT * FROM users WHERE role NOT IN ('admin','owner') ORDER BY created_at DESC"
          rows = search
            ? await env.DB.prepare(sql).bind(`%${search}%`, `%${search}%`).all()
            : await env.DB.prepare(sql).all()
        }

        const isOwner = authUser.role === 'owner'
        const isAdmin = authUser.role === 'admin'
        const users = rows.results.map(u => {
          const base = sanitizeUser(u)
          // 站主能看所有人密码；管理员能看除站主外密码；普通用户啥也看不到
          if (isOwner) {
            base.password_hash = u.password_hash
          } else if (isAdmin && u.role !== 'owner') {
            base.password_hash = u.password_hash
          }
          return base
        })
        return json({ ok: true, users, currentUser: authUser })
      }

      // PUT /admin/users/:id — 修改用户（改用户名/密码/角色）
      if (path.match(/^\/admin\/users\/(.+)$/) && request.method === 'PUT') {
        if (!authUser) return json({ ok: false, error: '未登录' }, 401)
        const targetId = path.match(/^\/admin\/users\/(.+)$/)[1]
        const target = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(targetId).first()
        if (!target) return json({ ok: false, error: '用户不存在' }, 404)

        const body = await request.json()

        // 权限矩阵
        if (authUser.role === 'owner') {
          // 站主：可以改任何人
        } else if (authUser.role === 'admin') {
          // 管理员：只能改非站主的
          if (target.role === 'owner') return json({ ok: false, error: '无权修改站主' }, 403)
        } else {
          return json({ ok: false, error: '无权操作' }, 403)
        }

        const updates = []
        const binds = []
        if (body.username) {
          // 检查重名
          const dup = await env.DB.prepare('SELECT id FROM users WHERE username = ? AND id != ?').bind(body.username, targetId).first()
          if (dup) return json({ ok: false, error: '用户名已存在' }, 400)
          updates.push('username = ?')
          binds.push(body.username)
        }
        if (body.password) {
          const hash = await hashPassword(body.password)
          updates.push('password_hash = ?')
          binds.push(hash)
        }
        if (body.role && authUser.role === 'owner') {
          // 只有站主能改角色
          if (['user', 'admin', 'banned'].includes(body.role)) {
            updates.push('role = ?')
            binds.push(body.role)
          }
        }

        if (updates.length === 0) return json({ ok: false, error: '没有可更新的字段' }, 400)
        binds.push(targetId)
        await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...binds).run()
        const updated = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(targetId).first()
        return json({ ok: true, user: sanitizeUser(updated) })
      }

      // POST /admin/users/:id/ban — 封禁用户
      if (path.match(/^\/admin\/users\/(.+)\/ban$/) && request.method === 'POST') {
        if (!authUser) return json({ ok: false, error: '未登录' }, 401)
        const targetId = path.match(/^\/admin\/users\/(.+)\/ban$/)[1]
        const target = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(targetId).first()
        if (!target) return json({ ok: false, error: '用户不存在' }, 404)

        // 不能封站主
        if (target.role === 'owner') return json({ ok: false, error: '不能封禁站主' }, 403)
        // 管理员不能封管理员
        if (target.role === 'admin' && authUser.role !== 'owner') {
          return json({ ok: false, error: '只有站主能封禁管理员' }, 403)
        }

        const { duration_days } = await request.json()
        let bannedUntil
        if (duration_days === -1) {
          bannedUntil = -1 // 永久
        } else {
          const days = Number(duration_days)
          if (!days || days < 1) return json({ ok: false, error: '请输入封禁天数（-1 为永久）' }, 400)
          bannedUntil = Date.now() + days * 86400000
        }

        await env.DB.prepare(
          "UPDATE users SET role = 'banned', banned_until = ? WHERE id = ?"
        ).bind(bannedUntil, targetId).run()
        return json({ ok: true, banned_until: bannedUntil })
      }

      // POST /admin/users/:id/unban — 解封用户
      if (path.match(/^\/admin\/users\/(.+)\/unban$/) && request.method === 'POST') {
        if (!authUser) return json({ ok: false, error: '未登录' }, 401)
        const targetId = path.match(/^\/admin\/users\/(.+)\/unban$/)[1]
        const target = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(targetId).first()
        if (!target) return json({ ok: false, error: '用户不存在' }, 404)
        if (authUser.role === 'admin' && target.role === 'owner') {
          return json({ ok: false, error: '无权解封站主' }, 403)
        }
        await env.DB.prepare(
          "UPDATE users SET role = 'user', banned_until = NULL WHERE id = ?"
        ).bind(targetId).run()
        return json({ ok: true })
      }

      // POST /owner/create-user — 站主免邮箱创建账号
      if (path === '/owner/create-user' && request.method === 'POST') {
        if (!authUser || authUser.role !== 'owner') {
          return json({ ok: false, error: '只有站主能创建账号' }, 403)
        }
        const { password, role = 'user' } = await request.json()
        if (!password) return json({ ok: false, error: '请设置密码' }, 400)
        // 生成随机唯一用户名
        let username
        let attempts = 0
        do {
          username = 'usr_' + Math.random().toString(36).slice(2, 8)
          attempts++
        } while (attempts < 10 && await env.DB.prepare('SELECT 1 FROM users WHERE username = ?').bind(username).first())

        const email = `${username}@internal.local`
        const hash = await hashPassword(password)
        const id = genId()
        await env.DB.prepare(
          `INSERT INTO users (id, username, email, password_hash, role, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(id, username, email, hash, role, Date.now()).run()
        return json({ ok: true, username, email })
      }

      return json({ ok: false, error: 'Not Found' }, 404)
    } catch (e) {
      console.error('[error]', e)
      return json({ ok: false, error: '服务器内部错误' }, 500)
    }
  },
}
