import type { Difficulty } from '../types'
import { DIFFICULTY_LABELS } from '../types'

const classMap: Record<Difficulty, string> = {
  easy: 'badge difficulty-easy',
  medium: 'badge difficulty-medium',
  hard: 'badge difficulty-hard',
}

export default function DifficultyBadge({ level }: { level: Difficulty }) {
  return <span className={classMap[level]}>{DIFFICULTY_LABELS[level]}</span>
}
