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
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs text-cyber-accent bg-cyber-accent/10 border border-cyber-border-bright rounded mb-6 font-mono uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-accent animate-pulse" />
          SYSTEM ONLINE
        </div>
        <h1 className="text-5xl md:text-6xl font-bold cyber-title mb-6 font-mono">
          JUST&nbsp;PASSING&nbsp;BY
          <br />
          <span className="text-cyber-textDim">// ALGORITHM&nbsp;OJ</span>
        </h1>
        <p className="text-cyber-textDim max-w-2xl mx-auto mb-8 leading-relaxed font-mono">
          <span className="text-cyber-accent">$</span> A minimalist online judge — 
          clear statements, clean UI, zero distractions.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/problems" className="btn-primary animate-pulseGlow">
            ./start_shooting.exe →
          </Link>
          <Link to="/about" className="btn-ghost">
            cat README.md
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {[
          { label: 'TOTAL', value: totalProblems, accent: 'text-cyber-accent' },
          { label: 'EASY', value: easyCount, accent: 'text-emerald-400' },
          { label: 'MEDIUM', value: mediumCount, accent: 'text-amber-400' },
          { label: 'HARD', value: hardCount, accent: 'text-rose-400' },
        ].map(stat => (
          <div key={stat.label} className="card p-6 text-center">
            <div className={`text-3xl font-bold mb-1 font-mono ${stat.accent} glow-text`}>{stat.value}</div>
            <div className="text-xs text-cyber-textDim font-mono uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Featured */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-cyber-accent cyber-title font-mono">FEATURED</h2>
            <p className="text-cyber-textDim text-sm mt-1 font-mono">// curated for beginners</p>
          </div>
          <Link to="/problems" className="text-cyber-accent text-sm link-cyber font-mono">
            ALL &gt;
          </Link>
        </div>

        <div className="grid gap-3">
          {featured.map(problem => (
            <Link
              key={problem.id}
              to={`/problems/${problem.slug}`}
              className="card p-5 flex items-center justify-between hover:border-cyber-accent/60 transition-all group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="font-mono text-sm text-cyber-textMute w-10 shrink-0">
                  #{String(problem.id).padStart(3, '0')}
                </span>
                <div className="min-w-0">
                  <h3 className="text-cyber-text group-hover:text-cyber-accent transition-colors font-mono">
                    {problem.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {problem.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs text-cyber-textDim font-mono">[{tag}]</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-sm text-cyber-textMute font-mono">
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
