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
      <section className="py-16 text-center relative">
        {/* 扫描线装饰 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-cyber-accent to-transparent" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs text-cyber-accent bg-cyber-accent/10 border border-cyber-accent/50 rounded mb-8 font-mono tracking-[0.2em]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-accent animate-pulse shadow-glowSoft" />
          SYSTEM ONLINE &nbsp;·&nbsp; v1.0.0
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-black mb-4 tracking-tight">
          <span className="text-cyber-accent cyber-title">JPB</span>
          <span className="text-cyber-text">&nbsp;OJ</span>
        </h1>
        <h2 className="font-display text-xl md:text-2xl text-cyber-textDim tracking-[0.15em] mb-6 font-bold">
          // 算法题库 · JUST&nbsp;PASSING&nbsp;BY
        </h2>

        <p className="text-cyber-textDim max-w-xl mx-auto mb-10 leading-relaxed font-mono text-sm">
          <span className="text-cyber-accent">$</span> cat ./manifest.json
          <br />
          <span className="text-cyber-textMute">
            {'>'} 极简界面 · 清晰题意 · 专注刷题 · 零干扰
          </span>
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/problems" className="btn-primary animate-pulseGlow font-display tracking-widest">
            ▶ 开始刷题
          </Link>
          <Link to="/register" className="btn-ghost font-mono tracking-wider">
            [ 创建账号 ]
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {[
          { label: '题库总数', value: totalProblems, accent: 'text-cyber-accent' },
          { label: '简单', value: easyCount, accent: 'text-emerald-400' },
          { label: '中等', value: mediumCount, accent: 'text-amber-400' },
          { label: '困难', value: hardCount, accent: 'text-rose-400' },
        ].map(stat => (
          <div key={stat.label} className="card p-6 text-center group hover:border-cyber-accent/60 transition-all">
            <div className={`text-4xl font-bold mb-2 font-display ${stat.accent} glow-text`}>{stat.value}</div>
            <div className="text-xs text-cyber-textDim font-mono tracking-widest">{stat.label}</div>
            <div className="mt-2 text-xs text-cyber-textMute font-mono">/ stat</div>
          </div>
        ))}
      </section>

      {/* Featured */}
      <section>
        <div className="flex items-end justify-between mb-6 border-b border-cyber-border pb-3">
          <div>
            <h2 className="font-display text-2xl text-cyber-accent cyber-title font-bold tracking-wider">精选题目</h2>
            <p className="text-cyber-textDim text-sm mt-1 font-mono">// 新手推荐 · curated for beginners</p>
          </div>
          <Link to="/problems" className="text-cyber-accent text-sm link-cyber font-mono">
            全部题库 →
          </Link>
        </div>

        <div className="grid gap-3">
          {featured.map(problem => (
            <Link
              key={problem.id}
              to={`/problems/${problem.slug}`}
              className="card p-5 flex items-center justify-between hover:border-cyber-accent/60 transition-all group hover:shadow-glowSoft"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="font-mono text-sm text-cyber-textMute w-12 shrink-0 text-right">
                  #{String(problem.id).padStart(3, '0')}
                </span>
                <div className="min-w-0">
                  <h3 className="text-cyber-text group-hover:text-cyber-accent transition-colors font-mono font-bold text-lg">
                    {problem.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {problem.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs text-cyber-textDim font-mono">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-sm text-cyber-textMute font-mono">
                  AC {problem.acceptance.toFixed(1)}%
                </span>
                <DifficultyBadge level={problem.difficulty} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Terminal banner */}
      <section className="mt-16 card p-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-rose-500/70" />
          <div className="w-3 h-3 rounded-full bg-amber-500/70" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          <span className="text-xs text-cyber-textMute font-mono ml-2">~/jpj-oj</span>
        </div>
        <pre className="font-mono text-sm text-cyber-textDim leading-relaxed whitespace-pre-wrap">
<span className="text-cyber-accent">$</span> git push origin main
<span className="text-emerald-400">[OK]</span> Everything up-to-date
<span className="text-cyber-accent">$</span> npm run build
<span className="text-emerald-400">[OK]</span> ✓ 48 modules transformed
<span className="text-cyber-accent">$</span> echo "欢迎来到 JPB OJ"
<span className="text-cyber-text">欢迎来到 JPB OJ — 祝你 AC 一切顺利</span>
<span className="text-cyber-accent">$</span> <span className="animate-pulse">▌</span>
        </pre>
      </section>
    </div>
  )
}
