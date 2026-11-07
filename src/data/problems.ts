import type { Problem } from '../types'

export const problems: Problem[] = [
  {
    id: 1,
    title: '两数之和',
    slug: 'two-sum',
    difficulty: 'easy',
    tags: ['数组', '哈希表'],
    acceptance: 54.3,
    description: `给定一个整数数组 \`nums\` 和一个整数目标值 \`target\`，请你在该数组中找出 **和为目标值** \`target\` 的那 **两个** 整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。

你可以按任意顺序返回答案。`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: '因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10⁴',
      '-10⁹ <= nums[i] <= 10⁹',
      '-10⁹ <= target <= 10⁹',
      '只会存在一个有效答案',
    ],
  },
  {
    id: 2,
    title: '回文数',
    slug: 'palindrome-number',
    difficulty: 'easy',
    tags: ['数学'],
    acceptance: 55.1,
    description: `给你一个整数 \`x\` ，如果 \`x\` 是一个回文整数，返回 \`true\` ；否则，返回 \`false\` 。

回文数是指正序（从左向右）和倒序（从右向左）读都是一样的整数。`,
    examples: [
      { input: 'x = 121', output: 'true', explanation: '121 从左向右读和从右向左读都是 121。' },
      { input: 'x = -121', output: 'false', explanation: '从左向右读为 -121，从右向左读为 121-，因此它不是回文数。' },
      { input: 'x = 10', output: 'false', explanation: '从右向左读为 01，因此它不是回文数。' },
    ],
    constraints: ['-2³¹ <= x <= 2³¹ - 1'],
  },
  {
    id: 3,
    title: '反转链表',
    slug: 'reverse-linked-list',
    difficulty: 'easy',
    tags: ['链表', '递归'],
    acceptance: 73.2,
    description: `给你单链表的头节点 \`head\` ，请你反转链表，并返回反转后的链表。`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
      { input: 'head = []', output: '[]' },
    ],
    constraints: ['链表中节点的数目范围是 [0, 5000]', '-5000 <= Node.val <= 5000'],
  },
  {
    id: 4,
    title: '无重复字符的最长子串',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'medium',
    tags: ['哈希表', '字符串', '滑动窗口'],
    acceptance: 34.8,
    description: `给定一个字符串 \`s\` ，请你找出其中不含有重复字符的 **最长子串** 的长度。`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: '因为无重复字符的最长子串是 "abc"，所以其长度为 3。' },
      { input: 's = "bbbbb"', output: '1', explanation: '因为无重复字符的最长子串是 "b"，所以其长度为 1。' },
      { input: 's = "pwwkew"', output: '3', explanation: '因为无重复字符的最长子串是 "wke"，所以其长度为 3。' },
    ],
    constraints: ['0 <= s.length <= 5 * 10⁴', 's 由英文字母、数字、符号和空格组成'],
  },
  {
    id: 5,
    title: '最长公共前缀',
    slug: 'longest-common-prefix',
    difficulty: 'easy',
    tags: ['字符串', '字典树'],
    acceptance: 43.2,
    description: `编写一个函数来查找字符串数组中的最长公共前缀。

如果不存在公共前缀，返回空字符串 \`""\`。`,
    examples: [
      { input: 'strs = ["flower","flow","flight"]', output: '"fl"' },
      { input: 'strs = ["dog","racecar","car"]', output: '""', explanation: '输入不存在公共前缀。' },
    ],
    constraints: ['1 <= strs.length <= 200', '0 <= strs[i].length <= 200'],
  },
  {
    id: 6,
    title: '三数之和',
    slug: '3sum',
    difficulty: 'medium',
    tags: ['数组', '双指针', '排序'],
    acceptance: 35.9,
    description: `给你一个整数数组 \`nums\` ，判断是否存在三元组 \`[nums[i], nums[j], nums[k]]\` 满足 \`i != j\`、\`i != k\` 且 \`j != k\` ，同时还满足 \`nums[i] + nums[j] + nums[k] == 0\` 。请你返回所有和为 \`0\` 且不重复的三元组。

**注意：** 答案中不可以包含重复的三元组。`,
    examples: [
      {
        input: 'nums = [-1,0,1,2,-1,-4]',
        output: '[[-1,-1,2],[-1,0,1]]',
        explanation: 'nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0\nnums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0\nnums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0\n不同的三元组是 [-1, 0, 1] 和 [-1, -1, 2]。\n注意，输出的顺序和三元组的顺序并不重要。',
      },
      { input: 'nums = [0,1,1]', output: '[]', explanation: '唯一可能的三元组和不为 0。' },
      { input: 'nums = [0,0,0]', output: '[[0,0,0]]' },
    ],
    constraints: ['3 <= nums.length <= 3000', '-10⁵ <= nums[i] <= 10⁵'],
  },
  {
    id: 7,
    title: '接雨水',
    slug: 'trapping-rain-water',
    difficulty: 'hard',
    tags: ['栈', '数组', '双指针', '动态规划', '单调栈'],
    acceptance: 61.2,
    description: `给定 \`n\` 个非负整数表示每个宽度为 \`1\` 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。`,
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: '上面是由数组 [0,1,0,2,1,0,1,3,2,1,2,1] 表示的高度图，在这种情况下，可以接 6 个单位的雨水。' },
      { input: 'height = [4,2,0,3,2,5]', output: '9' },
    ],
    constraints: ['n == height.length', '1 <= n <= 2 * 10⁴', '0 <= height[i] <= 10⁵'],
  },
  {
    id: 8,
    title: '二叉树的层序遍历',
    slug: 'binary-tree-level-order-traversal',
    difficulty: 'medium',
    tags: ['树', '广度优先搜索', '二叉树'],
    acceptance: 66.7,
    description: `给你二叉树的根节点 \`root\` ，返回其节点值的 **层序遍历** （即逐层地，从左到右访问所有节点）。`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
      { input: 'root = [1]', output: '[[1]]' },
      { input: 'root = []', output: '[]' },
    ],
    constraints: ['树中节点数目在范围 [0, 2000] 内', '-1000 <= Node.val <= 1000'],
  },
  {
    id: 9,
    title: '合并两个有序链表',
    slug: 'merge-two-sorted-lists',
    difficulty: 'easy',
    tags: ['递归', '链表'],
    acceptance: 63.4,
    description: `将两个升序链表合并为一个新的 **升序** 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。`,
    examples: [
      { input: 'l1 = [1,2,4], l2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
      { input: 'l1 = [], l2 = []', output: '[]' },
      { input: 'l1 = [], l2 = [0]', output: '[0]' },
    ],
    constraints: ['两个链表的节点数目范围是 [0, 50]', '-100 <= Node.val <= 100'],
  },
  {
    id: 10,
    title: 'LRU 缓存',
    slug: 'lru-cache',
    difficulty: 'medium',
    tags: ['设计', '哈希表', '链表', '双向链表'],
    acceptance: 54.6,
    description: `请你设计并实现一个满足 **LRU (最近最少使用) 缓存** 约束的数据结构。

实现 \`LRUCache\` 类：

- \`LRUCache(int capacity)\` 以 **正整数** 作为容量 \`capacity\` 初始化 LRU 缓存
- \`int get(int key)\` 如果关键字 \`key\` 存在于缓存中，则返回关键字的值，否则返回 \`-1\` 。
- \`void put(int key, int value)\` 如果关键字 \`key\` 已经存在，则变更其数据值 \`value\` ；如果不存在，则向缓存中插入该组 \`key-value\` 。如果插入操作导致关键字数量超过 \`capacity\` ，则应该 **逐出** 最久未使用的关键字。

函数 \`get\` 和 \`put\` 必须以 \`O(1)\` 的平均时间复杂度运行。`,
    examples: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
        explanation: '解释\nLRUCache lRUCache = new LRUCache(2);\nlRUCache.put(1, 1); // 缓存是 {1=1}\nlRUCache.put(2, 2); // 缓存是 {1=1, 2=2}\nlRUCache.get(1);    // 返回 1\nlRUCache.put(3, 3); // 该操作会使得关键字 2 作废，缓存是 {1=1, 3=3}\nlRUCache.get(2);    // 返回 -1 (未找到)\nlRUCache.put(4, 4); // 该操作会使得关键字 1 作废，缓存是 {4=4, 3=3}\nlRUCache.get(1);    // 返回 -1 (未找到)\nlRUCache.get(3);    // 返回 3\nlRUCache.get(4);    // 返回 4',
      },
    ],
    constraints: ['1 <= capacity <= 3000', '0 <= key <= 10⁴', '0 <= value <= 10⁵'],
  },
]

export function getProblemBySlug(slug: string): Problem | undefined {
  return problems.find(p => p.slug === slug)
}

export function getProblemById(id: number): Problem | undefined {
  return problems.find(p => p.id === id)
}
