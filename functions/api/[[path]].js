// Cloudflare Pages Function — 把前端的 /api/* 请求代理到 Worker
// Pages 后端（Cloudflare 国际网络）发起请求 → 不受国内 GFW 影响
export default {
  async onRequest(request) {
    const url = new URL(request.url);
    // /api/auth/login → /auth/login
    const path = url.pathname.replace(/^\/api/, '') || '/';
    const target = `https://oj-api.bxyblxx.workers.dev${path}${url.search}`;

    return fetch(target, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  },
};
