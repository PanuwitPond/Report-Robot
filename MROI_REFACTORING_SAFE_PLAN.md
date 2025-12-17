# 🛡️ MROI Editor Refactoring - Safe Implementation Plan

**วันที่: 17 ธันวาคม 2025**  
**สถานะ: การวางแผนรายละเอียด (Pre-Implementation Analysis)**

---

## ⚠️ Risk Assessment & Mitigation

### 🔴 Critical Risks (ต้องจัดการอย่างเร่งด่วน)

| ลำดับ | ความเสี่ยง | ผลกระทบ | ความรุนแรง | วิธีลดความเสี่ยง |
|------|----------|--------|----------|-----------------|
| **R1** | Data Loss: Points ที่วาดหายไป | Users สูญเสียงานที่วาด | 🔴 Critical | ✅ Verify save ก่อนการเปลี่ยน State |
| **R2** | State Mismatch: Rules ไม่ตรงกัน | UI แสดงข้อมูลผิด | 🔴 Critical | ✅ Centralized state management |
| **R3** | API Incompatibility: Backend ไม่รับ format ใหม่ | Save ล้มเหลว | 🔴 Critical | ✅ Verify backend ยอมรับ format เก่า |
| **R4** | Type Mismatch: TypeScript errors | Compile errors | 🟠 High | ✅ Strict type checking |
| **R5** | Backward Compatibility: Old data ใช้ไม่ได้ | Existing Rules หายไป | 🟠 High | ✅ Data migration logic |

---

## 📋 Implementation Phases (5 Phase)

### 🔄 Phase Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: Preparation          (Duration: 2 hours)               │
│ ├─ Create backup              ✓                                 │
│ ├─ Setup git branch           ✓                                 │
│ └─ Install dependencies       ✓                                 │
└──────────────────┬────────────────────────────────────────────────┘
                   │
┌──────────────────▼────────────────────────────────────────────────┐
│ PHASE 2: Types & Interfaces   (Duration: 1 hour)                │
│ ├─ Create mroi.types.ts       ✓                                 │
│ ├─ Define Rule interface      ✓                                 │
│ ├─ Define RegionAIConfig      ✓                                 │
│ └─ Setup type checking        ✓                                 │
└──────────────────┬────────────────────────────────────────────────┘
                   │
┌──────────────────▼────────────────────────────────────────────────┐
│ PHASE 3: Component Creation   (Duration: 4 hours)               │
│ ├─ RuleList.tsx               ✓                                 │
│ ├─ SetupEditor.tsx            ✓                                 │
│ ├─ ScheduleControls.tsx       ✓                                 │
│ └─ DrawingCanvas.tsx          ✓                                 │
└──────────────────┬────────────────────────────────────────────────┘
                   │
┌──────────────────▼────────────────────────────────────────────────┐
│ PHASE 4: RoiEditor Refactor   (Duration: 3 hours)               │
│ ├─ Update state structure     ✓                                 │
│ ├─ Integrate components       ✓                                 │
│ ├─ Update handlers            ✓                                 │
│ └─ Data transformation logic  ✓                                 │
└──────────────────┬────────────────────────────────────────────────┘
                   │
┌──────────────────▼────────────────────────────────────────────────┐
│ PHASE 5: Testing & Validation (Duration: 3 hours)               │
│ ├─ Manual testing             ✓                                 │
│ ├─ Data consistency check     ✓                                 │
│ ├─ Rollback procedure test    ✓                                 │
│ └─ Final verification         ✓                                 │
└──────────────────┬────────────────────────────────────────────────┘
                   │
                   ▼
            ✅ READY FOR PRODUCTION
```

---

## 🔧 Detailed Phase Breakdown

### PHASE 1: Preparation (2 hours)

#### 1.1 Create Backup Strategy
```bash
# Step 1.1.1: Create Git Branch for Safe Development
git checkout -b feature/mroi-editor-multiple-rules
git branch -v  # Verify branch created

# Step 1.1.2: Create File Backups
# Location: /backups_phase1/
- RoiEditor.tsx.backup             (Original)
- RoiEditor.css.backup             (Original)
- mroi.service.ts.backup           (Reference)

# Step 1.1.3: Document Current State
- Screenshot of current UI
- Export current Rules (if any)
```

#### 1.2 Dependency Check
```typescript
// Check if these are available:
✅ uuid (uuidv4)               // For roi_id generation
✅ dayjs                       // For date formatting
✅ react hooks (useState, useEffect, useCallback)
✅ @tanstack/react-query      // For API calls
✅ react-router-dom           // For navigation
✅ axios                       // For API requests

// Optional (consider adding if needed):
⚠️ lodash (debounce)          // For Schedule controls
⚠️ antd components            // For better UI
```

#### 1.3 Project Structure Verify
```
frontend/src/pages/mroi/
├── RoiEditor.tsx              ✅ Exists
├── RoiEditor.css              ✅ Exists
└── (NEW FOLDER)
    └── components/            🆕 To create
```

---

### PHASE 2: Types & Interfaces (1 hour)

#### 2.1 Create Type Definitions File

**File:** `frontend/src/pages/mroi/types/mroi.ts` (NEW)

```typescript
// ✅ NEW FILE: Complete type definitions

export interface Point {
    x: number;
    y: number;
}

export interface PointArray extends Array<number> {
    0: number;  // x
    1: number;  // y
}

export interface Schedule {
    surveillance_id: string;
    ai_type: string;
    start_time: string;      // "HH:mm:ss"
    end_time: string;        // "HH:mm:ss"
    direction: string;
    confidence_threshold: number;
    confidence_zoom: number;
    duration_threshold_seconds: number;
}

export interface Rule {
    roi_id: string;
    name: string;
    roi_type: 'intrusion' | 'tripwire' | 'density' | 'zoom' | 'health';
    points: PointArray[];
    roi_status?: 'ON' | 'OFF';
    
    // Metadata
    created_date: string;     // "DD/MM/YYYY"
    created_by: string;
    updated_at?: string;      // "DD/MM/YYYY HH:mm:ss"
    
    // Conditional fields
    schedule?: Schedule[];
    surveillance_id?: string;
}

export interface RegionAIConfig {
    rule: Rule[];
}

export interface CanvasState {
    enableDrawMode: boolean;
    currentPoints: Point[];
}
```

#### 2.2 Update mroi.service.ts Types

**Ensure these functions are type-safe:**
```typescript
export const fetchIvRoiData = async (
    customer: string, 
    deviceId: string
): Promise<RegionAIConfig | null> => { ... }

export const updateIvRegionConfig = async (
    customer: string,
    deviceId: string,
    rules: Rule[]
): Promise<void> => { ... }
```

---

### PHASE 3: Component Creation (4 hours)

#### 3.1 Create RuleList Component

**File:** `frontend/src/pages/mroi/components/RuleList/RuleList.tsx` (NEW)

**Key Features:**
```typescript
interface RuleListProps {
    rules: Rule[];
    selectedRuleId: string | null;
    onSelectRule: (ruleId: string) => void;
    onCreateRule: (roi_type: string) => void;
    onDeleteRule: (roi_id: string) => void;
    onToggleStatus: (roi_id: string, status: 'ON' | 'OFF') => void;
    maxRules: number;  // 6
    zoomCount: number;
}

// ✅ Must handle:
// - Render max 6 Rules
// - ON/OFF Toggle
// - Delete with confirmation
// - Create New Rule (only if < 6)
// - Type-aware icons
// - Selected state highlight
```

#### 3.2 Create SetupEditor Component

**File:** `frontend/src/pages/mroi/components/SetupEditor/SetupEditor.tsx` (NEW)

**Key Features:**
```typescript
interface SetupEditorProps {
    selectedRule: Rule | null;
    onUpdateRule: (rule: Rule) => void;
    onSaveRule: (rule: Rule) => void;
    onDeleteRule: (roi_id: string) => void;
}

// ✅ Must handle:
// - Edit Rule Name
// - Change Rule Type (with side effects)
// - Schedule Controls (non-zoom only)
// - Display Audit Info (created_date, created_by, updated_at)
// - Save button (enable only if changed)
// - Delete button with modal
```

#### 3.3 Create ScheduleControls Component

**File:** `frontend/src/pages/mroi/components/ScheduleControls/ScheduleControls.tsx` (NEW)

**Key Features:**
```typescript
interface ScheduleControlsProps {
    schedule: Schedule | null;
    onChangeSchedule: (schedule: Schedule) => void;
    disabledTimeRanges?: TimeRange[];
}

// ✅ Must handle:
// - Start/End Time picker
// - Confidence threshold
// - Direction selector
// - AI Type selector
// - Prevent overlap
```

#### 3.4 Create DrawingCanvas Component

**File:** `frontend/src/pages/mroi/components/DrawingCanvas/DrawingCanvas.tsx` (NEW)

**Key Features:**
```typescript
interface DrawingCanvasProps {
    snapshotUrl: string;
    rules: Rule[];
    currentRule: Rule | null;
    currentPoints: Point[];
    enableDrawMode: boolean;
    onCanvasClick: (point: Point) => void;
}

// ✅ Must handle:
// - Display all Rules with type-aware colors
// - Render current drawing in progress
// - Type-aware colors:
//   * Intrusion: #ff4444
//   * Tripwire: #00ffff
//   * Density: #1E39C3
//   * Zoom: gold
//   * Health: #23F770
```

---

### PHASE 4: RoiEditor Refactor (3 hours)

#### 4.1 State Structure Migration

**From (Current):**
```typescript
interface CanvasState {
    isDrawing: boolean;
    points: Array<{ x: number; y: number }>;
    roiType: 'intrusion' | 'tripwire' | 'density' | 'zoom';
}
```

**To (New):**
```typescript
const [regionAIConfig, setRegionAIConfig] = useState<RegionAIConfig>({ 
    rule: [] 
});

const [canvasState, setCanvasState] = useState<CanvasState>({
    enableDrawMode: false,
    currentPoints: []
});

const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
```

#### 4.2 Update Handlers

```typescript
// ✅ NEW HANDLERS:

// 1. Create New Rule
const handleCreateRule = (roi_type: string) => {
    const newRule: Rule = {
        roi_id: uuidv4(),
        name: `New Rule ${regionAIConfig.rule.length + 1}`,
        roi_type: roi_type as any,
        points: [],
        roi_status: 'OFF',
        created_date: formatDate(new Date()),
        created_by: 'METTHIER',
        schedule: roi_type !== 'zoom' ? [defaultSchedule] : undefined
    };
    
    setRegionAIConfig(prev => ({
        ...prev,
        rule: [...prev.rule, newRule]
    }));
    setSelectedRuleId(newRule.roi_id);
};

// 2. Select Rule
const handleSelectRule = (roi_id: string) => {
    const rule = regionAIConfig.rule.find(r => r.roi_id === roi_id);
    setSelectedRuleId(roi_id);
    setSelectedRule(rule || null);
};

// 3. Update Rule (in-memory)
const handleUpdateRule = (updatedRule: Rule) => {
    setSelectedRule(updatedRule);
};

// 4. Save Rule (to state)
const handleSaveRule = (rule: Rule) => {
    const now = dayjs().format('DD/MM/YYYY HH:mm:ss');
    
    setRegionAIConfig(prev => ({
        ...prev,
        rule: prev.rule.map(r => 
            r.roi_id === rule.roi_id 
                ? { ...rule, updated_at: now }
                : r
        )
    }));
};

// 5. Delete Rule
const handleDeleteRule = (roi_id: string) => {
    setRegionAIConfig(prev => ({
        ...prev,
        rule: prev.rule.filter(r => r.roi_id !== roi_id)
    }));
    
    if (selectedRuleId === roi_id) {
        setSelectedRuleId(null);
        setSelectedRule(null);
    }
};

// 6. Add Canvas Point
const handleCanvasClick = (point: Point) => {
    if (!enableDrawMode || !selectedRule) return;
    
    setCanvasState(prev => ({
        ...prev,
        currentPoints: [...prev.currentPoints, point]
    }));
};

// 7. Save Canvas Points
const handleSaveCanvasPoints = () => {
    if (!selectedRule || canvasState.currentPoints.length === 0) return;
    
    // Validate min points
    const minPoints = getMinPointsForType(selectedRule.roi_type);
    if (canvasState.currentPoints.length < minPoints) {
        alert(`Minimum ${minPoints} points required`);
        return;
    }
    
    // Transform points
    const transformedPoints = canvasState.currentPoints.map(
        p => [p.x, p.y] as PointArray
    );
    
    // Update rule with new points
    const updatedRule: Rule = {
        ...selectedRule,
        points: transformedPoints
    };
    
    handleSaveRule(updatedRule);
    
    // Clear canvas
    setCanvasState(prev => ({
        ...prev,
        currentPoints: [],
        enableDrawMode: false
    }));
};

// 8. Handle Final Save (to Database)
const handleApplyChanges = async () => {
    try {
        setIsSaving(true);
        
        // Transform for backend
        const payload = {
            rule: regionAIConfig.rule.map(rule => ({
                ...rule,
                points: rule.points  // Already in [x,y] format
            }))
        };
        
        // Save to database
        await updateIvRegionConfig(customer, selectedDeviceId, payload.rule);
        
        // Verify save
        const verified = await fetchIvRoiData(customer, selectedDeviceId);
        
        if (verified?.rule?.length === regionAIConfig.rule.length) {
            alert('✅ All changes saved successfully');
            navigate('/mroi');
        } else {
            alert('⚠️ Save verification failed');
        }
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    } finally {
        setIsSaving(false);
    }
};
```

#### 4.3 Load Existing Rules (Updated Logic)

```typescript
useEffect(() => {
    if (selectedDeviceId) {
        const loadRules = async () => {
            try {
                const data = await fetchIvRoiData(customer, selectedDeviceId);
                
                if (data?.rule && Array.isArray(data.rule)) {
                    // ✅ Transform backend format to app format
                    const transformedRules = data.rule.map((rule: any) => ({
                        roi_id: rule.roi_id,
                        name: rule.name,
                        roi_type: rule.roi_type,
                        points: Array.isArray(rule.points) 
                            ? rule.points 
                            : [],
                        roi_status: rule.roi_status || 'OFF',
                        created_date: rule.created_date,
                        created_by: rule.created_by,
                        updated_at: rule.updated_at,
                        schedule: rule.schedule,
                        surveillance_id: rule.surveillance_id
                    }));
                    
                    setRegionAIConfig({ rule: transformedRules });
                }
            } catch (error) {
                console.error('Error loading rules:', error);
            }
        };
        
        loadRules();
    }
}, [selectedDeviceId]);
```

---

### PHASE 5: Testing & Validation (3 hours)

#### 5.1 Unit Testing Checklist

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **T1: Create Rule** | Click "Create" → Verify Rule added | Rule appears in list | ⏳ TBD |
| **T2: Edit Rule Name** | Select Rule → Change name → Save | Name updated in list | ⏳ TBD |
| **T3: Change Type** | Select Rule → Change Type | Schedule updates/clears | ⏳ TBD |
| **T4: Draw Points** | Enable mode → Click canvas → Save | Points stored in rule | ⏳ TBD |
| **T5: Min Points Validation** | Draw < min points → Save | Alert shown, not saved | ⏳ TBD |
| **T6: Delete Rule** | Select Rule → Delete → Confirm | Rule removed, list updated | ⏳ TBD |
| **T7: Toggle Status** | Click ON/OFF → Verify state | Status changes in list | ⏳ TBD |
| **T8: Apply Changes** | Modify Rules → Click Apply | Data saved to DB | ⏳ TBD |
| **T9: Load Rules** | Reload page → Verify loaded | All Rules reappear | ⏳ TBD |
| **T10: Data Consistency** | Create → Save → Reload | Data matches saved | ⏳ TBD |

#### 5.2 Data Transformation Testing

```typescript
// ✅ Test data format conversion:

// Input (Backend Format):
{
    "rule": [
        {
            "roi_id": "uuid",
            "points": [[100, 200], [200, 250]],  // Array format
            "created_date": "17/12/2025",
            "created_by": "METTHIER"
        }
    ]
}

// Transform in App:
{
    "rule": [
        {
            "roi_id": "uuid",
            "points": [[100, 200], [200, 250]],  // Still array
            "created_date": "17/12/2025",        // Still string
            "created_by": "METTHIER"             // Still string
        }
    ]
}

// Verify:
✅ Points format unchanged
✅ Metadata preserved
✅ No data loss
```

#### 5.3 Rollback Testing Procedure

```bash
# BEFORE ANY CHANGES:
git status                    # Verify clean state
git branch                    # Confirm on feature branch

# SIMULATE ROLLBACK:
git diff master...HEAD        # See all changes
git stash                     # Temporarily save changes
npm run dev                   # Verify app still works

# RECOVER FROM STASH:
git stash pop                 # Restore changes
npm run dev                   # Verify works again

# FINAL COMMIT:
git add .
git commit -m "feat: MROI Editor - Multiple Rules Support"
git checkout master
git merge feature/mroi-editor-multiple-rules
```

---

## 🚨 Rollback Plan (Emergency Procedure)

### Scenario 1: Critical Bug Found After Merge

```bash
# Immediate action:
git revert <commit-hash>     # Safe rollback (creates new commit)

# OR (if not pushed):
git reset --hard HEAD~1      # Hard reset to previous commit

# Restore from backup:
cp /backups_phase1/RoiEditor.tsx.backup src/pages/mroi/RoiEditor.tsx
cp /backups_phase1/RoiEditor.css.backup src/pages/mroi/RoiEditor.css
```

### Scenario 2: Data Incompatibility

```bash
# If backend doesn't accept new format:
1. Check mroi.service.ts types
2. Add data format converter
3. Test with mock data
4. Fallback: Support both old and new format

# Code example:
const convertRuleFormat = (rule: Rule) => {
    // Ensure backend compatibility
    return {
        ...rule,
        points: rule.points.map(p => Array.isArray(p) ? p : [p.x, p.y])
    };
};
```

### Scenario 3: State Mismatch

```bash
# Debug procedure:
1. Log regionAIConfig on every change
2. Verify selectedRule is in regionAIConfig
3. Check useEffect dependencies
4. Ensure state consistency after save

# Add console logs:
console.log('regionAIConfig:', regionAIConfig);
console.log('selectedRule:', selectedRule);
console.log('canvasState:', canvasState);
```

---

## 📊 Dependencies & Compatibility Matrix

### Current Dependencies (Verify Available)

```json
{
  "dependencies": {
    "react": "^18.0",           ✅ Required
    "react-dom": "^18.0",       ✅ Required
    "react-router-dom": "^6",   ✅ Required
    "axios": "^1.0",            ✅ Required
    "@tanstack/react-query": "^4", ✅ Required
    "typescript": "^5"          ✅ Required
  },
  "optional": {
    "uuid": "^9.0",             ⚠️ Add if missing
    "dayjs": "^1.11",           ⚠️ Add if missing
    "lodash": "^4.17",          ⚠️ Optional (debounce)
    "antd": "^5.0"              ⚠️ Optional (better UI)
  }
}
```

### Installation Command

```bash
npm install uuid dayjs --save
npm install --save-dev @types/uuid

# Optional:
npm install lodash
npm install antd
```

---

## 🔍 Impact Analysis

### Files to Modify

| File | Change Type | Impact Level | Rollback Difficulty |
|------|-------------|--------------|-------------------|
| RoiEditor.tsx | Major Refactor | 🔴 High | 🟡 Medium |
| RoiEditor.css | Layout Update | 🟡 Medium | 🟢 Low |
| mroi.service.ts | Types Update | 🟡 Medium | 🟢 Low |
| RoiEditor.test.tsx | Add Tests | 🟢 Low | 🟢 Low |

### Files to Create

| File | Purpose | Risk | Complexity |
|------|---------|------|-----------|
| types/mroi.ts | Type Definitions | 🟢 Low | 🟢 Low |
| components/RuleList/RuleList.tsx | Rule Management | 🟡 Medium | 🟡 Medium |
| components/SetupEditor/SetupEditor.tsx | Details Panel | 🟡 Medium | 🟡 Medium |
| components/ScheduleControls/ScheduleControls.tsx | Schedule UI | 🟡 Medium | 🟡 Medium |
| components/DrawingCanvas/DrawingCanvas.tsx | Canvas Drawing | 🔴 High | 🔴 High |

---

## ✅ Pre-Implementation Checklist

- [ ] **Backup Created**
  - [ ] RoiEditor.tsx backed up
  - [ ] RoiEditor.css backed up
  - [ ] Database snapshot taken

- [ ] **Git Setup**
  - [ ] Feature branch created: `feature/mroi-editor-multiple-rules`
  - [ ] Current state committed
  - [ ] Remote backup available

- [ ] **Dependencies Verified**
  - [ ] uuid available
  - [ ] dayjs available
  - [ ] All react libraries updated
  - [ ] No version conflicts

- [ ] **Type Definitions Ready**
  - [ ] Rule interface defined
  - [ ] RegionAIConfig interface defined
  - [ ] Schedule interface defined
  - [ ] Point type defined

- [ ] **Components Planned**
  - [ ] RuleList component design confirmed
  - [ ] SetupEditor component design confirmed
  - [ ] ScheduleControls component design confirmed
  - [ ] DrawingCanvas component design confirmed

- [ ] **API Compatibility Verified**
  - [ ] Backend accepts Rule array format
  - [ ] Backend returns metadata (created_date, created_by, updated_at)
  - [ ] Backend API tests passed
  - [ ] Error handling implemented

- [ ] **Testing Plan Ready**
  - [ ] Unit test cases prepared
  - [ ] Integration test cases prepared
  - [ ] Data transformation tests ready
  - [ ] Rollback procedure tested

---

## 📌 Success Criteria

### Functional Requirements
- ✅ Support multiple Rules (max 6)
- ✅ Create/Edit/Delete Rules
- ✅ Display Rules in sidebar list
- ✅ Show details panel with schedule
- ✅ Display audit information (created_date, created_by, updated_at)
- ✅ Persistent storage to database

### Non-Functional Requirements
- ✅ No data loss on operations
- ✅ Type-safe code (TS strict mode)
- ✅ Error handling with user feedback
- ✅ Backward compatible with existing Rules
- ✅ Performance: < 100ms state updates

### Quality Requirements
- ✅ All 10 test cases pass
- ✅ Zero TypeScript errors
- ✅ No breaking changes to API
- ✅ Rollback procedure tested
- ✅ Code reviewed by 1+ team member

---

## 🎯 Timeline Estimate

```
Total Implementation Time: ~13 hours

Breakdown:
- Phase 1 (Preparation):        2 hours
- Phase 2 (Types):              1 hour
- Phase 3 (Components):         4 hours
- Phase 4 (Refactor):           3 hours
- Phase 5 (Testing):            3 hours

Buffer: +2 hours (for unexpected issues)
Total with buffer: ~15 hours (2 full working days)
```

---

## ⚠️ Critical Decision Points

### 1. Component Library Choice
- **Option A**: Use plain HTML/CSS (current approach)
  - ✅ Pros: No new dependencies
  - ❌ Cons: More code, custom styling
  
- **Option B**: Use Ant Design components
  - ✅ Pros: Professional UI, built-in features
  - ❌ Cons: Additional dependencies, bundle size

**Decision**: Option A (plain HTML/CSS) - Minimize dependencies

### 2. State Management
- **Option A**: useState (current)
  - ✅ Pros: Simple, no new libraries
  - ❌ Cons: Prop drilling

- **Option B**: Context API
  - ✅ Pros: Better state sharing
  - ❌ Cons: More complexity

**Decision**: Option A (useState) - Keep it simple

### 3. Data Format Compatibility
- **Current**: Backend expects `[[x,y], [x,y]]`
- **App Stores**: `{x,y}, {x,y}` then transforms to `[[x,y]]`
- **Keep Transform**: Yes, maintain current compatibility

---

## 🚀 Next Steps (Ready for Implementation)

Once this plan is approved:

1. ✅ Create git feature branch
2. ✅ Create backup of current files
3. ✅ Create types/mroi.ts
4. ✅ Create components in sequence
5. ✅ Refactor RoiEditor.tsx
6. ✅ Run test cases
7. ✅ Perform rollback test
8. ✅ Merge to master

---

**Status**: ✅ Ready for Implementation
**Approval Required**: Yes, proceed with Phase 1 when ready
