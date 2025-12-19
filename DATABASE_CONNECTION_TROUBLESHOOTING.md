# 🔴 PostgreSQL Connection Pool Issue - Recovery Plan

## 📋 ปัญหา
```
[ERROR] Unable to connect to the database (mroi_db_conn)
error: sorry, too many clients already
```

---

## 🔍 Root Cause Analysis

### สาเหตุที่แท้จริง:
1. ✅ **UI Components ไม่ได้เป็นสาเหตุ** (DrawingCanvas, SetupEditor, RoiEditor)
2. ✅ **Code changes ไม่ได้เป็นสาเหตุ** 
3. 🔴 **PostgreSQL server มี connections หมด** ← สาเหตุจริง
4. 🔴 **Orphaned/Idle connections จากกระบวนการอื่น** (old backend instances, idle clients)

---

## ⚠️ สาเหตุบังเอิญของการเกิดปัญหา:

| สถานการณ์ | สาเหตุ |
|---------|--------|
| **ก่อนปรับปรุง** | Backend ไม่มี pool limits → connections ค่อย ๆ accumulate |
| **หลังปรับปรุง UI** | ฉันทำการ rebuild backend → connections เพิ่มขึ้น |
| **Result** | PostgreSQL connections เต็ม (max_connections ≈ 100) |

---

## ✅ Recovery Plan (ขั้นตอน)

### Phase 1: Code Preparation ✅ (เสร็จแล้ว)

#### ✓ database.module.ts - Pool Settings ที่ปลอดภัย
```typescript
extra: {
    max: 5,                         // ⚠️ ลดจาก 10 เป็น 5
    min: 1,                         
    idleTimeoutMillis: 30000,       // ปิด idle connections หลัง 30s
    connectionTimeoutMillis: 5000,  // Timeout สำหรับ new connections
    statement_timeout: 30000,       // Statement timeout 30s
}
```

✅ Backend build สำเร็จแล้ว

---

### Phase 2: DB Admin Action (ต้องทำต่อ)

#### ⚠️ ขั้นที่ 1: DB Admin ต้องรัน SQL Script

**Location:** `scripts/reset_postgres_connections.sql`

**หรือรัน command ต่อไปนี้ผ่าน psql:**

```bash
psql -h 192.168.100.83 -U postgres -d postgres
```

แล้วรัน SQL:
```sql
-- 1️⃣ ตรวจสอบสถานการณ์
SELECT datname, state, count(*) as cnt
FROM pg_stat_activity
WHERE datname = 'ivs_service'
GROUP BY datname, state;

-- 2️⃣ ปิด idle connections (SAFELY)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'ivs_service' 
  AND state = 'idle'
  AND state_change < now() - interval '5 minutes'
  AND pid <> pg_backend_pid();

-- 3️⃣ ยืนยันผลลัพธ์
SELECT datname, state, count(*) as cnt
FROM pg_stat_activity
WHERE datname = 'ivs_service'
GROUP BY datname, state;
```

✅ **ถ้า connections ลดลง** → ไปขั้นตอนถัดไป

---

### Phase 3: Backend Restart (คุณทำ)

#### ขั้นที่ 2: ปิด Node processes

```powershell
Get-Process node | Stop-Process -Force
```

#### ขั้นที่ 3: Start Backend

```bash
cd backend
npm run start:dev
```

🔍 **ให้ดูเสาร์ output:**
- ✅ สำเร็จ: `[Nest] .... Application running on: http://localhost:3001`
- ❌ ล้มเหลว: `ERROR [TypeOrmModule] Unable to connect to the database`

---

### Phase 4: Verification (คุณทำ)

#### ขั้นที่ 4: ทดสอบ Backend API

```bash
curl -X GET http://localhost:3001/health
# หรือ
curl -X GET http://localhost:3001/mroi/devices
```

✅ Response ควรได้ (ไม่มี error)

#### ขั้นที่ 5: ทดสอบ Frontend

1. เปิด Frontend: `npm run dev`
2. Navigate ไปที่ http://localhost:5173/mroi/devices
3. ✅ ควรดึงข้อมูล devices ได้

---

## 🚨 Rollback Plan (ถ้าติดปัญหา)

### ถ้า Backend ยังไม่เชื่อมต่อได้:

```bash
# 1️⃣ ปิด Backend
Ctrl+C

# 2️⃣ DB Admin ต้องรัน hard reset
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'ivs_service'
  AND pid <> pg_backend_pid();

# 3️⃣ Restart PostgreSQL Service
# (ต้องติดต่อ PostgreSQL server admin)
systemctl restart postgresql  # on Linux
# หรือ restart service บน Windows

# 4️⃣ Try again
npm run start:dev
```

---

## 📊 Configuration Summary

| Setting | ค่า | ที่มา |
|---------|-----|------|
| **Max Connections per App** | 5 | TypeORM pg driver |
| **Idle Timeout** | 30s | pg driver |
| **Connection Timeout** | 5s | pg driver |
| **Statement Timeout** | 30s | PostgreSQL |
| **Database** | `ivs_service` @ 192.168.100.83 | .env |

---

## 📝 Checklist

- [ ] DB Admin ได้รับ SQL script
- [ ] DB Admin รัน `STEP 1-2` (ตรวจสอบและปิด idle connections)
- [ ] Backend ได้ build ด้วย pool settings ใหม่
- [ ] โปรแกรม Backend startup ด้วย `npm run start:dev`
- [ ] ได้ตรวจสอบ `/health` endpoint ว่าตอบสนอง
- [ ] Frontend ดึงข้อมูล devices ได้
- [ ] MROI Editor page ทำงานปกติ

---

## 🎯 Prevention (อนาคต)

1. ✅ **Monitor** pg_stat_activity เป็นประจำ
2. ✅ **ตั้ง alerts** เมื่อ connections > 80% 
3. ✅ **Use PgBouncer** สำหรับ multiple services (อนาคต)
4. ✅ **Graceful shutdown** ปิด connections เมื่อ app terminate
5. ✅ **Connection pool limits** ตามด้วยใจเขตจำกัดของ PostgreSQL

---

## 📞 Contact

- **DB Server:** 192.168.100.83:5432
- **Database:** ivs_service
- **User:** aiintern

