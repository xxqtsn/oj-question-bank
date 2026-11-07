export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 font-mono">
      <h1 className="text-4xl font-bold text-cyber-accent cyber-title mb-6">// ABOUT</h1>
      <p className="text-cyber-text leading-relaxed mb-8">
        JPB OJ — a minimalist online judge designed for pure problem-solving.
        No clutter, no distraction, just clean statements and smooth reading.
      </p>

      <div className="card p-6 mb-6">
        <h2 className="text-cyber-accent mb-3">// STACK</h2>
        <ul className="space-y-2 text-sm text-cyber-textDim">
          <li>· React 18 + Vite — blazing fast dev</li>
          <li>· TypeScript — type safe</li>
          <li>· React Router — client-side routing</li>
          <li>· Tailwind CSS — cyberpunk theme</li>
          <li>· Cloudflare Pages — edge deployment</li>
          <li>· Cloudflare Workers + D1 — backend API</li>
        </ul>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-cyber-accent mb-3">// ROADMAP</h2>
        <ul className="space-y-2 text-sm text-cyber-textDim">
          <li>▢ User system w/ email verification</li>
          <li>▢ Online code editor (Monaco)</li>
          <li>▢ Sandboxed judge runner</li>
          <li>▢ AC record &amp; stats</li>
          <li>▢ Favorites / collections</li>
          <li>▢ Discussion forum</li>
        </ul>
      </div>
    </div>
  )
}
