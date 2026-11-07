import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { login } from '../auth/api'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await login(identifier.trim(), password)
    setLoading(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setUser(res.user)
    navigate('/', { replace: true })
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20 font-mono">
      <div className="card p-8">
        <h1 className="text-2xl text-cyber-accent cyber-title mb-2">// LOGIN</h1>
        <p className="text-cyber-textDim text-xs mb-6 uppercase tracking-wider">authenticate identity</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-cyber-textDim mb-1 uppercase tracking-wider">{'> USERNAME / EMAIL'}</label>
            <input
              className="input"
              placeholder="username"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-cyber-textDim mb-1 uppercase tracking-wider">{'> PASSWORD'}</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="text-cyber-danger text-xs border border-cyber-danger/50 bg-cyber-danger/5 p-2 rounded">
              [ ERROR ] {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? '...' : '> ENTER'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-cyber-border text-center text-xs text-cyber-textDim">
          还没有账号？ <Link to="/register" className="link-cyber">立即注册 →</Link>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-cyber-textMute">
        站主硬编码：<span className="text-cyber-accent">admin@oj.com</span> / <span className="text-cyber-accent">TRAE</span>
      </div>
    </div>
  )
}
