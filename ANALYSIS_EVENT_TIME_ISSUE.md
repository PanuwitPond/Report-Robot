# 📊 วิเคราะห์ปัญหา "เวลาเกิดเหตุ" (event_time) ที่ไม่มีข้อมูล

---

## 🔍 สรุปปัญหา

ในหน้า **http://localhost:3000/mioc/incomplete** (รายการที่รอดำเนินการ) 
- Column **"เวลาเกิดเหตุ"** ไม่มีข้อมูลแสดง
- เหตุผล: Database ไม่มีข้อมูลในฟิลด์นี้
- **ปัญหาแท้จริง:** API/SQL query ที่ดึงข้อมูลจากฐานข้อมูลไม่ตรงกับลักษณะการจัดเก็บข้อมูลจริง

---

## 🔴 ปัญหาในระบบ mioc_web

### ✅ API Endpoint (/allIncomplete)

**ไฟล์:** `mioc_web/backend/index.js`

```javascript
app.get("/allIncomplete", requireJWTAuth, async (req, res) => {
    try {
        const allTrueAlarm = await pool.query(
            "SELECT * \
            FROM intrusion_truealarms\
            WHERE deleted_at IS NULL\
            AND (conclusion IS NULL OR conclusion ='')"
        )
        res.json(allTrueAlarm.rows);
    } catch (err) {
        console.error(err.message)
    }
});
```

**สิ่งที่สำคัญ:**
- ใช้ `SELECT *` ดึงทุกคอลัมน์
- **ไม่มี ORDER BY** - ข้อมูลจะไม่เรียงลำดับตามเวลา
- **ไม่มี transformation** - ส่งข้อมูลดิบจากฐานข้อมูล

---

## 🟡 Frontend Display (mioc_web)

**ไฟล์:** `mioc_web/frontend/src/IncompleteIncident.js`

```javascript
const columns = [
    { field: 'incident_no', headerName: 'Incident NO.', width: 120 },
    {
        field: 'event_time',
        headerName: 'เวลาเกิดเหตุ',
        valueGetter: (params) => params ? params.replace(/\+\d{2}$/, '') : ''
    },
    // ...
];
```

**สิ่งที่สำคัญ:**
- Column ชื่อ `event_time` ถูกกำหนด
- ใช้ `valueGetter` เพื่อ clean up timezone suffix (เช่น `+07`)
- **ถ้า event_time เป็น null → จะแสดง ""**

---

## 🔵 Report-Robot (ระบบปัจจุบัน)

### ✅ API Endpoint (/api/incidents/incomplete)

**ไฟล์:** `Report-Robot/backend/src/modules/incidents/incidents.service.ts`

```typescript
async getIncomplete() {
    const sql = `
        SELECT *, 
            COALESCE(event_time::text, created_at::text) as event_time, 
            'Incomplete' as status
        FROM intrusion_truealarms 
        WHERE deleted_at IS NULL 
        AND (conclusion IS NULL OR conclusion = '')
        ORDER BY created_at DESC
    `;
    return this.miocDataSource.query(sql);
}
```

**สิ่งที่ต่างจาก mioc_web:**

| ลักษณะ | mioc_web | Report-Robot |
|------|----------|--------------|
| **Query** | `SELECT *` | `SELECT * + COALESCE()` |
| **event_time** | ส่งค่าดิบ | **COALESCE(event_time, created_at)** |
| **Order** | ไม่มี | `ORDER BY created_at DESC` |
| **Status** | ไม่มี | มี `'Incomplete' as status` |

---

## ⚠️ ปัญหาหลัก: COALESCE Logic

### ❌ เหตุที่ Report-Robot ใช้ COALESCE?

```typescript
COALESCE(event_time::text, created_at::text) as event_time
```

**วัตถุประสงค์:** ถ้า `event_time` เป็น NULL → ใช้ `created_at` แทน

**แต่ mioc_web ไม่ทำแบบนี้:**
- mioc_web: ส่ง NULL ดิบ ๆ มา
- Report-Robot: ดึงค่าทดแทนจาก created_at

---

## 🔍 วิเคราะห์การจัดเก็บข้อมูล Database

### 📋 Schema ของ intrusion_truealarms table

**ตามการใช้งาน:**

```
Table: intrusion_truealarms
├── id (Primary Key)
├── incident_no (Incident number)
├── event_time (⚠️ อาจเป็น NULL หรือ TIME type)
├── created_at (Timestamp - ถูกสร้างอัตโนมัติ)
├── updated_at (Timestamp)
├── deleted_at (Soft delete)
├── description_of_incident
├── conclusion (NULL = incomplete)
└── ... อื่น ๆ
```

**ประเด็นสำคัญ:**
- `event_time` **อาจเป็น NULL** ในหลายระเบียน
- `created_at` **มีค่าเสมอ** (timestamp อัตโนมัติ)

---

## 🚨 ปัญหาจริง

### Problem #1: Data Integrity
```
❌ event_time อาจ NULL
✅ created_at มีค่าเสมอ

ตัวอย่าง:
- Incident 1: event_time = "14:30", created_at = "2025-12-25 14:35"
- Incident 2: event_time = NULL, created_at = "2025-12-25 15:20"
```

### Problem #2: API ที่ต่างกัน
```
mioc_web (/allIncomplete):
SELECT * 
  ↓
ผลลัพธ์: event_time = NULL (ไม่มีข้อมูล)

Report-Robot (/api/incidents/incomplete):
SELECT COALESCE(event_time, created_at) as event_time
  ↓
ผลลัพธ์: event_time = created_at (มีค่าแทน)
```

### Problem #3: Update Logic ต่างกัน

**mioc_web update:**
```javascript
// mioc_web/backend/index.js
"update intrusion_truealarms \
set description_of_incident=$2, event_time= $3, ...
where id=$1"
```
- ส่งค่า `event_time` ตรง ๆ มาแก้ไข
- ถ้า frontend ส่ง NULL → column จะเป็น NULL

**Report-Robot update:**
```typescript
// Report-Robot - incidents.service.ts
// ลบ ID เพื่อความปลอดภัย
delete updateData.id;

// Handle time columns specially
const timeColumns = ['event_time', 'mioc_contract_time', ...];

Object.keys(updateData).forEach(key => {
    if (value === '') {
        updateData[key] = null;  // "" → NULL
    } 
    else if (timeColumns.includes(key) && value.includes('T')) {
        // "2025-12-18T01:18" → "01:18"
        updateData[key] = value.split('T')[1];
    }
});
```

**ความแตกต่าง:**
- mioc_web: ส่งค่าดิบ
- Report-Robot: **ตัดเฉพาะเวลา** (เพราะ DB ต่อ column เป็น TIME type ไม่ใช่ TIMESTAMP)

---

## 🔴 ข้อสรุป: ทำไมจึงไม่มีข้อมูล?

### Root Cause:
1. **Database ไม่มีข้อมูล** → `event_time` = NULL
2. **API ส่ง NULL ดิบ** → mioc_web ส่งค่า NULL มา
3. **Frontend ไม่รูปแบบ NULL** → DataGrid แสดง ""

### ปัญหาหลัก:
```
mioc_web ❌ ไม่ผ่านข้อมูล fallback
Report-Robot ✅ ใช้ COALESCE(event_time, created_at)
```

---

## 📊 เปรียบเทียบ SQL Queries

### ❌ mioc_web (ปัจจุบัน)
```sql
SELECT * 
FROM intrusion_truealarms
WHERE deleted_at IS NULL
  AND (conclusion IS NULL OR conclusion ='')
-- ❌ ไม่มี ORDER
-- ❌ event_time = NULL จะแสดงไม่ได้
```

### ✅ Report-Robot (ปรับปรุง)
```sql
SELECT *, 
    COALESCE(event_time::text, created_at::text) as event_time, 
    'Incomplete' as status
FROM intrusion_truealarms 
WHERE deleted_at IS NULL 
  AND (conclusion IS NULL OR conclusion = '')
ORDER BY created_at DESC
-- ✅ มี fallback value (created_at)
-- ✅ เรียงลำดับตามเวลาสร้าง
-- ✅ มี status flag
```

---

## ✅ บทสรุป

### 🎯 สิ่งที่ทำให้ Report-Robot ดีกว่า:

| ด้าน | mioc_web ❌ | Report-Robot ✅ |
|-----|----------|------------|
| **Data Fallback** | NULL → "" | NULL → created_at |
| **Ordering** | ไม่มี | คำสั่ง ORDER BY |
| **Transformation** | ไม่มี | COALESCE + status |
| **Time Format** | ทั้ง Date+Time | เฉพาะ TIME |
| **Update Logic** | ส่งค่าดิบ | Transform before update |

### 🔑 Key Insight:
**Report-Robot ได้ค่า event_time มาแสดงไม่ใช่เพราะ Database มีข้อมูล แต่เพราะ:**
1. ใช้ **COALESCE** เพื่อ fallback ไป `created_at`
2. ใช้ **COALESCE(...::text)** เพื่อแปลง data type
3. **เรียงลำดับ** เพื่อให้เห็นข้อมูลที่ล่าสุดก่อน

---

## 💡 Recommendation

หากต้องการให้ mioc_web แสดงข้อมูล "เวลาเกิดเหตุ" ได้:

```javascript
// mioc_web/backend/index.js - แก้ไขแบบนี้
app.get("/allIncomplete", requireJWTAuth, async (req, res) => {
    try {
        const allTrueAlarm = await pool.query(
            "SELECT *, \
            COALESCE(event_time::text, created_at::text) as event_time \
            FROM intrusion_truealarms\
            WHERE deleted_at IS NULL\
            AND (conclusion IS NULL OR conclusion ='')\
            ORDER BY created_at DESC"  // เพิ่มนี้
        )
        res.json(allTrueAlarm.rows);
    } catch (err) {
        console.error(err.message)
    }
});
```

---

**ผู้วิเคราะห์:** GitHub Copilot  
**วันที่:** 2025-12-25  
**สถานะ:** วิเคราะห์เท่านั้น (ยังไม่แก้ไข)
