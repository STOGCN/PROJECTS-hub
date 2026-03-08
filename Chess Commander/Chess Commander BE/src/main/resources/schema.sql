-- schema.sql สำหรับ Chess Commander Login System
-- PostgreSQL 16+ แนะนำ (รองรับ gen_random_uuid() ในตัว)
-- ใช้ Argon2id สำหรับ hash รหัสผ่าน (sequence ของ moves)
-- สร้างวันที่: March 2026

-- เปิดใช้ extension ที่จำเป็น (ถ้ายังไม่มี)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- สำหรับ gen_random_uuid() ถ้าเวอร์ชันเก่า
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- สำรอง

-- =============================================================================
-- ตาราง users: ข้อมูลผู้ใช้ + รหัสผ่านแบบ chess sequence (hashed)
-- =============================================================================
CREATE TABLE users (
                       id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       username         VARCHAR(50) UNIQUE NOT NULL,
                       password_hash    TEXT NOT NULL,                  -- Argon2id encoded string (เช่น $argon2id$v=19$m=...)
                       initial_fen      TEXT NOT NULL,                   -- FEN เริ่มต้นกระดาน (validate ใน app)
                       move_count       INTEGER NOT NULL DEFAULT 3,      -- จำนวนตาที่ต้องเล่น (3-6)
                       mfa_enabled      BOOLEAN DEFAULT FALSE,
                       failed_attempts  INTEGER DEFAULT 0,               -- นับผิดกี่ครั้ง (reset เมื่อสำเร็จ)
                       locked_until     TIMESTAMP WITH TIME ZONE,        -- เวลาที่ปลดล็อก (NULL = ไม่ล็อก)
                       last_login_at    TIMESTAMP WITH TIME ZONE,
                       created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                       updated_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'เก็บข้อมูลผู้ใช้และรหัสผ่านแบบหมากรุก (hashed ด้วย Argon2id)';
COMMENT ON COLUMN users.password_hash IS 'เก็บ hash จาก Argon2id (รวม salt, params ไว้ใน string เดียว)';

-- Index สำหรับค้นหาเร็ว
CREATE INDEX idx_users_username ON users(username);


-- =============================================================================
-- ตาราง login_sessions: จัดการ session (access + refresh token)
-- =============================================================================
CREATE TABLE login_sessions (
                                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                access_token    TEXT NOT NULL,                     -- JWT access (short-lived ~15-60 นาที)
                                refresh_token   TEXT UNIQUE NOT NULL,              -- Refresh token (long-lived ~7-30 วัน)
                                device_fingerprint TEXT,                            -- optional: hash ของ browser/device
                                ip_address      INET,
                                expires_at      TIMESTAMP WITH TIME ZONE NOT NULL, -- สำหรับ access token
                                refresh_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                                created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE login_sessions IS 'เก็บ session และ refresh token สำหรับ JWT rotation';
CREATE INDEX idx_login_sessions_user_id ON login_sessions(user_id);
CREATE INDEX idx_login_sessions_refresh_token ON login_sessions(refresh_token);


-- =============================================================================
-- ตาราง account_locks: ล็อกบัญชีชั่วคราว (per user + per IP)
-- =============================================================================
CREATE TABLE account_locks (
                               id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
                               ip_address      INET NOT NULL,
                               attempts_count  INTEGER DEFAULT 1,
                               locked_until    TIMESTAMP WITH TIME ZONE NOT NULL,
                               created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                               UNIQUE (user_id, ip_address)  -- ล็อกแยก user + IP
);

COMMENT ON TABLE account_locks IS 'ล็อกบัญชีหลังลองผิดหลายครั้ง (progressive lockout)';


-- =============================================================================
-- ตาราง security_audit_logs: บันทึกการลองล็อกอินทุกครั้ง (audit trail)
-- =============================================================================
CREATE TABLE security_audit_logs (
                                     id                BIGSERIAL PRIMARY KEY,
                                     user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
                                     attempt_status    VARCHAR(20) NOT NULL CHECK (attempt_status IN ('SUCCESS', 'FAILURE', 'LOCKED')),
                                     ip_address        INET,
                                     user_agent        TEXT,
                                     attempted_moves_hash TEXT,                   -- hash ของ moves ที่ลอง (ไม่เก็บ plain)
                                     attempted_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE security_audit_logs IS 'บันทึก log การลองล็อกอินทุกครั้ง เพื่อตรวจจับ brute-force';
CREATE INDEX idx_audit_logs_user_id_attempted_at ON security_audit_logs(user_id, attempted_at);
CREATE INDEX idx_audit_logs_ip_address ON security_audit_logs(ip_address);


-- =============================================================================
-- Trigger อัปเดต updated_at อัตโนมัติ (optional แต่ดี)
-- =============================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- =============================================================================
-- สรุป: ใช้ยังไงต่อ?
-- 1. รันไฟล์นี้ใน PostgreSQL → สร้างตารางทั้งหมด
-- 2. ใน backend (Node.js/Prisma หรือ raw SQL):
--    - Register: hash ด้วย argon2 → เก็บใน password_hash
--    - Login: argon2.verify(password_hash, submitted_sequence)
--    - Lockout: ถ้าผิด → update failed_attempts + insert/check account_locks
--    - Session: หลัง login สำเร็จ → insert login_sessions (access + refresh)
-- =============================================================================

-- ถ้าต้องการเพิ่ม index เพิ่มเติมหรือ partition สำหรับ log เยอะ บอกได้เลยครับ!