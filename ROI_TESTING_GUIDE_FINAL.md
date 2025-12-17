# 🧪 ROI Editor Fix - Testing Guide

## ✅ Code Changes Completed

### ✔️ Change 1: Data Format Transform
- **File**: `frontend/src/pages/mroi/RoiEditor.tsx`
- **Line**: 223
- **Change**: 
  ```typescript
  // BEFORE: points: canvasState.points  // [{x, y}, ...]
  // AFTER:  points: transformedPoints   // [[x, y], ...]
  ```
- **Code**:
  ```typescript
  const transformedPoints = canvasState.points.map(p => [p.x, p.y]);
  ```

### ✔️ Change 2: Data Verification
- **File**: `frontend/src/pages/mroi/RoiEditor.tsx`
- **Line**: 233
- **Change**: เพิ่ม verification logic หลังบันทึก
- **Features**:
  - ✅ Fetch verify data ก่อน navigate
  - ✅ Compare point count
  - ✅ Detailed console logs
  - ✅ Comprehensive error handling

---

## 🧪 Test Plan (สำคัญ!)

### **Test Environment Setup**
```
1. Terminal 1: Backend
   cd backend
   npm run start:dev

2. Terminal 2: Frontend
   cd frontend
   npm run dev

3. Browser: DevTools (F12) เปิดไว้ตลอดการ test
   └─ Console tab (ตรวจสอบ logs)
   └─ Network tab (ตรวจสอบ API calls)
```

---

### **Test Case 1: Normal Flow - Draw → Save → Reload** ✅ CRITICAL

**Step-by-step:**
```
1. เปิด ROI Editor หน้า
2. เลือก device (ถ้าเลือกไม่ได้ → error, ให้ skip test นี้)
3. รอให้ snapshot load (ตรวจสอบว่า snapshot แสดง)
4. วาด 4 จุด สร้าง square shape:
   └─ Click top-left corner
   └─ Click top-right corner
   └─ Click bottom-right corner
   └─ Click bottom-left corner

5. ✅ Verify: Canvas แสดง 4 จุดและ 3 เส้น
   └─ Sidebar "Points: 4"

6. เลือก ROI Type: "🎯 Intrusion Detection"

7. กด "✅ Save Configuration"

8. ✅ Verify: Console logs ตามนี้
   └─ 💾 Saving ROI config: {...}
   └─ 🔍 Verifying saved data...
   └─ 📊 Expected 4 points, saved data has 4 points
   └─ ✅ ROI data verified and saved successfully

9. ✅ Verify: Alert shows
   └─ "✅ ROI configuration saved and verified successfully!"

10. ✅ Verify: Auto-redirect ไปหน้า /mroi

11. กลับเข้า ROI Editor อีกครั้ง (refresh browser หรือ navigate back)

12. ✅ CRITICAL CHECK: 4 จุดที่วาดจะแสดงใหม่ไหม?
    └─ ✅ YES = SUCCESS!
    └─ ❌ NO = FAILURE - ต้อง investigate
```

**Console Verification:**
```javascript
// เมื่อ save สำเร็จ ควรเห็น:
💾 Saving ROI config: {
  rule: [{
    name: "INTRUSION Zone",
    type: "intrusion",
    points: [[100, 200], [300, 200], [300, 400], [100, 400]],  // ✅ format [x,y]
    timestamp: "2025-12-17T..."
  }]
}

🔍 Verifying saved data...
📊 Expected 4 points, saved data has 4 points
✅ ROI data verified and saved successfully
```

---

### **Test Case 2: Different ROI Types** ✅ COMPREHENSIVE

```
Repeat Test Case 1 สำหรับแต่ละ ROI type:

Type 1: Intrusion Detection (3+ points)
Type 2: Tripwire Line (2+ points) - วาด 2 จุด
Type 3: Density Monitoring (3+ points) 
Type 4: Zoom Region (1 point)

✅ Expected: ทั้ง 4 type save & reload ได้
```

---

### **Test Case 3: Error Handling - Validation** ❌ ERROR CASES

#### **Case 3A: No points drawn**
```
1. ไม่วาดจุด
2. กด "✅ Save Configuration"

✅ Expected: Alert "⚠️ Please draw at least one region"
✅ Expected: ไม่ navigate
```

#### **Case 3B: No device selected** (ถ้าหากเป็นไปได้)
```
1. วาด 4 จุด
2. ลบ device ID จาก URL (if possible)
3. กด "✅ Save Configuration"

✅ Expected: Alert "⚠️ Please select a device first"
✅ Expected: ไม่ navigate
```

#### **Case 3C: Network Error - Disconnect Network**
```
1. วาด 4 จุด
2. Disconnect network (หรือ close backend)
3. กด "✅ Save Configuration"

✅ Expected: Alert showing network error message
✅ Expected: Console error "❌ Error saving configuration: ..."
✅ Expected: ไม่ navigate
✅ Expected: User สามารถลองใหม่ได้
```

#### **Case 3D: Verification Mismatch** (edge case)
```
ถ้า backend มี bug ที่ทำให้ data บันทึก แต่ point count ผิด:

✅ Expected: Alert "⚠️ Warning: Data saved but verification failed..."
✅ Expected: ไม่ navigate (let user verify)
```

---

### **Test Case 4: Browser DevTools Inspection** 🔍 DEBUG

**Network Tab:**
```
1. กด F12 → Network tab
2. Filter: XHR (เฉพาะ API calls)
3. วาด และ save

✅ Expected: 2 POST requests
   Request 1: POST /mroi/iv-cameras/save-region-config
   Request 2: POST /mroi/iv-cameras/fetch/roi/data

Request 1 Payload:
{
  "rule": [{
    "name": "INTRUSION Zone",
    "type": "intrusion",
    "points": [[x1,y1], [x2,y2], ...],  // ✅ array format
    "timestamp": "..."
  }]
}

Response: 200 OK
{
  "message": "Config saved and restart command sent via SSH/MQTT."
}
```

**Console Tab:**
```
✅ Expected logs (in order):
1. 💾 Saving ROI config: {...}
2. 🔍 Verifying saved data...
3. 📊 Expected X points, saved data has X points
4. ✅ ROI data verified and saved successfully

❌ ไม่ควรมี error logs (ไม่มี red X)
```

---

## 📊 Test Results Template

```
Test Date: ____________
Tester: ________________
Environment: Desktop / Mobile

Test Case 1: Normal Flow _____ PASS / FAIL
  - Load snapshot: _____ PASS / FAIL
  - Draw 4 points: _____ PASS / FAIL
  - Save & verify: _____ PASS / FAIL
  - Reload & check: _____ PASS / FAIL

Test Case 2: Different Types _____ PASS / FAIL
  - Intrusion: _____ PASS / FAIL
  - Tripwire: _____ PASS / FAIL
  - Density: _____ PASS / FAIL
  - Zoom: _____ PASS / FAIL

Test Case 3: Error Handling _____ PASS / FAIL
  - No points: _____ PASS / FAIL
  - Network error: _____ PASS / FAIL
  - Verification mismatch: _____ PASS / FAIL

Test Case 4: DevTools _____ PASS / FAIL
  - Network requests: _____ PASS / FAIL
  - Console logs: _____ PASS / FAIL

Overall Result: _____ ALL PASS / SOME FAIL / CRITICAL FAIL
Issues Found:
1. ...
2. ...
```

---

## 🔍 Debugging Tips

### **If points disappear after reload:**

**Step 1: Check Console Logs**
```
1. F12 → Console
2. ดู message ตอน save
   ✅ Should see: "✅ ROI data verified and saved successfully"
   ❌ If not: check error message
```

**Step 2: Check Network Request**
```
1. F12 → Network
2. ดู POST /save-region-config response
   ✅ Should be 200 OK
   ❌ If error: ดู error message จาก backend
```

**Step 3: Check Database**
```
// Login to database and check:
SELECT metthier_ai_config 
FROM iv_cameras 
WHERE iv_camera_uuid = '<device-id>'
LIMIT 1;

✅ rule array ควรมี points
❌ ถ้า rule empty → backend ไม่บันทึก
❌ ถ้า points format ผิด → data transform issue
```

**Step 4: Check Points Format**
```
// In browser console:
// When page loads, check what fetchIvRoiData returns
fetch('/api/mroi/iv-cameras/fetch/roi/data?schema=metthier&key=<device-id>')
  .then(r => r.json())
  .then(d => console.log(d))

// Points should be:
// ✅ [[x, y], [x, y], ...]
// ❌ NOT [{x, y}, {x, y}, ...]
```

---

## 🎯 Success Criteria Checklist

- [ ] **Code Change 1**: Points transform to [x,y] format ✅
- [ ] **Code Change 2**: Verification logic added ✅
- [ ] **Test Case 1**: Normal draw → save → reload ✅
- [ ] **Test Case 2**: All ROI types work ✅
- [ ] **Test Case 3**: Error handling works ✅
- [ ] **Test Case 4**: DevTools shows correct data ✅
- [ ] **Database**: Points stored in correct format ✅
- [ ] **Performance**: Save + verify < 2 seconds ✅

---

## 🚨 Rollback Instructions (if needed)

### **Git Rollback (if already pushed)**
```bash
git revert <commit-hash>
git push origin main
```

### **Manual Rollback (undo changes)**
```typescript
// In RoiEditor.tsx, revert handleSave to original:
points: canvasState.points,  // Remove transform
// Remove verification logic
navigate('/mroi');  // Direct navigate
```

### **Feature Flag (temporary disable)**
```typescript
const ENABLE_VERIFICATION = false;

if (ENABLE_VERIFICATION) {
  // new logic
} else {
  // old logic
}
```

---

**Test Plan Version**: 1.0  
**Last Updated**: 2025-12-17  
**Status**: Ready for Testing
