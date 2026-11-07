export default function Footer() {
  return (
    <footer className="border-t border-cyber-border mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-cyber-textDim">
        <div>
          &copy; {new Date().getFullYear()} JPB OJ &gt; Just Passing By
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-cyber-accent transition-colors">
            GITHUB
          </a>
          <span className="text-cyber-border">::</span>
          <span>POWERED BY REACT + CLOUDFLARE PAGES</span>
        </div>
      </div>
    </footer>
  )
}
