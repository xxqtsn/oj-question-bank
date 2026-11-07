import { Link } from 'react-router-dom'
import { problems } from '../data/problems'
import DifficultyBadge from '../components/DifficultyBadge'

export default function HomePage() {
  const totalProblems = problems.length
  const easyCount = problems.filter(p => p.difficulty === 'easy').length
  const mediumCount = problems.filter(p => p.difficulty === 'medium').length
  const hardCount = problems.filter(p => p.difficulty === 'hard').length
  const featured = problems.slice(0, 4)

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero */}
      <section className="py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs text-neutral-600 bg-neutral-100 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          题库持续更新中
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          算法练习，
          <br />
          让 <span className="text-neutral-400">just passing by</span> 变得不只是路过。
        </h1>
        <p className="text-lg text-neutral-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          一个极简的在线算法题库，专注于清晰的题目呈现和无干扰的刷题体验。
          支持按难度、标签筛选，让你快速找到适合自己的那道题。
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/problems" className="btn-primary">
            开始刷题 →
          </Link>
          <Link to="/about" className="btn-ghost">
            了解更多
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {[
          { label: '题目总数', value: totalProblems, accent: 'text-neutral-900' },
          { label: '简单', value: easyCount, accent: 'text-emerald-600' },
          { label: '中等', value: mediumCount, accent: 'text-amber-600' },
          { label: '困难', value: hardCount, accent: 'text-rose-600' },
        ].map(stat => (
          <div key={stat.label} className="card p-6 text-center">
            <div className={`text-3xl font-bold mb-1 ${stat.accent}`}>{stat.value}</div>
            <div className="text-sm text-neutral-500">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Featured Problems */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">精选题目</h2>
            <p className="text-neutral-500 text-sm mt-1">从经典算法题开始你的旅程</p>
          </div>
          <Link to="/problems" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            查看全部 →
          </Link>
        </div>

        <div className="grid gap-3">
          {featured.map(problem => (
            <Link
              key={problem.id}
              to={`/problems/${problem.slug}`}
              className="card p-5 flex items-center justify-between hover:border-neutral-900/30 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="font-mono text-sm text-neutral-400 w-8 shrink-0">
                  #{problem.id}
                </span>
                <div className="min-w-0">
                  <h3 className="font-medium text-neutral-900 group-hover:underline decoration-neutral-300 underline-offset-2 truncate">
                    {problem.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {problem.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs text-neutral-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-sm text-neutral-400">
                  {problem.acceptance.toFixed(1)}%
                </span>
                <DifficultyBadge level={problem.difficulty} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
