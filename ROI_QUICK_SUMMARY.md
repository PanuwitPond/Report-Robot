# 📋 ROI Editor Fix - Quick Summary

## 🎯 ปัญหา
ผู้ใช้วาด ROI → บันทึก ✅ → กลับเข้ามาดูใหม่ → จุดที่วาดหายไป ❌

---

## 🔍 สาเหตุที่ค้นพบ (3 ปัญหา)

### ปัญหา #1: Data Format Mismatch 🔴 **CRITICAL**
- **ทำไม**: บันทึก `{x, y}` แต่ backend ต้องการ `[x, y]`
- **ส่งผล**: Data บันทึกผิด format → โหลดมา error
- **แก้ด้วย**: Map points ก่อนบันทึก `[p.x, p.y]`

### ปัญหา #2: ไม่ Verify หลังบันทึก 🟠 **MEDIUM**
- **ทำไม**: บันทึก → redirect `/mroi` ทันที ไม่ตรวจสอบ
- **ส่งผล**: ไม่รู้ว่า data บันทึกสำเร็จจริง ๆ
- **แก้ด้วย**: Fetch verify data ก่อน navigate

### ปัญหา #3: Type Inconsistency 🟡 **LOW**
- **ทำไม**: Frontend `{x,y}` vs mroi-app-main `[x,y]`
- **ส่งผล**: Backend อาจ reject data ไม่ compatible
- **แก้ด้วย**: Standardize format → `[x,y]` ทุกที่

---

## ✅ Plan (Step by Step)

### 🔍 Step 1: Pre-Check (15 min)
- [ ] ตรวจสอบ backend ต้อง `[x,y]` หรือ `{x,y}` ?
- [ ] ตรวจสอบ database format ของ rule array
- [ ] ตรวจสอบ mroi-app-main ส่งไปแบบไหน

### 🛠️ Step 2: Code Change (20 min)
- [ ] **Change 1**: Map points format `{x,y}` → `[x,y]`
  - File: `RoiEditor.tsx` บรรทัด 223
  - Code: `points: canvasState.points.map(p => [p.x, p.y])`

- [ ] **Change 2**: Add verify after save
  - File: `RoiEditor.tsx` บรรทัด 233
  - Logic: Fetch data → Check points count → Verify match

### 🧪 Step 3: Test (45 min)
- [ ] Test Draw → Save → Reload (manual test)
- [ ] Test ทุก ROI Type
- [ ] Test error handling
- [ ] Test Network disconnect scenario

### ✔️ Step 4: Deploy (10 min)
- [ ] Commit & push
- [ ] Verify on staging/production

---

## 🚨 Risk Assessment

| Risk | ระดับ | ผลกระทบ | Mitigation |
|------|------|--------|-----------|
| Data format ทำให้ old data error | 🔴 | HIGH | Backend ต้องรองรับทั้ง 2 format |
| Performance ช้า (refetch) | 🟡 | LOW | ~500ms เพิ่มเข้ามา ยอมรับได้ |
| Redirect ก่อน save จริง | 🔴 | HIGH | Verify ก่อน navigate ✓ Fix |

---

## ✅ Success Criteria

```
Before Fix:
  Draw 4 points → Save ✅ → Reload → Points ❌ GONE

After Fix:
  Draw 4 points → Save ✅ → Verify ✅ → Reload → Points ✅ STAY
```

---

## ⏱️ Timeline
- **Pre-Check**: 15 min
- **Code**: 20 min  
- **Test**: 45 min
- **Deploy**: 10 min
- **Total**: ~2 hours

---

## 🎯 Next Action

**ต้องได้รับการอนุมัติ 3 ประการ:**

1. ✅ ยืนยันว่า backend ต้องการ `[x,y]` format หรือ `{x,y}` ?
2. ✅ ยินยอมทำการแก้ไข (understanding of risk)
3. ✅ มี rollback plan ถ้ามีปัญหา

**เมื่อได้อนุมัติแล้ว** → เริ่ม implementation ได้เลย

---

📌 **Important**: ถ้า backend ต้อง format ต่างจากที่วิเคราะห์ → Plan ต้องปรับด้วย!
