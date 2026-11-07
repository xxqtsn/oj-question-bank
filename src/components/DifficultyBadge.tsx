import type { Difficulty } from '../types'
import { DIFFICULTY_LABELS } from '../types'

const classMap: Record<Difficulty, string> = {
  easy: 'difficulty-easy',
  medium: 'difficulty-medium',
  hard: 'difficulty-hard',
}

export default function DifficultyBadge({ level }: { level: Difficulty }) {
  return <span className={`badge ${classMap[level]}`}>{DIFFICULTY_LABELS[level]}</span>
}
