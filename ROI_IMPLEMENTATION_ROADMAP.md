# 🔧 Implementation Roadmap - ROI Data Persistence Fix

## 📌 ขั้นตอนการแก้ไข (Step-by-Step)

### **Step 1: Pre-Implementation Checks (ต้องทำก่อน!)**

#### 1.1 ตรวจสอบ Backend Format Support
```typescript
// ✅ Backend iv-cameras.controller.ts ตรวจสอบ:
// saveRegionConfig() รับ body: { rule: any }
// 
// ต้องทราบว่า rule array format:
// ✓ [[x, y], [x, y], ...] ? 
// ✓ [{x, y}, {x, y}, ...] ?
// ✓ ทั้งสองแบบ ?
```

**วิธีตรวจสอบ:**
1. ดู mroi-app-main ที่ส่งข้อมูลสำเร็จ format ไหน
2. ดู iv_camera_repositorys.js ว่า rule array เก็บแบบไหน
3. **ลัพธ์จำเป็นต้องทราบก่อนแก้ไข!**

---

#### 1.2 ตรวจสอบ Database Schema
```sql
-- ต้องทำการ Query เพื่อดู:
-- column: metthier_ai_config เก็บข้อมูล JSON ไหม?
-- rule array format เป็นอะไร?
SELECT metthier_ai_config->'rule'->[0]->'points' 
FROM iv_cameras 
LIMIT 1;
```

---

### **Step 2: Verify Current Behavior (Optional แต่สำคัญ)**

ทำการ test scenario ปัจจุบัน เพื่อระบุปัญหาแน่นอน:

**Test Case 1: Save & Reload**
```
1. เปิด RoiEditor → เลือก device
2. วาด 4 จุด สร้าง square
3. เลือก ROI Type: "Intrusion Detection"
4. กด "✅ Save Configuration"
5. ✅ Verify: alert "✅ ROI configuration saved successfully!"
6. ✅ Verify: redirect ไปหน้า "/mroi"

7. กลับไปหน้า RoiEditor เดิม
8. ❓ ISSUE: จุดที่วาดมา หายไปหรือยังอยู่?
   - ถ้าหายไป → ปัญหามีอยู่ ✓
   - ถ้ายังอยู่ → ปัญหาเป็นอย่างอื่น
```

**Test Case 2: Check Browser Console**
```
1. เปิด Developer Tools (F12)
2. Console tab → ดู log message
3. มี error อะไรไหม?

4. Network tab → ดู HTTP requests
5. POST /mroi/iv-cameras/save-region-config
   - Status 200 ใช่ไหม?
   - Response body เป็นอะไร?
```

---

### **Step 3: Code Changes (ตามลำดับ)**

#### **Change 3.1: Fix Data Format (RoiEditor.tsx บรรทัด 210-240)**

**Before:**
```typescript
const handleSave = async () => {
    // ... validation code ...
    
    const config = {
        rule: [
            {
                name: `${canvasState.roiType.toUpperCase()} Zone`,
                type: canvasState.roiType,
                points: canvasState.points,  // ❌ [{x, y}, ...]
                timestamp: new Date().toISOString(),
            },
        ],
    };

    await updateIvRegionConfig(customer, selectedDeviceId, config.rule);
    alert('✅ ROI configuration saved successfully!');
    navigate('/mroi');
};
```

**After:**
```typescript
const handleSave = async () => {
    // ... validation code ...
    
    // ✅ Transform points to [[x, y], ...] format
    const transformedPoints = canvasState.points.map(p => [p.x, p.y]);
    
    const config = {
        rule: [
            {
                name: `${canvasState.roiType.toUpperCase()} Zone`,
                type: canvasState.roiType,
                points: transformedPoints,  // ✅ [[x, y], ...]
                timestamp: new Date().toISOString(),
            },
        ],
    };

    await updateIvRegionConfig(customer, selectedDeviceId, config.rule);
    alert('✅ ROI configuration saved successfully!');
    navigate('/mroi');
};
```

**Risk**: 🟡 LOW - เปลี่ยนแค่ data format ก่อนส่ง

---

#### **Change 3.2: Add Data Verification (RoiEditor.tsx บรรทัด 233)**

**Before:**
```typescript
await updateIvRegionConfig(customer, selectedDeviceId, config.rule);
alert('✅ ROI configuration saved successfully!');
navigate('/mroi');  // ❌ redirect ทันที ไม่ verify
```

**After:**
```typescript
setIsSaving(true);
try {
    await updateIvRegionConfig(customer, selectedDeviceId, config.rule);
    
    // ✅ Verify: Fetch data to confirm save was successful
    const verifyData = await fetchIvRoiData(customer, selectedDeviceId);
    
    if (verifyData?.rule && verifyData.rule.length > 0) {
        const savedPoints = verifyData.rule[0].points || [];
        const expectedCount = canvasState.points.length;
        
        if (savedPoints.length === expectedCount) {
            // ✅ Save verified!
            alert('✅ ROI configuration saved successfully!');
            navigate('/mroi');
        } else {
            // ⚠️ Save mismatch
            alert(`⚠️ Save warning: Expected ${expectedCount} points, got ${savedPoints.length}`);
            // ❌ Don't navigate - let user verify
        }
    } else {
        // ❌ No data found after save
        alert('❌ Error: Could not verify saved configuration');
    }
} catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
    alert(`❌ Error saving configuration: ${errorMsg}`);
    console.error('Error saving configuration:', error);
} finally {
    setIsSaving(false);
}
```

**Risk**: 🟠 MEDIUM - เพิ่ม network call เพิ่มเติม (ต้อง verify format ของ response)

---

### **Step 4: Testing Strategy**

#### **Test 4.1: Unit Test (ถ้าต้อง)**
```typescript
describe('RoiEditor - Data Format Transform', () => {
    it('should transform points from {x,y} to [x,y] format', () => {
        const points = [{x: 100, y: 200}, {x: 300, y: 400}];
        const transformed = points.map(p => [p.x, p.y]);
        
        expect(transformed).toEqual([[100, 200], [300, 400]]);
    });
});
```

#### **Test 4.2: Integration Test**
```typescript
describe('RoiEditor - Save & Load Flow', () => {
    it('should save and reload ROI data correctly', async () => {
        // 1. Draw points
        // 2. Save via handleSave()
        // 3. Fetch data via fetchIvRoiData()
        // 4. Verify points count matches
    });
});
```

#### **Test 4.3: Manual Test (สำคัญที่สุด!)**
```
1. Test: ปกติ Save → Reload
   Input: Draw 4 points
   Expected: Points display after reload
   
2. Test: Save ด้วยหลาย Type
   Input: Try Intrusion, Tripwire, Density, Zoom
   Expected: All types save correctly
   
3. Test: Error Handling
   Input: Disconnect network, Save → Reconnect
   Expected: Error message, No navigation, Can retry
   
4. Test: Edge Cases
   Input: Single point, Max points, Duplicate coordinates
   Expected: Handle gracefully
```

---

### **Step 5: Rollback Plan (หากพบปัญหา)**

#### **Option A: Git Rollback (ถ้า commit แล้ว)**
```bash
# ดู commit history
git log --oneline -n 10

# Revert ไป commit ก่อนหน้า
git revert <commit-hash>

# Push กลับไปคน repo
git push origin main
```

#### **Option B: Manual Revert (ถ้ายังไม่ commit)**
```typescript
// เปลี่ยนกลับไป original code:
points: canvasState.points  // ไม่ map format
// Remove verify logic
// Restore original navigate
```

#### **Option C: Feature Flag (Safest)**
```typescript
const ENABLE_ROI_VERIFY = false; // Set false to disable new logic

if (ENABLE_ROI_VERIFY) {
    // ... new verification logic ...
} else {
    // ... old logic ...
}
```

---

## 🎯 **Success Criteria**

| Criteria | Before | After | Status |
|----------|--------|-------|--------|
| Draw → Save | ✅ Works | ✅ Works | No change |
| Save → Reload | ❌ Points disappear | ✅ Points persist | ✓ FIX |
| Data Format | {x, y} | [[x, y]] | ✓ CHANGE |
| Error Handling | basic alert | detailed alert + verify | ✓ IMPROVE |
| Performance | ~500ms save | ~1000ms (save + verify) | ✓ ACCEPTABLE |

---

## ⏱️ **Timeline Estimate**

| Phase | Task | Time | Notes |
|-------|------|------|-------|
| **Pre** | Verify backend format | 15 min | Critical! |
| **Code** | Make changes 3.1 + 3.2 | 20 min | Straightforward edits |
| **Test** | Manual test scenarios | 45 min | Most important |
| **Review** | Code review + QA | 30 min | Before merge |
| **Deploy** | Commit + Push | 10 min | Post to repo |
| **Total** | | ~2 hours | Realistic estimate |

---

## 📋 **Approval Gate**

**ก่อน start implementation, ต้องได้ไป "thumbs up" จาก:**

- [ ] ผู้ใช้: ยืนยันว่าเข้าใจแผนและ risk
- [ ] Code Reviewer: ตรวจสอบ code design
- [ ] QA: เตรียม test case
- [ ] Ops: เตรียม deployment & rollback

---

## 📞 **Contact & Escalation**

หากพบปัญหาระหว่างแก้ไข:
- **Data Loss Risk**: ❌ Rollback ทันที + investigate
- **Performance Issue**: ⚠️ Optimize verify query
- **Format Incompatibility**: ⚠️ Adjust data transform logic

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-17  
**Status**: 📋 READY FOR IMPLEMENTATION
