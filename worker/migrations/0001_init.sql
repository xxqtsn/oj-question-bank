-- ============================================
-- JPB OJ D1 Schema
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',  -- owner / admin / user / banned
  banned_until INTEGER,               -- NULL = 未封禁, -1 = 永久封禁, 时间戳 = 到时间自动解封
  created_at INTEGER NOT NULL
);

-- 验证码表（注册用）
CREATE TABLE IF NOT EXISTS verification_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'register',  -- register / reset_password
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_codes_email ON verification_codes(email);
