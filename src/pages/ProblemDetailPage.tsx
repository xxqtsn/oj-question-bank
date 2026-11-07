import { Link, useParams } from 'react-router-dom'
import { getProblemBySlug } from '../data/problems'
import DifficultyBadge from '../components/DifficultyBadge'

export default function ProblemDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const problem = slug ? getProblemBySlug(slug) : undefined

  if (!problem) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center font-mono">
        <div className="text-6xl mb-6 text-cyber-danger">ERR_404</div>
        <h1 className="text-2xl text-cyber-accent mb-2">PROBLEM NOT FOUND</h1>
        <p className="text-cyber-textDim mb-6">[ object does not exist in database ]</p>
        <Link to="/problems" className="btn-primary">← BACK</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-6 font-mono">
        <Link to="/problems" className="text-cyber-accent link-cyber">← ../problems</Link>
      </div>

      <header className="mb-8 pb-6 border-b border-cyber-border">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-3 font-mono">
              <span className="text-cyber-textMute">#{String(problem.id).padStart(3, '0')}</span>
              <DifficultyBadge level={problem.difficulty} />
            </div>
            <h1 className="text-3xl font-bold text-cyber-accent cyber-title font-mono">{problem.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 flex-wrap font-mono">
          {problem.tags.map(tag => (
            <span key={tag} className="text-xs text-cyber-textDim border border-cyber-border px-2 py-1 rounded">[#{tag}]</span>
          ))}
          <span className="text-xs text-cyber-textMute ml-2">AC {problem.acceptance.toFixed(1)}%</span>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="text-xs font-mono text-cyber-textDim uppercase tracking-widest mb-4">// DESCRIPTION</h2>
        <div className="text-cyber-text leading-relaxed font-mono whitespace-pre-line">
          {problem.description}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xs font-mono text-cyber-textDim uppercase tracking-widest mb-4">// EXAMPLES</h2>
        <div className="space-y-4">
          {problem.examples.map((ex, idx) => (
            <div key={idx} className="card overflow-hidden">
              <div className="px-4 py-2 text-xs font-mono text-cyber-accent bg-cyber-accent/10 border-b border-cyber-border">
                EXAMPLE_{idx + 1}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-xs font-mono text-cyber-textDim mb-1">INPUT</div>
                  <pre className="font-mono text-sm bg-cyber-bg border border-cyber-border rounded p-3 overflow-x-auto whitespace-pre-wrap break-all text-cyber-accent">
                    <code>{ex.input}</code>
                  </pre>
                </div>
                <div>
                  <div className="text-xs font-mono text-cyber-textDim mb-1">OUTPUT</div>
                  <pre className="font-mono text-sm bg-cyber-bg border border-cyber-border rounded p-3 overflow-x-auto whitespace-pre-wrap break-all text-cyber-accent">
                    <code>{ex.output}</code>
                  </pre>
                </div>
                {ex.explanation && (
                  <div>
                    <div className="text-xs font-mono text-cyber-textDim mb-1">EXPLANATION</div>
                    <div className="text-sm text-cyber-text font-mono leading-relaxed whitespace-pre-line">{ex.explanation}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {problem.constraints && problem.constraints.length > 0 && (
        <section>
          <h2 className="text-xs font-mono text-cyber-textDim uppercase tracking-widest mb-4">// CONSTRAINTS</h2>
          <ul className="space-y-1.5 font-mono text-cyber-textDim">
            {problem.constraints.map((c, idx) => (
              <li key={idx}>· {c}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
