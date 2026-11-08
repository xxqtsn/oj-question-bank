import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Worker 部署后会有一个固定 URL，部署完替换这里
// 本地开发时如果 Worker 没部署，api.ts 会自动 fallback 到 mock
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  // 开发时把 /api 代理到 Worker（如果你先部署了 Worker 就填它的 URL）
  server: {
    proxy: {
      // Worker 部署后把下面 URL 改成你的 Worker 地址
      '/api': {
        target: 'https://oj-api.xxqtsn.workers.dev',
        changeOrigin: true,
      },
    },
  },
})
