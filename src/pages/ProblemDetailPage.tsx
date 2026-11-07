import { Link, useParams } from 'react-router-dom'
import { getProblemBySlug } from '../data/problems'
import DifficultyBadge from '../components/DifficultyBadge'

export default function ProblemDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const problem = slug ? getProblemBySlug(slug) : undefined

  if (!problem) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="text-6xl mb-6">😕</div>
        <h1 className="text-2xl font-bold mb-2">题目不存在</h1>
        <p className="text-neutral-500 mb-6">
          抱歉，我们找不到这道题。它可能已经被移除了。
        </p>
        <Link to="/problems" className="btn-primary">
          返回题库
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/problems" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
          ← 返回题库
        </Link>
      </div>

      {/* Header */}
      <header className="mb-8 pb-6 border-b border-neutral-200">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-sm text-neutral-400">#{problem.id}</span>
              <DifficultyBadge level={problem.difficulty} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{problem.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {problem.tags.map(tag => (
            <span
              key={tag}
              className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
          <span className="text-xs text-neutral-400 ml-2">
            通过率 {problem.acceptance.toFixed(1)}%
          </span>
        </div>
      </header>

      {/* Description */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          题目描述
        </h2>
        <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-neutral-800 whitespace-pre-line">
          {problem.description}
        </div>
      </section>

      {/* Examples */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          示例
        </h2>
        <div className="space-y-4">
          {problem.examples.map((ex, idx) => (
            <div key={idx} className="card overflow-hidden">
              <div className="px-4 py-2 text-xs font-medium text-neutral-500 bg-neutral-50 border-b border-neutral-200">
                示例 {idx + 1}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-xs font-medium text-neutral-400 mb-1">输入</div>
                  <pre className="font-mono text-sm bg-neutral-50 border border-neutral-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
                    <code>{ex.input}</code>
                  </pre>
                </div>
                <div>
                  <div className="text-xs font-medium text-neutral-400 mb-1">输出</div>
                  <pre className="font-mono text-sm bg-neutral-50 border border-neutral-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
                    <code>{ex.output}</code>
                  </pre>
                </div>
                {ex.explanation && (
                  <div>
                    <div className="text-xs font-medium text-neutral-400 mb-1">解释</div>
                    <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                      {ex.explanation}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Constraints */}
      {problem.constraints && problem.constraints.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
            约束条件
          </h2>
          <ul className="space-y-1.5">
            {problem.constraints.map((c, idx) => (
              <li key={idx} className="font-mono text-sm text-neutral-700">
                · {c}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
