import { Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ProblemsPage from './pages/ProblemsPage'
import ProblemDetailPage from './pages/ProblemDetailPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'

function RequireAuth({ children, requiredRole }: {
  children: React.ReactNode
  requiredRole?: Array<'owner' | 'admin' | 'user'>
}) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'banned') return <Navigate to="/login" replace />
  if (requiredRole && !requiredRole.includes(user.role as any)) {
    return <div className="max-w-md mx-auto px-6 py-32 text-center font-mono text-cyber-danger">
      ACCESS&nbsp;DENIED — [ PERMISSION_INSUFFICIENT ]
    </div>
  }
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/problems/:slug" element={<ProblemDetailPage />} />
            <Route path="/about" element={<AboutPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 用户管理面板：所有非封禁用户可看，但 admin/owner 有更多操作 */}
            <Route path="/admin" element={
              <RequireAuth requiredRole={['owner', 'admin', 'user']}>
                <AdminPage />
              </RequireAuth>
            } />

            <Route
              path="*"
              element={
                <div className="max-w-3xl mx-auto px-6 py-32 text-center font-mono">
                  <div className="text-7xl text-cyber-danger mb-6 glow-text">ERR_404</div>
                  <h1 className="text-2xl text-cyber-accent mb-2">PAGE&nbsp;NOT&nbsp;FOUND</h1>
                  <p className="text-cyber-textDim">[ resource does not exist ]</p>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
