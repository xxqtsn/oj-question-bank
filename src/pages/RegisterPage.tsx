import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { sendRegisterCode, verifyCode, finishRegister } from '../auth/api'

type Step = 1 | 2 | 3

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [sentCode, setSentCode] = useState<string | null>(null)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  async function handleSendCode() {
    setError('')
    setLoading(true)
    const res = await sendRegisterCode(email.trim())
    setLoading(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setSentCode(res.code)
    setCooldown(60)
    const timer = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) { clearInterval(timer); return 0 }
        return c - 1
      })
    }, 1000)
  }

  async function handleVerify() {
    setError('')
    setLoading(true)
    const res = await verifyCode(email.trim(), code.trim())
    setLoading(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setStep(3)
  }

  async function handleFinish() {
    setError('')
    if (username.trim().length < 2) { setError('用户名至少 2 字符'); return }
    if (password.length < 6) { setError('密码至少 6 位'); return }
    if (password !== confirmPassword) { setError('两次密码不一致'); return }

    setLoading(true)
    const res = await finishRegister(email.trim(), username.trim(), password)
    setLoading(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setUser(res.user)
    navigate('/', { replace: true })
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16 font-mono">
      <div className="card p-8">
        <h1 className="text-2xl text-cyber-accent cyber-title mb-2">// REGISTER</h1>
        <p className="text-cyber-textDim text-xs mb-6 uppercase tracking-wider">
          step {step} / 3 — {step === 1 ? 'verify email' : step === 2 ? 'enter code' : 'set profile'}
        </p>

        {/* Step 1: 邮箱 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-cyber-textDim mb-1 uppercase tracking-wider">{'> EMAIL'}</label>
              <input className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {error && <div className="text-cyber-danger text-xs border border-cyber-danger/50 p-2 rounded">[ ERROR ] {error}</div>}
            <button
              className="btn-primary w-full disabled:opacity-50"
              onClick={handleSendCode}
              disabled={loading || cooldown > 0}
            >
              {loading ? '...' : cooldown > 0 ? `重新发送 (${cooldown}s)` : '> SEND CODE'}
            </button>
            {sentCode && (
              <div className="text-center text-xs text-cyber-accent border border-dashed border-cyber-accent/50 p-3 rounded">
                🎉 Mock 模式：验证码已发送到控制台<br />
                <span className="text-lg glow-text font-bold">{sentCode}</span>
                <br />
                <span className="text-cyber-textDim">（按 F12 打开 Console 也能看到）</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: 验证码 */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-xs text-cyber-textDim">验证码已发送至 <span className="text-cyber-accent">{email}</span></div>
            <div>
              <label className="block text-xs text-cyber-textDim mb-1 uppercase tracking-wider">{'> VERIFICATION CODE'}</label>
              <input className="input text-center text-lg tracking-widest" placeholder="000000" value={code} onChange={e => setCode(e.target.value.slice(0, 6))} maxLength={6} required />
            </div>
            {error && <div className="text-cyber-danger text-xs border border-cyber-danger/50 p-2 rounded">[ ERROR ] {error}</div>}
            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => setStep(1)}>← BACK</button>
              <button className="btn-primary flex-1" onClick={handleVerify} disabled={loading}>
                {loading ? '...' : '> VERIFY'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 用户名 + 密码 */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-xs text-cyber-accent">✓ 邮箱验证通过：{email}</div>
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
            {error && <div className="text-cyber-danger text-xs border border-cyber-danger/50 p-2 rounded">[ ERROR ] {error}</div>}
            <button className="btn-primary w-full" onClick={handleFinish} disabled={loading}>
              {loading ? '...' : '> CREATE ACCOUNT'}
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-cyber-border text-center text-xs text-cyber-textDim">
          已有账号？ <Link to="/login" className="link-cyber">去登录 →</Link>
        </div>
      </div>
    </div>
  )
}
