-- PostgreSQL Connection Reset Script
-- ⚠️ รัน script นี้ด้วย superuser (เช่น postgres) โดยต่อสู่ PostgreSQL 192.168.100.83
-- ⏰ ทำการนี้ควรทำเมื่อ traffic น้อยที่สุด (เวลาออฟไพค)

-- 📊 STEP 1: ตรวจสอบสถานการณ์ปัจจุบัน
SELECT 
    datname as database,
    usename as user,
    state,
    state_change,
    count(*) as connections
FROM pg_stat_activity
WHERE datname = 'ivs_service'
GROUP BY datname, usename, state, state_change
ORDER BY connections DESC;

-- 📊 STEP 2: นับ total connections
SELECT count(*) as total_connections_ivs_service
FROM pg_stat_activity
WHERE datname = 'ivs_service';

-- 🔴 STEP 3: ปิด IDLE connections ที่เก่า (เก่าเกิน 5 นาที)
-- ⚠️ ใช้ระวัง - อาจพัง long-running queries
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'ivs_service' 
  AND state = 'idle'
  AND state_change < now() - interval '5 minutes'
  AND pid <> pg_backend_pid();

-- 📊 STEP 4: ตรวจสอบหลังจาก terminate
SELECT 
    datname as database,
    state,
    count(*) as connections
FROM pg_stat_activity
WHERE datname = 'ivs_service'
GROUP BY datname, state;

-- ✅ STEP 5: ตรวจสอบ PostgreSQL configuration
-- (ไม่ต้องแก้ถ้า max_connections พอ)
SHOW max_connections;
SHOW max_client_conn;  -- (ถ้า PgBouncer ใช้อยู่)

