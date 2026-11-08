import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { listUsers, updateUser, banUser, unbanUser, createOwnerAccount } from '../auth/api'
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

function formatTime(ts?: number | string | null): string {
  if (ts == null) return '-'
  if (ts === -1) return '永久封禁'
  const n = typeof ts === 'string' ? parseInt(ts) : ts
  return new Date(n).toLocaleString()
}

export default function AdminPage() {
  const { user: me, refresh, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null)

  const canSeePanel = me && (me.role === 'owner' || me.role === 'admin' || me.role === 'user')

  async function load() {
    if (!me) return
    setLoading(true)
    const data = await listUsers(search || undefined)
    if (data.ok) setUsers(data.users)
    setLoading(false)
  }

  useEffect(() => { load() }, [me, search])

  if (authLoading || loading) {
    return <div className="text-center py-20 text-cyber-textDim font-mono">LOADING...</div>
  }
  if (!me || !canSeePanel) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center font-mono text-cyber-danger">
        ACCESS DENIED — [ ERR_BANNED ]
      </div>
    )
  }

  const selected = users.find(u => u.id === selectedId) || null

  async function handleUpdate(field: string, value: string) {
    if (!selected) return
    const body: Record<string, string> = {}
    if (field === 'username') body.username = value
    if (field === 'password') body.password = value
    if (field === 'role') body.role = value
    const res = await updateUser(selected.id, body)
    setToast({ ok: !!res.ok, msg: res.ok ? '修改成功' : (res.error || '修改失败') })
    if (res.ok) await load()
    setTimeout(() => setToast(null), 3000)
  }

  async function handleBan(days: number) {
    if (!selected) return
    const res = await banUser(selected.id, days)
    setToast({ ok: !!res.ok, msg: res.ok ? (days === -1 ? '已永久封禁' : `已封禁 ${days} 天`) : (res.error || '失败') })
    if (res.ok) await load()
    setTimeout(() => setToast(null), 3000)
  }

  async function handleUnban() {
    if (!selected) return
    const res = await unbanUser(selected.id)
    setToast({ ok: !!res.ok, msg: res.ok ? '已解封' : (res.error || '失败') })
    if (res.ok) await load()
    setTimeout(() => setToast(null), 3000)
  }

  const showEmail = (me.role === 'owner' || me.role === 'admin')

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 font-mono">
      <div className="flex items-end justify-between mb-6 border-b border-cyber-border pb-3">
        <div>
          <h1 className="font-display text-3xl text-cyber-accent cyber-title font-bold">// 用户管理</h1>
          <p className="text-cyber-textDim text-xs mt-1">当前身份：<span className="text-cyber-accent">{ROLE_LABELS[me.role]}</span> ({me.username})</p>
        </div>
        <button onClick={() => load()} className="btn-ghost text-sm">↻ 刷新</button>
      </div>

      {toast && (
        <div className={`mb-4 p-3 border rounded text-sm ${toast.ok ? 'border-cyber-accent/50 text-cyber-accent bg-cyber-accent/10' : 'border-cyber-danger/50 text-cyber-danger bg-cyber-danger/10'}`}>
          [{toast.ok ? 'OK' : 'ERROR'}] {toast.msg}
        </div>
      )}

      {me.role === 'owner' && <CreateOwnerCard onCreated={load} />}

      <div className="mb-4">
        <input
          className="input w-full"
          placeholder="搜索用户名或邮箱..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/60 text-cyber-textDim text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">用户名</th>
              <th className="px-4 py-3 text-left">邮箱</th>
              <th className="px-4 py-3 text-left">角色</th>
              <th className="px-4 py-3 text-left">封禁</th>
              <th className="px-4 py-3 text-left">密码</th>
              <th className="px-4 py-3 text-left">创建时间</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const isSel = selected?.id === u.id
              return (
                <tr
                  key={u.id}
                  onClick={() => setSelectedId(u.id)}
                  className={`border-t border-cyber-border/50 hover:bg-cyber-accent/5 cursor-pointer ${isSel ? 'bg-cyber-accent/10' : ''}`}
                >
                  <td className="px-4 py-3 text-cyber-text font-bold">{u.username}</td>
                  <td className="px-4 py-3 text-cyber-textDim">{showEmail ? u.email : '***'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 border text-xs rounded ${ROLE_COLORS[u.role as Role]}`}>
                      {ROLE_LABELS[u.role as Role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cyber-danger text-xs">{u.role === 'banned' ? formatTime(u.bannedUntil) : '-'}</td>
                  <td className="px-4 py-3 text-cyber-textMute text-xs">
                    {me.role === 'owner' && u.passwordHash ? '******' : '-'}
                  </td>
                  <td className="px-4 py-3 text-cyber-textMute text-xs">{formatTime(u.createdAt)}</td>
                  <td className="px-4 py-3">{isSel ? <span className="text-cyber-accent">▶</span> : ''}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <UserActionPanel
          me={me}
          user={selected}
          onUpdate={handleUpdate}
          onBan={handleBan}
          onUnban={handleUnban}
        />
      )}

      {me.role === 'owner' && selected && selected.role !== 'owner' && (
        <div className="card mt-4 p-6">
          <h3 className="text-cyber-accent mb-3 font-bold">// 角色升级：{selected.username}</h3>
          <div className="flex gap-2 flex-wrap">
            {selected.role !== 'admin' && (
              <button className="btn-ghost" onClick={() => handleUpdate('role', 'admin')}>→ 设为管理员</button>
            )}
            {selected.role !== 'user' && (
              <button className="btn-ghost" onClick={() => handleUpdate('role', 'user')}>→ 设为普通用户</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CreateOwnerCard({ onCreated }: { onCreated: () => void }) {
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [last, setLast] = useState<{ username: string; email: string } | null>(null)
  const [err, setErr] = useState('')

  async function submit() {
    setErr('')
    if (pwd.length < 6) { setErr('密码至少 6 位'); return }
    setLoading(true)
    const res = await createOwnerAccount(pwd)
    setLoading(false)
    if (res.ok && res.username && res.email) {
      setLast({ username: res.username, email: res.email })
      setPwd('')
      onCreated()
    } else {
      setErr(res.error || '创建失败')
    }
  }

  return (
    <div className="card mb-4 p-6 border-fuchsia-800/50">
      <h3 className="text-fuchsia-400 mb-3 font-bold">// 站主：免邮箱创建新账号</h3>
      <div className="flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-cyber-textDim mb-1">初始密码（至少 6 位）</label>
          <input type="password" className="input" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="新账号密码" />
        </div>
        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? '...' : '▶ 创建'}
        </button>
      </div>
      {err && <div className="text-cyber-danger text-xs mt-2">[ ERROR ] {err}</div>}
      {last && (
        <div className="mt-3 p-3 border border-cyber-accent/50 rounded bg-cyber-accent/5 text-sm">
          <div className="text-cyber-accent">✓ 创建成功！</div>
          <div className="text-cyber-textDim mt-1">用户名：<span className="text-cyber-text font-bold">{last.username}</span></div>
          <div className="text-cyber-textDim">邮箱：<span className="text-cyber-text">{last.email}</span></div>
        </div>
      )}
    </div>
  )
}

function UserActionPanel({
  me, user, onUpdate, onBan, onUnban,
}: {
  me: User
  user: User
  onUpdate: (field: string, value: string) => void
  onBan: (days: number) => void
  onUnban: () => void
}) {
  const [newName, setNewName] = useState(user.username)
  const [newPwd, setNewPwd] = useState('')
  const [banDays, setBanDays] = useState('')

  const canEditName = me.role === 'owner' || (me.role === 'admin' && user.role !== 'owner')
  const canEditPwd = me.role === 'owner'
  const canBan = (me.role === 'owner' && user.role !== 'owner') || (me.role === 'admin' && user.role === 'user')
  const canUnban = me.role === 'owner' || (me.role === 'admin' && user.role !== 'owner')

  return (
    <div className="card mt-4 p-6 space-y-6">
      <h3 className="text-cyber-accent font-bold">// 操作面板：{user.username}</h3>

      {canEditName && (
        <div>
          <label className="block text-xs text-cyber-textDim mb-1">修改用户名</label>
          <div className="flex gap-2">
            <input className="input flex-1" value={newName} onChange={e => setNewName(e.target.value)} />
            <button className="btn-ghost" onClick={() => onUpdate('username', newName)}>保存</button>
          </div>
        </div>
      )}

      {canEditPwd && (
        <div>
          <label className="block text-xs text-cyber-textDim mb-1">重置密码</label>
          <div className="flex gap-2">
            <input type="password" className="input flex-1" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="新密码（至少 6 位）" />
            <button className="btn-ghost" onClick={() => { if (newPwd.length >= 6) onUpdate('password', newPwd) }}>重置</button>
          </div>
        </div>
      )}

      {user.role !== 'banned' && canBan && (
        <div>
          <label className="block text-xs text-cyber-textDim mb-1">封禁用户（填天数，-1 为永久）</label>
          <div className="flex gap-2">
            <input className="input flex-1" value={banDays} onChange={e => setBanDays(e.target.value)} placeholder="比如 7 / 30 / -1" />
            <button
              className="px-3 py-2 border border-cyber-danger/50 text-cyber-danger rounded hover:bg-cyber-danger/10 text-sm"
              onClick={() => { const d = parseInt(banDays); if (!isNaN(d)) onBan(d) }}
            >
              封禁
            </button>
          </div>
        </div>
      )}

      {user.role === 'banned' && canUnban && (
        <button className="btn-primary" onClick={onUnban}>✓ 解封用户</button>
      )}
    </div>
  )
}
