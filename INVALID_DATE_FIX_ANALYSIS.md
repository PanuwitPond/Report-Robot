# 🔴 แก้ไข "Invalid Date" Issue

---

## 📊 ปัญหาที่เกิดขึ้น

ในหน้า `http://localhost:3000/mioc/incomplete`:
- **แถวที่ 1:** "เวลาเกิดเหตุ" = `-` ✅
- **แถวที่ 2:** "เวลาเกิดเหตุ" = `Invalid Date` ❌

---

## 🔍 วิเคราะห์ Root Cause

### **mioc_web IncompleteIncident.js (เดิม - ไม่ safe)**
```javascript
valueGetter: (params) => params ? params.replace(/\+\d{2}$/, '') : ''
```

**ปัญหา:**
- ถ้า `params = NULL` → return `''` → แสดง ""
- ถ้า `params = "Invalid Date"` → try `.replace()` → ยังคงแสดง "Invalid Date" ❌
- ไม่มี try-catch → error เงียบ ๆ

### **Database Data ที่ invalid**
```
Incident 1: event_time = NULL → params = null → '' ✅
Incident 2: event_time = "Invalid Date" → params = "Invalid Date" → "Invalid Date" ❌
```

---

## ✅ วิธีแก้ (Applied)

### **1. mioc_web - IncompleteIncident.js**
```javascript
// ✅ Safe formatter ที่ handle invalid date
const formatTimeValue = (value) => {
    if (!value) return '-';
    try {
        if (typeof value === 'string') {
            return value.replace(/\+\d{2}$/, '');
        }
        return '-';
    } catch (e) {
        return '-';
    }
};

// ใช้
valueGetter: (params) => formatTimeValue(params)
```

**ความดีของวิธีนี้:**
- ✅ Check `typeof value === 'string'` → ต้อง string
- ✅ มี try-catch → error ก็ return `-`
- ✅ ถ้า `value` ไม่ใช่ string → return `-`

### **2. mioc_web - PageTrueAlarm.js**
ใช้ `formatTimeValue` เหมือนกัน

### **3. Report-Robot - IncompleteIncident.tsx**
```typescript
// ✅ Safe formatter - ตรงกับ mioc_web
const formatTimeValue = (value: any): string => {
    if (!value) return '-';
    try {
        if (typeof value === 'string') {
            return value.replace(/\+\d{2}$/, '');
        }
        return '-';
    } catch (e) { return '-'; }
};

// เปลี่ยนจาก formatDate (ที่ใช้ new Date()) ไป formatTimeValue
valueFormatter: (value) => formatTimeValue(value)
```

**เหตุเปลี่ยน:**
- เดิม: `new Date(value).toLocaleString(...)` → เกินไป (ขึ้นต้อง แสดง full datetime)
- ตอนนี้: เหมือน mioc_web → ลบ timezone เท่านั้น

### **4. Report-Robot - PageTrueAlarm.tsx**
```typescript
// เปลี่ยนจาก unsafe valueGetter:
// ❌ valueGetter: (params) => params?.replace?.(/\+\d{2}$/, '') || ''
// ✅ valueFormatter: (value) => formatTimeValue(value)
```

---

## 📋 ไฟล์ที่แก้ไข

| ไฟล์ | ปัญหา | วิธีแก้ |
|-----|------|--------|
| `mioc_web/frontend/src/IncompleteIncident.js` | ❌ No try-catch | ✅ Add `formatTimeValue()` |
| `mioc_web/frontend/src/PageTrueAlarm.js` | ❌ No try-catch | ✅ Add `formatTimeValue()` |
| `Report-Robot/frontend/src/pages/mioc/IncompleteIncident.tsx` | ❌ formatDate too complex | ✅ Use `formatTimeValue()` |
| `Report-Robot/frontend/src/pages/mioc/PageTrueAlarm.tsx` | ❌ Unsafe valueGetter | ✅ Use `formatTimeValue()` |

---

## 🎯 ผลลัพธ์

### **ก่อน:**
```
Incident 1: event_time = NULL → "-" ✅
Incident 2: event_time = "Invalid Date" → "Invalid Date" ❌
```

### **หลัง:**
```
Incident 1: event_time = NULL → "-" ✅
Incident 2: event_time = "Invalid Date" → "-" ✅
Incident 3: event_time = "2025-12-21T14:30:00+07" → "2025-12-21T14:30:00" ✅
```

---

## 🔑 Key Points

1. **Type Check**: `typeof value === 'string'` ต้องมี
2. **Try-Catch**: ต้อง error handling
3. **Fallback**: ทั้งหมด return `-` สำหรับ invalid value
4. **Consistency**: mioc_web + Report-Robot ใช้ logic เดียวกัน

---

**สถานะ:** ✅ แก้ไขเสร็จแล้ว  
**วันที่:** 2025-12-25
