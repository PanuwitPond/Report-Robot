# 📋 MROI Editor - สถาปัตยกรรมการออกแบบระบบ (Architecture Analysis)

**วันที่: 17 ธันวาคม 2025**
**สถานะ: การวิเคราะห์ออกแบบเท่านั้น (No Implementation)**

---

## 1️⃣ ภาพรวมของระบบปัจจุบัน (Current System Overview)

### ❌ ปัญหา: RoiEditor.tsx มีโครงสร้างไม่สมบูรณ์

**ขณะนี้:**
- เก็บเพียง **1 Rule** เท่านั้น
- ไม่มี **Rule List** ที่แสดงหลาย Rules
- ไม่มี **Details Panel** ที่แสดงรายละเอียด
- ไม่มี **Schedule Controls** (เคลื่อนไปมา)
- ไม่มีปุ่ม "Create New Rule"

**เป้าหมาย (Target Design):**
- เก็บหลาย Rules ได้ **สูงสุด 6 Rules**
- แสดง **Rule List** ที่เลือกได้
- แสดง **Details Panel** สำหรับแต่ละ Rule
- รวม **Schedule Controls** ในหน้าเดียว

---

## 2️⃣ การเปรียบเทียบระหว่าง mroi-app-main vs RoiEditor.tsx

### 📊 ตาราเปรียบเทียบโครงสร้าง

| ลักษณะ | mroi-app-main (tools_draw.jsx) | RoiEditor.tsx (ปัจจุบัน) | ต้องทำ |
|--------|--------|--------|--------|
| **จำนวน Rules** | หลาย Rules (unlimited) | 1 Rule เท่านั้น | ✅ เพิ่มเป็น Array |
| **Rule List (Sidebar)** | ✅ มี - แสดงทั้งหมด | ❌ ไม่มี | ✅ ต้องเพิ่ม |
| **Max Rules** | MAX_TOTAL_REGION = 6 | ไม่มีการจำกัด | ✅ ต้องเพิ่ม |
| **Details Panel** | ✅ SetupEditor.jsx | ❌ ไม่มี | ✅ ต้องเพิ่ม |
| **Create New Rule** | ✅ Button ใน Sidebar | ❌ ไม่มี | ✅ ต้องเพิ่ม |
| **Schedule Controls** | ✅ ScheduleControls.jsx | ❌ ไม่มี | ✅ ต้องเพิ่ม |
| **Rule Type Selector** | ✅ ใน SetupEditor | ✅ มี แต่ไม่สมบูรณ์ | ✅ ต้องสมบูรณ์ |
| **Enable Draw Mode** | ✅ Button ที่เปลี่ยน Save/Clear | ✅ มี แต่ไม่เปลี่ยน | ✅ ต้องแก้ |
| **Status Toggle** | ✅ ON/OFF Switch | ❌ ไม่มี | ✅ ต้องเพิ่ม |
| **Delete Rule** | ✅ Confirm Modal | ❌ ไม่มี | ✅ ต้องเพิ่ม |

---

## 3️⃣ โครงสร้าง UI/Layout ที่ต้องการ

### 📐 Layout Blueprint ตามภาพที่ชั้นให้มา

```
┌────────────────────────────────────────────────────────────┐
│                      HEADER (Back Button)                  │
├────────────────────────────────────────────────────────────┤
│   ┌─────────────────┐           ┌─────────────────────┐   │
│   │  RULE LIST      │           │  CANVAS AREA        │   │
│   │  (Sidebar)      │           │  + SNAPSHOT         │   │
│   │  Circled 1️⃣    │           │                     │   │
│   │                 │           │  Max 6 Rules ⊙2️⃣  │   │
│   │ ┌─────────────┐ │           │                     │   │
│   │ │ Rule 1 ✓    │ │           │ [Canvas Image]      │   │
│   │ │ Intrusion   │ │           │ with Drawing        │   │
│   │ └─────────────┘ │           └─────────────────────┘   │
│   │                 │                                      │
│   │ ┌─────────────┐ │           ┌─────────────────────┐   │
│   │ │ Rule 2      │ │           │ DETAILS PANEL       │   │
│   │ │ Tripwire    │ │           │ (SetupEditor)       │   │
│   │ └─────────────┘ │           │ Circled 3️⃣         │   │
│   │                 │           │                     │   │
│   │ ┌─────────────┐ │           │ Rule Name:  [____]  │   │
│   │ │ Rule 3      │ │           │ Rule Type:  [v]     │   │
│   │ │ Density     │ │           │                     │   │
│   │ └─────────────┘ │           │ Schedule:           │   │
│   └─────────────────┘           │ ┌─────────────────┐ │   │
│                                  │ Start Time: [__] │ │   │
│                                  │ End Time:   [__] │ │   │
│                                  │ Confidence: [__] │ │   │
│                                  │ Duration:   [__] │ │   │
│                                  │ Direction:  [v]  │ │   │
│                                  │ AI Type:    [v]  │ │   │
│                                  │ └─────────────────┘ │   │
│                                  │                     │   │
│                                  │ Info Section:       │   │
│                                  │ Date Created: [--] │   │
│                                  │ Created By:   [--] │   │
│                                  │ Date Updated: [--] │   │
│                                  │                     │   │
│                                  │ [Save] [Delete]    │   │
│                                  │ Circled 6️⃣       │   │
│                                  └─────────────────────┘   │
├────────────────────────────────────────────────────────────┤
│              [Discard Change]        [Apply]              │
└────────────────────────────────────────────────────────────┘
```

### 📍 ตำแหน่งส่วนประกอบตามวงกลม

**① Rule List (Sidebar)**
- แสดงรายการ Rules ทั้งหมด
- เลือก Rule เพื่อแก้ไข
- แสดง ON/OFF Status Toggle
- มีปุ่ม Delete สำหรับแต่ละ Rule
- แสดง "+Create Rule" เมื่อ < 6 Rules

**② Canvas Area**
- ดูภาพ Snapshot จากกล้อง
- วาดจุดบนภาพ
- แสดง Max 6 Rules (ถ้าวาดหลาย Rules)
- ข้อมูล: Enable Draw Mode ก่อนจึงจะวาดได้

**③ Details Panel (SetupEditor)**
- **Edit Fields:**
  - Rule Name (พิมพ์เปลี่ยนได้)
  - Rule Type Selector (เลือก Intrusion/Tripwire/Density/Zoom/Health)
  - Schedule Controls (Start/End Time, Confidence, Duration, Direction, AI Type)
- **Info Fields (Read-Only):**
  - Date Created: วันที่สร้าง Rule (DD/MM/YYYY)
  - Created By: บทบาท/ชื่อผู้ใช้ที่สร้าง (e.g., METTHIER, Admin)
  - Date Updated: วันที่แก้ไขล่าสุด (DD/MM/YYYY HH:mm:ss) - แสดงเมื่อมีการแก้ไข
- **Action Buttons:**
  - Save (บันทึกการเปลี่ยนแปลงของ Rule นี้)
  - Delete (ลบ Rule พร้อม Confirm Modal)

**④ Create New Rule Button**
- แสดงใน Rule List 
- กดเพื่อสร้าง Rule ใหม่
- ห้ามสร้างถ้า >= 6 Rules

**⑤ Enable Draw Mode Button**
- เปลี่ยนเป็น "Save" + "Clear" buttons หลังกด
- อนุญาตให้วาดบน Canvas

**⑥ Save/Delete Buttons**
- ปุ่ม Save ในส่วน Details Panel
- ปุ่ม Delete สำหรับลบ Rule

---

## 4️⃣ State Structure ที่ต้องเปลี่ยน

### ❌ ปัจจุบัน (Single Rule):
```typescript
interface CanvasState {
    isDrawing: boolean;
    points: Array<{ x: number; y: number }>;
    roiType: 'intrusion' | 'tripwire' | 'density' | 'zoom';
}
```

### ✅ ควรเป็น (Multiple Rules):
```typescript
interface Rule {
    roi_id: string;                    // UUID เพื่อ unique identifier
    name: string;                      // Rule Name
    roi_type: 'intrusion' | 'tripwire' | 'density' | 'zoom' | 'health';
    points: Array<[number, number]>;   // [[x, y], [x, y], ...]
    roi_status: 'ON' | 'OFF';          // Status Toggle
    
    // 📅 Metadata (Audit Trail)
    created_date: string;              // "DD/MM/YYYY"
    created_by: string;                // บทบาท/ชื่อผู้ใช้ (e.g., "METTHIER", "Admin")
    updated_at?: string;               // "DD/MM/YYYY HH:mm:ss" (อัพเดท ล่าสุด)
    
    // Schedule & Surveillance
    schedule?: Array<{                 // สำหรับ non-zoom rules
        surveillance_id: string;
        ai_type: string;
        start_time: string;            // "HH:mm:ss"
        end_time: string;              // "HH:mm:ss"
        direction: string;             // "Both", "A to B", "B to A"
        confidence_threshold: number;
        confidence_zoom: number;
        duration_threshold_seconds: number;
    }>;
    surveillance_id?: string;          // สำหรับ zoom rules เท่านั้น
}

interface RegionAIConfig {
    rule: Array<Rule>;  // หลาย Rules!
}

interface CanvasState {
    isDrawing: boolean;
    enableDrawMode: boolean;           // ใหม่: ควบคุม Enable/Disable mode
    currentPoints: Array<{ x: number; y: number }>; // Points ที่วาดอยู่
}
```

---

## 5️⃣ᴬ Details Panel - Field Specifications (วงกลม ③)

### 🔧 Editable Fields (สามารถแก้ไขได้)

| ชื่อ Field | ประเภท | ข้อมูล | หมายเหตุ |
|-----------|--------|--------|---------|
| **Rule Name** | Text Input | "Main Gate" | ต้องกรอก, max 50 chars |
| **Rule Type** | Select Dropdown | "intrusion" | Select: Intrusion/Tripwire/Density/Zoom/Health |
| **Start Time** | Time Picker | "00:00:00" | Format HH:mm:ss (non-zoom only) |
| **End Time** | Time Picker | "23:59:59" | Format HH:mm:ss (non-zoom only) |
| **Confidence** | Number Input | 0.7 | Range 0.0-1.0 (non-zoom only) |
| **Confidence Zoom** | Number Input | 0.5 | Range 0.0-1.0 (non-zoom only) |
| **Duration** | Number Input | 0 | Seconds (non-zoom only) |
| **Direction** | Select Dropdown | "Both" | Options: Both, A to B, B to A (non-zoom only) |
| **AI Type** | Select Dropdown | "intrusion" | Options: intrusion, people_counting, loitering (non-zoom only) |

### 📄 Read-Only Fields (แสดงเท่านั้น ไม่แก้ไข)

| ชื่อ Field | ประเภท | ข้อมูล | หมายเหตุ |
|-----------|--------|--------|---------|
| **Date Created** | Text Display | "17/12/2025" | แสดงจาก `created_date` (DD/MM/YYYY) |
| **Created By** | Text Display | "METTHIER" | แสดงจาก `created_by` (บทบาท/ชื่อผู้ใช้) |
| **Date Updated** | Text Display | "17/12/2025 14:30:45" | แสดงจาก `updated_at` (DD/MM/YYYY HH:mm:ss) - ว่างถ้าไม่เคยแก้ไข |

### 💾 Action Buttons

| ปุ่ม | ฟังก์ชัน | เงื่อนไข |
|-----|---------|---------|
| **Save** | บันทึก Rule เฉพาะอันนี้ | Enable เมื่อมีการแก้ไข Rule Name หรือ Type |
| **Delete** | ลบ Rule พร้อม Confirm Modal | Enable เสมอ |

---

## 5️⃣ User Workflow (ขั้นตอนการใช้งาน)

### 🎯 Scenario 1: สร้าง Rule ใหม่

```
1. ชั้น: เข้าหน้า MROI Editor
   - เลือก Device
   - ดาวน์โหลด Snapshot
   - แสดง Rule List (ว่าง)
   
2. ชั้น: กด "Create New Rule"
   - สร้าง Rule object ใหม่
   - เพิ่มลงใน regionAIConfig.rule array
   - ตั้ง selectedRule = Rule ใหม่
   
3. ชั้น: ตั้ง Rule Name และ Type
   - พิมพ์ชื่อ Rule
   - เลือก Type (e.g., Intrusion)
   - Details Panel อัปเดตตามไป
   
4. ชั้น: กด "Enable Draw Mode"
   - ปุ่มเปลี่ยนเป็น "Save" + "Clear"
   - Canvas border เปลี่ยนสี (เน้น)
   - สามารถวาดได้
   
5. ชั้น: วาดบน Canvas
   - คลิกเพื่อเพิ่มจุด
   - ดูจุดและเส้นปรากฏบน Canvas
   - currentPoints อัปเดต
   
6. ชั้น: เสร็จวาด → กด "Save"
   - ตรวจสอบ min points:
     * intrusion/density: >= 3
     * tripwire: >= 2
     * zoom: >= 1
   - ปุ่ม Enable Draw Mode กลับปกติ
   - points → selectedRule.points
   - Rule List แสดง Rule ใหม่
   
7. ชั้น: ตั้ง Schedule (สำหรับ non-zoom)
   - กำหนด Start/End Time
   - ตั้ง Confidence
   - เลือก Direction
   - เลือก AI Type
   
8. ชั้น: กด "Apply" ที่ footer
   - บันทึกทั้งหมดลง Database
   - โหลด Snapshot ใหม่
   - กลับไปหน้า Dashboard
```

### 🎯 Scenario 2: แก้ไข Rule ที่มีอยู่

```
1. ชั้น: กด Rule ในรายการ
   - selectedRule = Rule ที่เลือก
   - Details Panel แสดง Rule name/type/schedule
   - Canvas แสดง Points ของ Rule นั้น
   
2. ชั้น: แก้ไข Rule Name
   - พิมพ์ชื่อใหม่
   - selectedRule.name อัปเดต
   
3. ชั้น: เปลี่ยน Rule Type
   - เลือก Type ใหม่
   - schedule และ properties อัปเดต
   - Points คงเดิม (ถ้าเปลี่ยน zoom ↔ non-zoom ต้องมีข้อควรระวัง)
   
4. ชั้น: แก้ไข Points (กด "Enable Draw Mode")
   - Clear points เดิม
   - วาด Points ใหม่
   - กด Save
   
5. ชั้น: แก้ไข Schedule
   - เปลี่ยน Start/End Time
   - อัปเดต Confidence/Duration/Direction
   
6. ชั้น: กด "Apply"
   - บันทึกลง Database
```

### 🎯 Scenario 3: ลบ Rule

```
1. ชั้น: กด Rule ในรายการ
   
2. ชั้น: กด ปุ่ม "Delete" ในรายการ
   - แสดง Confirm Modal
   
3. ชั้น: กด "Confirm Delete"
   - ลบ Rule ออกจาก array
   - Clear selectedRule
   - Canvas วาง
   - Rule List อัปเดต
   
4. ชั้น: กด "Apply"
   - บันทึกลง Database
```

---

## 6️⃣ ส่วนประกอบใหม่ที่ต้องสร้าง

### ✨ Components/Sections ที่ต้องแยกออก

| ชื่อ | ที่มา | ประเภท | ความสำคัญ |
|------|------|--------|----------|
| **Sidebar.tsx** | sidebar.jsx | New Component | P0 |
| **SetupEditor.tsx** | setup_editor.jsx | New Component | P0 |
| **ScheduleControls.tsx** | schedule.jsx | New Component | P1 |
| **RuleList Component** | N/A | New (Enhanced Sidebar) | P0 |
| **Canvas Enhanced** | Current | Modify | P1 |
| **State Management** | N/A | Refactor | P0 |

### 📦 ไฟล์โครงสร้าง

```
frontend/src/pages/mroi/
├── RoiEditor.tsx              (Main Component - will refactor)
├── RoiEditor.css              (Update layout)
├── components/
│   ├── RuleList/
│   │   ├── RuleList.tsx       (Sidebar with Rules)
│   │   └── RuleList.css
│   ├── SetupEditor/
│   │   ├── SetupEditor.tsx    (Details Panel)
│   │   └── SetupEditor.css
│   ├── ScheduleControls/
│   │   ├── ScheduleControls.tsx
│   │   └── ScheduleControls.css
│   └── DrawingCanvas/
│       ├── DrawingCanvas.tsx  (Enhanced Canvas)
│       └── DrawingCanvas.css
└── types/
    └── mroi.ts                (Type Definitions)
```

---

## 7️⃣ ข้อแตกต่างสำคัญ

### 🔄 เปลี่ยน: Data Format

**ปัจจุบัน (Single Rule):**
```json
{
    "rule": [
        {
            "name": "INTRUSION Zone",
            "type": "intrusion",
            "points": [[100, 200], [200, 250], ...],
            "timestamp": "2025-12-17T12:00:00Z"
        }
    ]
}
```

**ควรเป็น (Multiple Rules):**
```json
{
    "rule": [
        {
            "roi_id": "uuid-1",
            "name": "Main Gate",
            "roi_type": "intrusion",
            "points": [[100, 200], [200, 250], ...],
            "roi_status": "ON",
            "schedule": [
                {
                    "surveillance_id": "uuid-sch1",
                    "ai_type": "intrusion",
                    "start_time": "00:00:00",
                    "end_time": "23:59:59",
                    "direction": "Both",
                    "confidence_threshold": 0.7,
                    "confidence_zoom": 0.5,
                    "duration_threshold_seconds": 0
                }
            ],
            "created_date": "17/12/2025",
            "created_by": "METTHIER",
            "updated_at": "17/12/2025 12:00:00"
        },
        {
            "roi_id": "uuid-2",
            "name": "Zoom Region",
            "roi_type": "zoom",
            "points": [[640, 384]],
            "surveillance_id": "uuid-zoom1",
            "created_date": "17/12/2025",
            "created_by": "METTHIER"
        }
    ]
}
```

---

## 7️⃣ ตัวอย่าง Details Panel UI (วงกลม ③)

### 📐 Layout ของ SetupEditor Component

```
┌─────────────────────────────────────────────────────┐
│              DETAILS PANEL                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📋 Rule Information                                │
│  ┌─────────────────────────────────────────────┐   │
│  │ Rule Name:     [______________________]      │   │
│  │ Rule Type:     [Intrusion ▼]                │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ⏰ Schedule Configuration (Non-Zoom Only)          │
│  ┌─────────────────────────────────────────────┐   │
│  │ Start Time:    [__:__:__ ▼] (00:00:00)      │   │
│  │ End Time:      [__:__:__ ▼] (23:59:59)      │   │
│  │ Confidence:    [___] (0.0-1.0)              │   │
│  │ Confidence Z:  [___] (0.0-1.0)              │   │
│  │ Duration:      [___] seconds                │   │
│  │ Direction:     [Both ▼]                     │   │
│  │ AI Type:       [intrusion ▼]                │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  📅 Audit Information (Read-Only)                   │
│  ┌─────────────────────────────────────────────┐   │
│  │ Date Created:  17/12/2025                   │   │
│  │ Created By:    METTHIER                     │   │
│  │ Date Updated:  17/12/2025 14:30:45          │   │
│  │                (empty if not modified)      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [💾 Save]  [🗑️ Delete]                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 🔄 State Update Flow เมื่อสร้าง/แก้ไข Rule

```
สร้าง Rule ใหม่:
┌─────────────────────────────────────────────────────┐
│ Rule Object ที่สร้าง                                │
├─────────────────────────────────────────────────────┤
│ roi_id:         uuidv4()         (auto-generate)   │
│ name:           ""               (user input)      │
│ roi_type:       "intrusion"      (default)         │
│ points:         []               (empty)           │
│ roi_status:     "OFF"            (default)         │
│ created_date:   "17/12/2025"     (today)          │
│ created_by:     "METTHIER"       (from context)   │
│ updated_at:     (undefined)      (no update yet)  │
│ schedule:       [defaultSchedule]                 │
└─────────────────────────────────────────────────────┘

แก้ไข Rule ที่มีอยู่:
┌─────────────────────────────────────────────────────┐
│ Rule Object ที่เลือก + การแก้ไข                     │
├─────────────────────────────────────────────────────┤
│ ... (ค่าเดิมทั้งหมด)                               │
│ name:           "Main Gate"      (user changed)   │
│ roi_type:       "intrusion"      (user changed)   │
│ updated_at:     "17/12/2025 14:30:45" (now)      │
│                 ← Updated เมื่อมีการแก้ไข         │
└─────────────────────────────────────────────────────┘
```

---

## 7️⃣ ข้อมูลเพิ่มเติม: Audit Trail

### 📝 หลักการ created_date, created_by, updated_at

| Field | ตั้งค่า | ลบ | แก้ไข | หมายเหตุ |
|-------|--------|-----|--------|---------|
| **created_date** | ✅ ตั้งเมื่อสร้าง | ❌ ไม่ | ❌ ไม่ | DD/MM/YYYY (เช่น 17/12/2025) |
| **created_by** | ✅ ตั้งจากผู้ใช้ปัจจุบัน | ❌ ไม่ | ❌ ไม่ | บทบาท (e.g., "METTHIER", "Admin") |
| **updated_at** | ❌ ว่าง (undefined) | ❌ ไม่ | ✅ เป็นเวลา | DD/MM/YYYY HH:mm:ss เมื่อแก้ไข |

### 💡 Use Cases

1. **ทำไมต้องมี created_date & created_by?**
   - ✅ สำหรับ Audit Trail (ตรวจสอบว่าใครสร้าง Rule เมื่อไร)
   - ✅ เพื่อให้เห็นประวัติการสร้าง Rule
   - ✅ สำหรับ Compliance & Security

2. **ทำไมต้องมี updated_at?**
   - ✅ สำหรับติดตามการแก้ไข Rule
   - ✅ เพื่อให้เห็นวิวัฒนาการของ Rule
   - ✅ ถ้ามี updated_at = Rule ถูกแก้ไข, ถ้าไม่มี = Rule ยังไม่เคยแก้ไข

3. **ตัวอย่างการใช้:**
   ```
   User A สร้าง Rule "Main Gate" วันที่ 17/12/2025 09:00:00
   - created_by: "METTHIER"
   - created_date: "17/12/2025"
   - updated_at: (undefined)
   
   User B แก้ไข Rule วันที่ 17/12/2025 14:30:45
   - created_by: "METTHIER" (ไม่เปลี่ยน)
   - created_date: "17/12/2025" (ไม่เปลี่ยน)
   - updated_at: "17/12/2025 14:30:45" (ตั้งเป็นเวลาปัจจุบัน)
   ```

---

## 8️⃣ ข้อมูลเพิ่มเติมในตัวอย่าง Data Structure

### 🎯 JSON Response Example ที่มี Metadata

```json
{
  "rule": [
    {
      "roi_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Main Gate Intrusion",
      "roi_type": "intrusion",
      "points": [[100, 200], [200, 250], [200, 100], [100, 100]],
      "roi_status": "ON",
      "schedule": [
        {
          "surveillance_id": "550e8400-e29b-41d4-a716-446655440001",
          "ai_type": "intrusion",
          "start_time": "00:00:00",
          "end_time": "23:59:59",
          "direction": "Both",
          "confidence_threshold": 0.7,
          "confidence_zoom": 0.5,
          "duration_threshold_seconds": 0
        }
      ],
      "created_date": "17/12/2025",
      "created_by": "METTHIER",
      "updated_at": "17/12/2025 14:30:45"
    },
    {
      "roi_id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Entrance Tripwire",
      "roi_type": "tripwire",
      "points": [[150, 300], [750, 300]],
      "roi_status": "OFF",
      "schedule": [
        {
          "surveillance_id": "550e8400-e29b-41d4-a716-446655440003",
          "ai_type": "intrusion",
          "start_time": "09:00:00",
          "end_time": "17:00:00",
          "direction": "A to B",
          "confidence_threshold": 0.6,
          "confidence_zoom": 0.5,
          "duration_threshold_seconds": 2
        }
      ],
      "created_date": "16/12/2025",
      "created_by": "METTHIER",
      "updated_at": null  // ยังไม่เคยแก้ไข
    },
    {
      "roi_id": "550e8400-e29b-41d4-a716-446655440004",
      "name": "Parking Zoom",
      "roi_type": "zoom",
      "points": [[640, 384]],
      "surveillance_id": "550e8400-e29b-41d4-a716-446655440005",
      "created_date": "15/12/2025",
      "created_by": "Admin"
      // Note: zoom rules ไม่มี schedule, roi_status, updated_at
    }
  ]
}
```

---

## 8️⃣ SetupEditor Component - Props & Functions

### 📦 Component Props

```typescript
interface SetupEditorProps {
  // Rule Data
  dataSelectedROI: Rule | null;
  setDataSelectedROI: (rule: Rule | null) => void;
  setSelectedTool: (tool: string) => void;
  
  // Helper Functions
  handleResetPoints: () => void;
  
  // Constraints
  MAX_ZOOM_REGION: number;        // e.g., 1
  zoomCount: number;              // จำนวน Zoom Rules ที่มีอยู่
}
```

### 🔧 Key Functions ใน SetupEditor

```typescript
// 1. Update Rule Name
const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
  setDataSelectedROI(prev => ({ 
    ...prev, 
    name: e.target.value 
  }));
};

// 2. Update Rule Type (with side effects)
const handleRuleTypeChange = (newType: string) => {
  setDataSelectedROI(prev => {
    const updated = { ...prev, roi_type: newType };
    
    // Clean up based on type
    if (newType === 'zoom') {
      delete updated.schedule;
      delete updated.roi_status;
      updated.surveillance_id = updated.surveillance_id || uuidv4();
    } else {
      delete updated.surveillance_id;
      updated.roi_status = 'OFF';
      if (!updated.schedule) {
        updated.schedule = [defaultScheduleObject];
      }
    }
    
    // ⚠️ อย่าเปลี่ยน created_date, created_by, updated_at
    return updated;
  });
};

// 3. Update Schedule
const handleScheduleChange = (scheduleIndex: number, field: string, value: any) => {
  setDataSelectedROI(prev => {
    const updated = { ...prev };
    if (updated.schedule && updated.schedule[scheduleIndex]) {
      updated.schedule[scheduleIndex] = {
        ...updated.schedule[scheduleIndex],
        [field]: value
      };
    }
    return updated;
  });
};

// 4. Display Read-Only Info
const renderAuditInfo = () => {
  return (
    <div className="audit-section">
      <div className="info-row">
        <label>Date Created:</label>
        <span>{dataSelectedROI?.created_date || '-'}</span>
      </div>
      <div className="info-row">
        <label>Created By:</label>
        <span>{dataSelectedROI?.created_by || '-'}</span>
      </div>
      <div className="info-row">
        <label>Date Updated:</label>
        <span>{dataSelectedROI?.updated_at || '(Not modified yet)'}</span>
      </div>
    </div>
  );
};

// 5. Handle Save (with updated_at update)
const handleSave = async () => {
  if (!dataSelectedROI) return;
  
  const now = dayjs().format('DD/MM/YYYY HH:mm:ss');
  const ruleToSave = {
    ...dataSelectedROI,
    updated_at: now  // ← ตั้ง updated_at เมื่อบันทึก
  };
  
  // Update regionAIConfig
  setRegionAIConfig(prev => {
    const updatedRules = [...prev.rule];
    const index = updatedRules.findIndex(r => r.roi_id === ruleToSave.roi_id);
    if (index >= 0) {
      updatedRules[index] = ruleToSave;
    }
    return { ...prev, rule: updatedRules };
  });
  
  alert('✅ Rule saved!');
};

// 6. Handle Delete
const handleDelete = () => {
  Modal.confirm({
    title: 'Delete Rule?',
    content: `Are you sure you want to delete "${dataSelectedROI?.name}"?`,
    okText: 'Delete',
    cancelText: 'Cancel',
    onOk: () => {
      // ลบออกจาก regionAIConfig
      setRegionAIConfig(prev => ({
        ...prev,
        rule: prev.rule.filter(r => r.roi_id !== dataSelectedROI?.roi_id)
      }));
      setDataSelectedROI(null);
    }
  });
};
```

---

## 9️⃣ State Updates Timeline

### 📌 สิ่งที่เกิดขึ้นในแต่ละช่วง

```
Timeline: สร้าง → แก้ไข → บันทึก

[1] สร้าง Rule ใหม่
    ↓
    {
      roi_id: "uuid-new",
      name: "New Rule",
      roi_type: "intrusion",
      points: [],
      roi_status: "OFF",
      created_date: "17/12/2025",    ← Set now
      created_by: "METTHIER",        ← Set from auth
      updated_at: undefined,         ← Empty
      schedule: [...]
    }

[2] ผู้ใช้แก้ไข Rule Name
    ↓
    {
      ...(same as above),
      name: "Main Gate",             ← Changed
      updated_at: undefined          ← Still empty
    }

[3] ผู้ใช้กด "Save"
    ↓
    {
      ...(same as above),
      updated_at: "17/12/2025 14:30:45"  ← Set now
    }

[4] ผู้ใช้แก้ไข Rule Name อีกครั้ง
    ↓
    {
      ...(same as above),
      name: "Main Gate - Updated",   ← Changed
      updated_at: "17/12/2025 14:30:45"  ← Still old
    }

[5] ผู้ใช้กด "Save" อีกครั้ง
    ↓
    {
      ...(same as above),
      updated_at: "17/12/2025 15:45:00"  ← Updated to now
    }
```

---

## 1️⃣0️⃣ Visual Rendering Differences

**ปัจจุบัน:**
- Canvas วาดเพียง 1 Rule
- สีเดียว (Red)

**ควรเป็น:**
- Canvas วาด Multiple Rules พร้อมกัน
- สีต่างกันตามประเภท:
  - Intrusion: Red (#ff4444)
  - Tripwire: Cyan (#00ffff)
  - Density: Blue (#1E39C3)
  - Zoom: Gold (gold color)
  - Health: Green (#23F770)
- Current drawing (ขณะวาด) = สีตามที่เลือก

### 🔌 Button Flow Changes

**ปัจจุบัน:**
```
┌─────────────────┐
│ Undo | Clear    │
└─────────────────┘
        ↓
┌─────────────────┐
│ Save Config     │ (บันทึกลง DB)
│ Cancel          │
└─────────────────┘
```

**ควรเป็น:**
```
Mode: Normal
┌──────────────────────┐
│ Enable Draw Mode     │ ← toggle mode
└──────────────────────┘
        ↓
Mode: Drawing
┌──────────────────────┐
│ Save (Rule)          │ ← บันทึก Points ของ Rule
│ Clear (Points)       │ ← Clear Points ขณะวาด
└──────────────────────┘
        ↓
Footer: Always visible
┌──────────────────────┐
│ Discard Change       │ ← ยกเลิกทั้งหมด
│ Apply (to Database)  │ ← บันทึกลง DB
└──────────────────────┘
```

---

## 8️⃣ Dependencies ที่ต้องการ

### 📦 Libraries จาก mroi-app-main

```typescript
// ✅ ใช้ได้เลย:
import { v4 as uuidv4 } from 'uuid';

// ✅ ใช้ได้เลย:
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

// ⚠️ ต้องพิจารณา (mroi-app-main ใช้ Ant Design):
import { Button, Modal, Switch, Input, Select, Tag } from 'antd';
// ปัจจุบัน RoiEditor ใช้ custom buttons

// ⚠️ ต้องพิจารณา (ScheduleControls):
import { TimePicker, InputNumber } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import debounce from 'lodash/debounce';
```

---

## 1️⃣1️⃣ Constraints & Limitations

### 🚫 ข้อจำกัดที่ต้องระวัง

| ข้อจำกัด | รายละเอียด | การแก้ไข |
|----------|-----------|---------|
| **Max 6 Rules** | ห้ามสร้าง Rule > 6 | Disable "Create Rule" button |
| **Max 1 Zoom** | ห้ามสร้าง Zoom > 1 | zoomCount tracking |
| **Min Points** | tripwire ≥ 2, others ≥ 3 | Validation ก่อน Save |
| **Schedule Slots** | ห้ากำหนด Schedule overlap | Disable overlapped hours |
| **Non-Zoom Only** | Health/Intrusion/Tripwire/Density มี Schedule | Conditional logic |
| **Zoom Only** | Zoom ไม่มี Schedule | Remove schedule fields |

---

## 1️⃣2️⃣ Comparison: Tools_draw.jsx Features

### ✅ Features ที่ mroi-app-main มี

```typescript
// 1. Multiple Rules Management
const [regionAIConfig, setRegionAIConfig] = useState({ rule: [] });

// 2. Draw Mode Toggle
const [enableDraw, setEnableDraw] = useState(false);

// 3. Selected Rule Tracking
const [selectedShape, setSelectedShape] = useState({ roi_type: null, index: null });
const [dataSelectedROI, setDataSelectedROI] = useState(null);

// 4. Current Points (สำหรับ drawing ขณะนี้)
const [currentPoints, setCurrentPoints] = useState([]);

// 5. Rule Creation
const addShapeToRegionAIConfig = (roi_type = 'tripwire', points = []) => {
    const newRule = { 
        points, 
        roi_type, 
        name: `New Rule ${index + 1}`,
        roi_id: uuidv4(),
        created_date: new Date().toLocaleDateString("en-GB"),
        created_by: CREATOR,
        roi_status: roi_type !== 'zoom' ? 'OFF' : undefined,
        schedule: roi_type !== 'zoom' ? [...defaultSchedule] : undefined,
        surveillance_id: roi_type === 'zoom' ? uuidv4() : undefined
    };
    setRegionAIConfig(prev => ({ ...prev, rule: [...prev.rule, newRule] }));
};

// 6. Rule Deletion
const handleDeleteShape = (roi_type, index) => {
    setRegionAIConfig(prevConfig => ({
        ...prevConfig,
        rule: prevConfig.rule.filter((_, i) => i !== index)
    }));
};

// 7. Status Toggle (ON/OFF)
const handleChangeStatus = (index, formValues) => {
    const activeStatus = formValues.roi_status ? 'ON' : 'OFF';
    const updatedRules = [...regionAIConfig.rule];
    updatedRules[index] = { ...updatedRules[index], roi_status: activeStatus };
    setRegionAIConfig({ ...regionAIConfig, rule: updatedRules });
};

// 8. Fetch ROI Data (Refresh)
const fetchROIData = useCallback(async () => {
    const data = await fetch(...);
    const migratedRules = data.rule.map((rule, index) => migrateRuleFormat(rule, index));
    setRegionAIConfig({ rule: migratedRules });
}, []);

// 9. Save with Verification
const handleSave = async () => {
    const response = await fetch(...POST..., { body: configToSave });
    if (response.ok) {
        fetchROIData(); // Refresh
        setOpenSaveModal(false);
    }
};
```

---

## 1️⃣3️⃣ Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                          │
└──────────────┬───────────────────────────────────┬────────────────┘
               │                                   │
        Create New Rule                   Select Existing Rule
               │                                   │
               ▼                                   ▼
    ┌─────────────────────┐          ┌──────────────────────┐
    │ addShapeToRegionAI  │          │ setSelectedShape()   │
    │ Config()            │          │ setDataSelectedROI() │
    └──────────┬──────────┘          └──────────┬───────────┘
               │                                  │
               │                                  │
               └──────────┬───────────────────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │  regionAIConfig.rule[] │ (Array of Rules)
              │  [Rule1, Rule2, ...]   │
              └───────────┬────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
    ┌────────┐       ┌──────────┐     ┌──────────┐
    │Sidebar │       │Canvas    │     │Setup     │
    │(List)  │       │(Draw)    │     │Editor    │
    └────────┘       └──────────┘     └──────────┘
        │                 │                 │
        │                 ▼                 │
        │           currentPoints[]         │
        │           (canvas coords)        │
        │                 │                 │
        │                 └─────────┬───────┘
        │                           │
        │    ┌──────────────────────┘
        │    │
        │    ▼
        │  handleSave() / setDataSelectedROI()
        │    │
        │    ▼
        │  dataSelectedROI.points = currentPoints
        │    │
        │    ▼
        │  updateRegionAIConfig()
        │    │
        │    └──► regionAIConfig.rule[index] = dataSelectedROI
        │
        └──► Render Updated Rule List
             ├─ Rule 1 ✓
             ├─ Rule 2 ✓
             └─ + Create New Rule
```

---

## 1️⃣4️⃣ Component Interaction

```
┌─────────────────────────────────────────────────────────┐
│                   RoiEditor.tsx (Main)                   │
│  - regionAIConfig: Rule[]                               │
│  - selectedRule: Rule | null                            │
│  - currentPoints: Point[]                               │
│  - enableDrawMode: boolean                              │
└─────────────────────────────────────────────────────────┘
           │                    │                    │
           │                    │                    │
    ┌──────▼──────┐    ┌────────▼────────┐   ┌──────▼──────┐
    │RuleList     │    │DrawingCanvas    │   │SetupEditor  │
    │(Sidebar)    │    │                 │   │(Details)    │
    │             │    │ Display All     │   │             │
    │ Rule 1 ✓    │    │ Rules + Current │   │ Rule Name   │
    │ Rule 2      │    │ Drawing Preview │   │ Rule Type   │
    │ Rule 3 ✓    │    │                 │   │ Schedule    │
    │ + Create    │    │ Handle Clicks   │   │ Status      │
    │             │    │ Update Points   │   │             │
    │ ON/OFF      │    │                 │   │ Audit Info: │
    │ [Delete]    │    │ Canvas Border   │   │ - Created   │
    │             │    │ Color Feedback  │   │ - Modified  │
    └──────┬──────┘    │ (Enable/Disable)│   │             │
           │           │                 │   │ [Save]      │
           │           └────────┬────────┘   │ [Delete]    │
           │                    │            └──────┬──────┘
           │                    │                   │
           └────────┬───────────┴───────────────────┘
                    │
                    ▼
            State Update Cycle
            (All sync via selectedRule)
```

---

## 1️⃣5️⃣ สรุป: ความเข้าใจที่ตรงกันของระบบ

### 📌 Key Points

1. **Multiple Rules Support**
   - ❌ ปัจจุบัน: เก็บ 1 Rule เท่านั้น
   - ✅ ต้องเปลี่ยน: เก็บ Array ของ Rules (สูงสุด 6)

2. **Rule Management UI**
   - ❌ ปัจจุบัน: ไม่มี Rule List/Details Panel
   - ✅ ต้องเพิ่ม: Sidebar + SetupEditor Components

3. **Schedule Controls**
   - ❌ ปัจจุบัน: ไม่มี
   - ✅ ต้องเพิ่ม: ScheduleControls Component (สำหรับ non-zoom rules)

4. **Draw Mode Management**
   - ✅ มี: Enable Draw Mode button
   - ⚠️ ต้องแก้: ปุ่มควรเปลี่ยนเป็น Save/Clear หลังกด

5. **Status Tracking**
   - ❌ ปัจจุบัน: ไม่มี roi_status (ON/OFF)
   - ✅ ต้องเพิ่ม: Toggle Switch ในแต่ละ Rule

6. **Type-Aware Rendering**
   - ✅ มี: ROI Type Selector
   - ⚠️ ต้องแก้: Canvas rendering ควรแสดงสีต่างกันตามประเภท

7. **Audit Trail (NEW)**
   - ❌ ปัจจุบัน: ไม่มี
   - ✅ ต้องเพิ่ม: Display created_date, created_by, updated_at ใน Details Panel
   - 📅 Format: DD/MM/YYYY สำหรับ date, DD/MM/YYYY HH:mm:ss สำหรับ datetime

---

## 🎯 สรุป Architectural Change

```
From: 📝 Single Rule Editor
      └─ Canvas + Settings (ต่อเพียง 1 Rule)

To:   📋 Multiple Rule Manager  
      ├─ Rule List (Sidebar)
      ├─ Canvas (Draw Multiple Rules)
      ├─ Setup Editor (Detailed Settings + Audit Info)
      ├─ Schedule Controls (Time & Parameters)
      └─ Status Management (ON/OFF Tracking)
```

---

**📝 หมายเหตุ:** เอกสารนี้เป็นการวิเคราะห์ออกแบบเท่านั้น ยังไม่มีการแก้ไขโค้ด (Updated: 17/12/2025)

