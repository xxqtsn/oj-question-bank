export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-neutral-500">
          © {new Date().getFullYear()} JPB OJ · Just Passing By
        </div>
        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-neutral-900 transition-colors"
          >
            GitHub
          </a>
          <span className="text-neutral-300">·</span>
          <span>由 React + Cloudflare Pages 驱动</span>
        </div>
      </div>
    </footer>
  )
}
