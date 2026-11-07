import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ProblemsPage from './pages/ProblemsPage'
import ProblemDetailPage from './pages/ProblemDetailPage'
import AboutPage from './pages/AboutPage'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/problems" element={<ProblemsPage />} />
          <Route path="/problems/:slug" element={<ProblemDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="*"
            element={
              <div className="max-w-3xl mx-auto px-6 py-32 text-center">
                <div className="text-7xl mb-6">404</div>
                <h1 className="text-2xl font-bold mb-2">页面走丢了</h1>
                <p className="text-neutral-500">请检查网址或返回首页</p>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
