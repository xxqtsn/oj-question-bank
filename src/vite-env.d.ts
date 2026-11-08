/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Cloudflare Worker API 地址，如 https://oj-api.xxqtsn.workers.dev */
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
