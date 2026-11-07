import { useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import {
  getVisibleUsers, projectUser,
  updateUsername, updatePassword,
  banUser, unbanUser, createOwnerAccount,
} from '../auth/api'
import type { Role, User } from '../auth/types'

const ROLE_LABELS: Record<Role, string> = {
  owner: '站主',
  admin: '管理员',
  user: '普通用户',
  banned: '已封禁',
}

const ROLE_COLORS: Record<Role, string> = {
  owner: 'bg-fuchsia-950/60 text-fuchsia-400 border-fuchsia-800',
  admin: 'bg-blue-950/60 text-blue-400 border-blue-800',
  user: 'bg-cyan-950/60 text-cyan-400 border-cyan-800',
  banned: 'bg-rose-950/60 text-rose-400 border-rose-800',
}

function formatTime(ts?: number | string): string {
  if (!ts) return '-'
  const n = typeof ts === 'string' ? parseInt(ts) : ts
  return new Date(n).toLocaleString()
}

export default function AdminPage() {
  const { user: me, refresh } = useAuth()
  if (!me) return null

  const currentUser = me // 收窄类型
  const users = useMemo(() => getVisibleUsers(currentUser), [currentUser])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null)

  // 站主创建账号表单
  const [newAccPassword, setNewAccPassword] = useState('')
  const [newAccLoading, setNewAccLoading] = useState(false)
  const [lastCreated, setLastCreated] = useState<{ username: string; email: string } | null>(null)

  const canSeePanel = me.role === 'owner' || me.role === 'admin' || me.role === 'user'
  if (!canSeePanel) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center font-mono text-cyber-danger">
        ACCESS DENIED — [ ERR_BANNED ]
      </div>
    )
  }

  const selected = users.find(u => u.id === selectedId) || users[0]
  const projected = selected ? projectUser(me, selected) : null

  function showToast(ok: boolean, msg: string) {
    setToast({ ok, msg })
    setTimeout(() => setToast(null), 2500)
  }

  async function handleBan(targetId: string, untilDays: number, reason?: string) {
    const res = await banUser(currentUser, targetId, untilDays, reason)
    if (res.ok) { showToast(true, '封禁成功'); refresh() }
    else showToast(false, res.error)
  }

  async function handleUnban(targetId: string) {
    const res = await unbanUser(currentUser, targetId)
    if (res.ok) { showToast(true, '解封成功'); refresh() }
    else showToast(false, res.error)
  }

  async function handleCreateAccount() {
    if (currentUser.role !== 'owner') return
    setNewAccLoading(true)
    const res = await createOwnerAccount(currentUser, newAccPassword)
    setNewAccLoading(false)
    if (res.ok) {
      showToast(true, `创建成功！用户名：${res.user.username}`)
      setLastCreated({ username: res.user.username, email: res.user.email || '(无)' })
      setNewAccPassword('')
      refresh()
    } else {
      showToast(false, res.error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-mono">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-2 rounded border text-sm shadow-glowSoft ${
          toast.ok ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                   : 'bg-rose-950/80 border-rose-500 text-rose-400'
        }`}>
          {toast.ok ? '✓' : '✗'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cyber-accent cyber-title">// USER&nbsp;MANAGEMENT</h1>
        <div className="text-cyber-textDim text-sm mt-2">
          当前身份：<span className={`badge ${ROLE_COLORS[me.role]}`}>{ROLE_LABELS[me.role]}</span>
          <span className="ml-2">@{me.username}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 用户列表 */}
        <div className="lg:col-span-1">
          <div className="card overflow-hidden">
            <div className="px-4 py-2 bg-cyber-accent/10 border-b border-cyber-border text-xs text-cyber-accent uppercase tracking-wider">
              USER&nbsp;LIST&nbsp;&nbsp;({users.length})
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {users.map(u => {
                const proj = projectUser(me, u)
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    className={`w-full text-left px-4 py-3 border-b border-cyber-border/50 transition-colors ${
                      selected?.id === u.id ? 'bg-cyber-accent/10' : 'hover:bg-cyber-accent/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-cyber-text truncate font-bold">{u.username}</span>
                      <span className={`badge text-[10px] ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                    </div>
                    {proj.email && (
                      <div className="text-xs text-cyber-textDim mt-0.5 truncate">{proj.email}</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 用户详情 + 操作 */}
        <div className="lg:col-span-2 space-y-6">
          {projected && selected && (
            <>
              {/* 基本信息 */}
              <div className="card p-6">
                <h2 className="text-cyber-accent text-sm uppercase tracking-wider mb-4">// PROFILE</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-cyber-textDim uppercase mb-1">ID</div>
                    <div className="text-cyber-textMute text-xs break-all">{projected.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-cyber-textDim uppercase mb-1">ROLE</div>
                    <span className={`badge ${ROLE_COLORS[selected.role]}`}>{ROLE_LABELS[selected.role]}</span>
                  </div>
                  <div>
                    <div className="text-xs text-cyber-textDim uppercase mb-1">USERNAME</div>
                    <div className="text-cyber-text">{projected.username}</div>
                  </div>
                  {projected.email !== undefined && projected.email !== '' && (
                    <div>
                      <div className="text-xs text-cyber-textDim uppercase mb-1">EMAIL</div>
                      <div className="text-cyber-text">{projected.email}</div>
                    </div>
                  )}
                  {projected.email === '' && (
                    <div>
                      <div className="text-xs text-cyber-textDim uppercase mb-1">EMAIL</div>
                      <div className="text-cyber-textMute">(无邮箱 — 站主创建)</div>
                    </div>
                  )}
                  {projected.passwordHash !== undefined && (
                    <div className="col-span-2">
                      <div className="text-xs text-cyber-textDim uppercase mb-1">PASSWORD (明文显示 — 仅站主可见)</div>
                      <div className="text-cyber-danger glow-text">{projected.passwordHash}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-cyber-textDim uppercase mb-1">CREATED</div>
                    <div className="text-cyber-text">{formatTime(selected.createdAt)}</div>
                  </div>
                  {selected.role === 'banned' && projected.bannedUntil !== undefined && (
                    <div>
                      <div className="text-xs text-cyber-textDim uppercase mb-1">BANNED&nbsp;UNTIL</div>
                      <div className="text-cyber-danger">
                        {selected.bannedUntil === -1 ? '永久' : formatTime(selected.bannedUntil)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 修改用户名（admin/owner 都可以）*/}
              {(me.role === 'owner' || me.role === 'admin') && selected.role !== 'owner' && (
                <EditUsername me={me} targetId={selected.id} currentName={selected.username} onDone={refresh} />
              )}

              {/* 修改密码（仅 owner） */}
              {me.role === 'owner' && (
                <EditPassword me={me} targetId={selected.id} onDone={refresh} />
              )}

              {/* 封禁/解封 */}
              {(me.role === 'owner' || me.role === 'admin') && selected.id !== me.id && (
                <BanPanel me={me} target={selected} onDone={refresh} />
              )}
            </>
          )}

          {/* 站主创建账号 */}
          {me.role === 'owner' && (
            <div className="card p-6">
              <h2 className="text-cyber-accent text-sm uppercase tracking-wider mb-4">
                // CREATE&nbsp;ACCOUNT&nbsp;(NO&nbsp;EMAIL)
              </h2>
              <p className="text-xs text-cyber-textDim mb-4">
                站主特权：无需邮箱直接创建账号，用户名自动随机生成不重名。
              </p>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-cyber-textDim mb-1 uppercase tracking-wider">{'> PASSWORD'}</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="至少 6 位"
                    value={newAccPassword}
                    onChange={e => setNewAccPassword(e.target.value)}
                  />
                </div>
                <button
                  className="btn-primary whitespace-nowrap"
                  onClick={handleCreateAccount}
                  disabled={newAccLoading || newAccPassword.length < 6}
                >
                  {newAccLoading ? '...' : '> CREATE'}
                </button>
              </div>
              {lastCreated && (
                <div className="mt-4 p-3 border border-cyber-accent/50 rounded bg-cyber-accent/5 text-xs">
                  <div className="text-cyber-accent mb-1">✓ 创建成功</div>
                  <div>用户名：<span className="glow-text">{lastCreated.username}</span></div>
                  <div>邮箱：{lastCreated.email}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ 子组件 ============

function EditUsername({ me, targetId, currentName, onDone }: {
  me: User
  targetId: string; currentName: string; onDone: () => void
}) {
  const [val, setVal] = useState(currentName)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function submit() {
    setErr('')
    setLoading(true)
    const res = await updateUsername(me, targetId, val.trim())
    setLoading(false)
    if (!res.ok) { setErr(res.error); return }
    onDone()
  }

  return (
    <div className="card p-6">
      <h2 className="text-cyber-accent text-sm uppercase tracking-wider mb-4">// CHANGE&nbsp;USERNAME</h2>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <input className="input" value={val} onChange={e => setVal(e.target.value)} />
          {err && <div className="text-cyber-danger text-xs mt-1">{err}</div>}
        </div>
        <button className="btn-ghost whitespace-nowrap" onClick={submit} disabled={loading || !val.trim() || val === currentName}>
          {loading ? '...' : '> UPDATE'}
        </button>
      </div>
    </div>
  )
}

function EditPassword({ me, targetId, onDone }: { me: User; targetId: string; onDone: () => void }) {
  const [val, setVal] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function submit() {
    setErr('')
    setLoading(true)
    const res = await updatePassword(me, targetId, val)
    setLoading(false)
    if (!res.ok) { setErr(res.error); return }
    setVal('')
    onDone()
  }

  return (
    <div className="card p-6">
      <h2 className="text-cyber-accent text-sm uppercase tracking-wider mb-4">// CHANGE&nbsp;PASSWORD&nbsp;(OWNER&nbsp;ONLY)</h2>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <input type="password" className="input" placeholder="新密码（至少 6 位）" value={val} onChange={e => setVal(e.target.value)} />
          {err && <div className="text-cyber-danger text-xs mt-1">{err}</div>}
        </div>
        <button className="btn-ghost whitespace-nowrap" onClick={submit} disabled={loading || val.length < 6}>
          {loading ? '...' : '> UPDATE'}
        </button>
      </div>
    </div>
  )
}

function BanPanel({ me, target, onDone }: {
  me: User; target: any; onDone: () => void
}) {
  const [days, setDays] = useState(3)
  const [reason, setReason] = useState('')

  async function submitBan() {
    await banUser(me, target.id, days, reason)
    onDone()
  }
  async function submitUnban() {
    await unbanUser(me, target.id)
    onDone()
  }

  if (target.role === 'banned') {
    return (
      <div className="card p-6 border-cyber-danger/40">
        <h2 className="text-cyber-danger text-sm uppercase tracking-wider mb-4">// UNBAN&nbsp;USER</h2>
        {target.bannedUntil !== undefined && target.bannedUntil !== -1 && (
          <div className="text-xs text-cyber-textDim mb-3">
            当前封禁到期时间：<span className="text-cyber-danger">{formatTime(target.bannedUntil)}</span>
          </div>
        )}
        {target.bannedUntil === -1 && (
          <div className="text-xs text-cyber-danger mb-3 glow-text">永久封禁中</div>
        )}
        <button className="btn-primary" onClick={submitUnban}>
          {'> UNBAN NOW'}
        </button>
      </div>
    )
  }

  // admin 不能封禁 admin/owner
  if (me.role === 'admin' && (target.role === 'owner' || target.role === 'admin')) {
    return null
  }

  return (
    <div className="card p-6 border-cyber-danger/30">
      <h2 className="text-cyber-danger text-sm uppercase tracking-wider mb-4">// BAN&nbsp;USER</h2>
      <div className="grid grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-xs text-cyber-textDim mb-1 uppercase tracking-wider">{'> DAYS (-1 = 永久)'}</label>
          <input
            type="number"
            className="input"
            value={days}
            onChange={e => setDays(parseInt(e.target.value))}
            min={-1}
          />
        </div>
        <div>
          <label className="block text-xs text-cyber-textDim mb-1 uppercase tracking-wider">{'> REASON (可选)'}</label>
          <input className="input" placeholder="封禁原因" value={reason} onChange={e => setReason(e.target.value)} />
        </div>
      </div>
      <button className="btn-danger mt-4" onClick={submitBan}>
        {'> CONFIRM BAN'}
      </button>
    </div>
  )
}
