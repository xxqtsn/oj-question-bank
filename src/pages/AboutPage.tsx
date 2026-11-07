export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 font-mono">
      <h1 className="font-display text-4xl font-bold text-cyber-accent cyber-title mb-6 tracking-wider">// 关于本站</h1>
      <p className="text-cyber-text leading-relaxed mb-8">
        JPB OJ —— 一个极简的在线算法题库，清晰的题意、干净的界面，专注刷题，零干扰。
      </p>

      <div className="card p-6 mb-6">
        <h2 className="font-display text-cyber-accent mb-3 text-lg font-bold">// 技术栈</h2>
        <ul className="space-y-2 text-sm text-cyber-textDim">
          <li>· React 18 + Vite —— 极速开发</li>
          <li>· TypeScript —— 类型安全</li>
          <li>· React Router —— 前端路由</li>
          <li>· Tailwind CSS + 赛博朋克主题</li>
          <li>· Cloudflare Pages —— 边缘部署</li>
          <li>· Cloudflare Workers + D1 —— 后端 API（开发中）</li>
        </ul>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-display text-cyber-accent mb-3 text-lg font-bold">// 开发路线</h2>
        <ul className="space-y-2 text-sm text-cyber-textDim">
          <li>▢ 用户系统 & 邮箱验证 ✓</li>
          <li>▢ 在线代码编辑器（Monaco）</li>
          <li>▢ 沙箱判题运行器</li>
          <li>▢ AC 记录 & 统计面板</li>
          <li>▢ 收藏夹 / 题目分类</li>
          <li>▢ 题解讨论区</li>
        </ul>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-cyber-accent mb-3 text-lg font-bold">// 命令</h2>
        <pre className="text-sm text-cyber-textDim leading-relaxed whitespace-pre-wrap">
<span className="text-cyber-accent">$</span> echo "Hello, JPB OJ!"
<span className="text-cyber-text">Hello, JPB OJ!</span>
<span className="text-cyber-accent">$</span> whoami
<span className="text-cyber-text">just passing by</span>
        </pre>
      </div>
    </div>
  )
}
