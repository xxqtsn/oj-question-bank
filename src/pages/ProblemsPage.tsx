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
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const filtered = useMemo(() => {
    return problems.filter(p => {
      const matchSearch =
        search.trim() === '' ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toString() === search.trim()

      const matchDifficulty =
        difficulty === 'all' || p.difficulty === difficulty

      const matchTags =
        selectedTags.length === 0 ||
        selectedTags.some(tag => p.tags.includes(tag))

      return matchSearch && matchDifficulty && matchTags
    })
  }, [search, difficulty, selectedTags])

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">题库</h1>
        <p className="text-neutral-500 mt-2">
          共 {filtered.length} 道题 · 总 {problems.length} 道
        </p>
      </div>

      {/* Filters */}
      <div className="card p-5 mb-6 space-y-5">
        {/* Search */}
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2">
            搜索
          </label>
          <input
            type="text"
            placeholder="输入题目名称或编号..."
            className="input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2">
            难度
          </label>
          <div className="flex flex-wrap gap-2">
            {(['all', 'easy', 'medium', 'hard'] as const).map(level => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  difficulty === level
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {level === 'all' ? '全部' : DIFFICULTY_LABELS[level]}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-2">
            标签
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map(tag => {
              const active = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    active
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-neutral-500 bg-neutral-50 border-b border-neutral-200">
          <div className="col-span-1">#</div>
          <div className="col-span-5">题目</div>
          <div className="col-span-2 hidden md:block">标签</div>
          <div className="col-span-2 text-right hidden md:block">通过率</div>
          <div className="col-span-4 md:col-span-2 text-right">难度</div>
        </div>

        <div className="divide-y divide-neutral-100">
          {filtered.length === 0 ? (
            <div className="px-5 py-16 text-center text-neutral-400">
              没有匹配的题目
            </div>
          ) : (
            filtered.map(p => (
              <Link
                key={p.id}
                to={`/problems/${p.slug}`}
                className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-neutral-50 transition-colors group"
              >
                <div className="col-span-1 font-mono text-sm text-neutral-400">
                  {p.id}
                </div>
                <div className="col-span-5 font-medium group-hover:text-neutral-700 truncate">
                  {p.title}
                </div>
                <div className="col-span-2 hidden md:flex flex-wrap gap-1">
                  {p.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="col-span-2 text-right text-sm text-neutral-500 hidden md:block">
                  {p.acceptance.toFixed(1)}%
                </div>
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
