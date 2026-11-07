import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { Role } from '../auth/types'

const ROLE_LABELS: Record<Role, string> = {
  owner: 'OWNER',
  admin: 'ADMIN',
  user: 'USER',
  banned: 'BANNED',
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-link nav-link-active' : 'nav-link nav-link-inactive'

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 bg-cyber-bg/90 backdrop-blur border-b border-cyber-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded bg-cyber-accent flex items-center justify-center text-cyber-bg font-bold font-mono text-sm shadow-glowSoft">
            J
          </div>
          <span className="font-mono font-bold tracking-widest text-cyber-accent cyber-title">
            JPB&nbsp;OJ
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink to="/" end className={linkClass}>
            [ 首页 ]
          </NavLink>
          <NavLink to="/problems" className={linkClass}>
            [ 题库 ]
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            [ 关于 ]
          </NavLink>
          {user && (user.role === 'owner' || user.role === 'admin' || user.role === 'user') && (
            <NavLink to="/admin" className={linkClass}>
              [ 管理 ]
            </NavLink>
          )}

          <span className="text-cyber-border">|</span>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-cyber-accent">
                <span className="text-cyber-textDim">[</span>
                {ROLE_LABELS[user.role]}
                <span className="text-cyber-textDim">]</span>
                &nbsp;{user.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-mono text-cyber-textDim hover:text-cyber-danger transition-colors"
              >
                [ 退出 ]
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="nav-link nav-link-inactive">登录</Link>
              <Link to="/register" className="btn-primary text-xs !px-3 !py-1.5">
                注册
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
