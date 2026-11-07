import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
    }`

  return (
    <header className="sticky top-0 z-30 bg-neutral-50/80 backdrop-blur border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold text-sm">
            J
          </div>
          <span className="font-semibold tracking-tight group-hover:text-neutral-600 transition-colors">
            JPB OJ
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink to="/" end className={linkClass}>
            首页
          </NavLink>
          <NavLink to="/problems" className={linkClass}>
            题库
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            关于
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
