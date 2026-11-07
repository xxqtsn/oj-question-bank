export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Example {
  input: string
  output: string
  explanation?: string
}

export interface Problem {
  id: number
  title: string
  slug: string
  difficulty: Difficulty
  tags: string[]
  acceptance: number // 通过率 %
  description: string
  examples: Example[]
  constraints?: string[]
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

export const ALL_TAGS = [
  '数组', '字符串', '哈希表', '双指针', '栈', '队列',
  '链表', '二叉树', '递归', '动态规划', '贪心', '排序',
  '二分查找', '回溯', '图论', '位运算', '数学', '堆',
]
