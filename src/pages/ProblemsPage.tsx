import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { problems } from '../data/problems'
import type { Difficulty } from '../types'
import { ALL_TAGS, DIFFICULTY_LABELS } from '../types'
import DifficultyBadge from '../components/DifficultyBadge'

export default function ProblemsPage() {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const filtered = useMemo(() => {
    return problems.filter(p => {
      const matchSearch = search.trim() === '' || p.title.toLowerCase().includes(search.toLowerCase()) || p.id.toString() === search.trim()
      const matchDifficulty = difficulty === 'all' || p.difficulty === difficulty
      const matchTags = selectedTags.length === 0 || selectedTags.some(tag => p.tags.includes(tag))
      return matchSearch && matchDifficulty && matchTags
    })
  }, [search, difficulty, selectedTags])

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cyber-accent cyber-title font-mono">// PROBLEM SET</h1>
        <p className="text-cyber-textDim mt-2 font-mono text-sm">
          FOUND {filtered.length} RESULTS · TOTAL {problems.length}
        </p>
      </div>

      <div className="card p-5 mb-6 space-y-5">
        <div>
          <label className="block text-xs font-mono text-cyber-textDim uppercase tracking-widest mb-2">
            {'> SEARCH'}
          </label>
          <input type="text" placeholder="problem name or id..." className="input font-mono" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-mono text-cyber-textDim uppercase tracking-widest mb-2">{'> DIFFICULTY'}</label>
          <div className="flex flex-wrap gap-2">
            {(['all', 'easy', 'medium', 'hard'] as const).map(level => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-all rounded ${
                  difficulty === level ? 'bg-cyber-accent text-cyber-bg border-cyber-accent shadow-glowSoft' : 'bg-cyber-bg text-cyber-textDim border-cyber-border hover:border-cyber-accent/50'
                }`}
              >
                {level === 'all' ? 'ALL' : DIFFICULTY_LABELS[level]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-cyber-textDim uppercase tracking-widest mb-2">{'> TAGS'}</label>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map(tag => {
              const active = selectedTags.includes(tag)
              return (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 text-xs font-mono border rounded transition-all ${
                    active ? 'bg-cyber-accent/20 text-cyber-accent border-cyber-accent' : 'bg-cyber-bg text-cyber-textDim border-cyber-border hover:border-cyber-accent/40'
                  }`}
                >
                  #{tag}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-mono text-cyber-textDim uppercase tracking-wider bg-cyber-border/30 border-b border-cyber-border">
          <div className="col-span-1">#</div>
          <div className="col-span-5">TITLE</div>
          <div className="col-span-2 hidden md:block">TAGS</div>
          <div className="col-span-2 text-right hidden md:block">AC%</div>
          <div className="col-span-4 md:col-span-2 text-right">LEVEL</div>
        </div>

        <div className="divide-y divide-cyber-border/50">
          {filtered.length === 0 ? (
            <div className="px-5 py-16 text-center text-cyber-textDim font-mono">[ NO MATCH ]</div>
          ) : (
            filtered.map(p => (
              <Link key={p.id} to={`/problems/${p.slug}`}
                className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-cyber-accent/5 transition-colors group cyber-row"
              >
                <div className="col-span-1 font-mono text-sm text-cyber-textMute">#{String(p.id).padStart(3, '0')}</div>
                <div className="col-span-5 font-mono text-cyber-text group-hover:text-cyber-accent truncate">{p.title}</div>
                <div className="col-span-2 hidden md:flex flex-wrap gap-1">
                  {p.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-xs text-cyber-textDim font-mono">[{tag}]</span>
                  ))}
                </div>
                <div className="col-span-2 text-right text-sm text-cyber-textDim font-mono hidden md:block">{p.acceptance.toFixed(1)}%</div>
                <div className="col-span-4 md:col-span-2 flex justify-end">
                  <DifficultyBadge level={p.difficulty} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
