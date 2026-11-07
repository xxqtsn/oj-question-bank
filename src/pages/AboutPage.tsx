export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight mb-6">关于 JPB OJ</h1>
      <p className="text-neutral-600 leading-relaxed mb-8">
        JPB OJ（Just Passing By Online Judge）是一个极简风格的在线算法题库。
        它的核心理念是 —— 让刷题这件事变得纯粹，没有花哨的动效，没有多余的干扰，
        只有清晰的题目描述和舒适的阅读体验。
      </p>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-3">技术栈</h2>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li>· <strong>React 18</strong> + <strong>Vite</strong> — 极速开发体验</li>
          <li>· <strong>TypeScript</strong> — 类型安全</li>
          <li>· <strong>React Router</strong> — 客户端路由</li>
          <li>· <strong>Tailwind CSS</strong> — 极简样式</li>
          <li>· <strong>Cloudflare Pages</strong> — 全球边缘部署</li>
        </ul>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-3">路线图</h2>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li>☐ 用户注册与登录</li>
          <li>☐ 在线代码编辑器（Monaco）</li>
          <li>☐ 提交与判题（沙箱执行）</li>
          <li>☐ 个人做题记录与统计</li>
          <li>☐ 题目收藏夹</li>
          <li>☐ 讨论区</li>
        </ul>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-3">联系我们</h2>
        <p className="text-sm text-neutral-600">
          有问题、建议或者想贡献题目？欢迎通过 GitHub 联系。
        </p>
      </div>
    </div>
  )
}
