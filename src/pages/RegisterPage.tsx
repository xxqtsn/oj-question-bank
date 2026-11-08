import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { register } from '../auth/api'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (username.trim().length < 2) { setError('用户名至少 2 字符'); return }
    if (password.length < 6) { setError('密码至少 6 位'); return }
    if (password !== confirmPassword) { setError('两次密码不一致'); return }

    setLoading(true)
    const res = await register(email.trim(), username.trim(), password)
    setLoading(false)
    if (!res.ok) {
      setError(res.error || '注册失败')
      return
    }
    setUser(res.user || null)
    navigate('/', { replace: true })
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20 font-mono">
      <div className="card p-8">
        <h1 className="text-2xl text-cyber-accent cyber-title mb-2">// REGISTER</h1>
        <p className="text-cyber-textDim text-xs mb-6 uppercase tracking-wider">create new identity</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-cyber-textDim mb-1 uppercase tracking-wider">{'> EMAIL'}</label>
            <input className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs text-cyber-textDim mb-1 uppercase tracking-wider">{'> USERNAME'}</label>
            <input className="input" placeholder="至少 2 字符" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs text-cyber-textDim mb-1 uppercase tracking-wider">{'> PASSWORD'}</label>
            <input type="password" className="input" placeholder="至少 6 位" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs text-cyber-textDim mb-1 uppercase tracking-wider">{'> CONFIRM PASSWORD'}</label>
            <input type="password" className="input" placeholder="再输一次" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>

          {error && (
            <div className="text-cyber-danger text-xs border border-cyber-danger/50 bg-cyber-danger/5 p-2 rounded">
              [ ERROR ] {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? '...' : '> CREATE ACCOUNT'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-cyber-border text-center text-xs text-cyber-textDim">
          已有账号？ <Link to="/login" className="link-cyber">去登录 →</Link>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-cyber-textMute">
        站主硬编码：<span className="text-cyber-accent">admin@oj.com</span> / <span className="text-cyber-accent">TRAE</span>
      </div>
    </div>
  )
}
