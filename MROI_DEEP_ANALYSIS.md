# 🔬 Deep Analysis - Risk Mitigation & Technical Details

**วันที่: 17 ธันวาคม 2025**  
**สำหรับ: Pre-Implementation Review**

---

## 1️⃣ Data Flow Analysis - Detailed Tracking

### Current State (Single Rule)

```
┌──────────────────────────────────────┐
│  CanvasState {                       │
│    isDrawing: false,                 │
│    points: [{x, y}, {x, y}, ...],   │
│    roiType: 'intrusion'             │
│  }                                   │
└─────────────────┬────────────────────┘
                  │
        handleSave()
                  │
                  ▼
    ┌──────────────────────────────┐
    │ Transform: {x,y} → [x,y]    │
    │ {points: [[x,y], [x,y], ...]} │
    └──────────────┬───────────────┘
                   │
            API Call
                   │
                   ▼
         updateIvRegionConfig()
                   │
                   ▼
              Database
```

### New State (Multiple Rules)

```
┌────────────────────────────────────────────────────┐
│  regionAIConfig {                                  │
│    rule: [                                         │
│      {                                             │
│        roi_id: "uuid",                            │
│        name: "Rule 1",                            │
│        roi_type: "intrusion",                     │
│        points: [[x,y], [x,y], ...],              │
│        created_date: "17/12/2025",               │
│        created_by: "METTHIER",                   │
│        updated_at: "17/12/2025 14:30:45"         │
│      },                                           │
│      ...more rules...                             │
│    ]                                              │
│  }                                                │
└─────────────┬──────────────────────────────────────┘
              │
    selectedRuleId = "uuid"
              │
              ▼
┌────────────────────────────────────────┐
│  selectedRule: Rule | null             │
│  (reference to rule in regionAIConfig) │
└────────────────────────────────────────┘
              │
    canvasState {
      enableDrawMode: true,
      currentPoints: [{x,y}, ...]
    }
              │
              ▼
        handleSavePoints()
              │
              ▼
    Transform: {x,y} → [x,y]
              │
              ▼
    Update regionAIConfig.rule[index]
              │
              ▼
        handleApplyChanges()
              │
              ▼
        API Call
              │
              ▼
    updateIvRegionConfig()
              │
              ▼
        Database
```

### State Consistency Rules

```typescript
// ✅ INVARIANT 1: selectedRule must exist in regionAIConfig
if (selectedRuleId !== null) {
    const rule = regionAIConfig.rule.find(r => r.roi_id === selectedRuleId);
    invariant(rule === selectedRule, "selectedRule must match regionAIConfig");
}

// ✅ INVARIANT 2: Each Rule must have unique roi_id
const roi_ids = regionAIConfig.rule.map(r => r.roi_id);
invariant(new Set(roi_ids).size === roi_ids.length, "Duplicate roi_id found");

// ✅ INVARIANT 3: Max 6 Rules
invariant(regionAIConfig.rule.length <= 6, "Exceeded max 6 rules");

// ✅ INVARIANT 4: Metadata must exist
regionAIConfig.rule.forEach(rule => {
    invariant(rule.created_date !== undefined, "Missing created_date");
    invariant(rule.created_by !== undefined, "Missing created_by");
    // updated_at can be undefined (new rule)
});

// ✅ INVARIANT 5: Points format consistency
regionAIConfig.rule.forEach(rule => {
    invariant(
        rule.points.every(p => Array.isArray(p) && p.length === 2),
        "Invalid point format, must be [x, y]"
    );
});
```

---

## 2️⃣ Potential Data Loss Scenarios & Prevention

### Scenario 1: Browser Crash During Drawing

**Flow:**
```
User drawing points → Browser crashes → Loss of currentPoints
```

**Prevention:**
```typescript
// Save currentPoints to localStorage periodically
useEffect(() => {
    const timer = setInterval(() => {
        if (canvasState.currentPoints.length > 0) {
            sessionStorage.setItem(
                `draft_${selectedRuleId}`,
                JSON.stringify(canvasState.currentPoints)
            );
        }
    }, 5000);  // Save every 5 seconds
    
    return () => clearInterval(timer);
}, [canvasState.currentPoints, selectedRuleId]);

// Restore on page load
useEffect(() => {
    if (selectedRuleId) {
        const draft = sessionStorage.getItem(`draft_${selectedRuleId}`);
        if (draft) {
            setCanvasState(prev => ({
                ...prev,
                currentPoints: JSON.parse(draft)
            }));
        }
    }
}, [selectedRuleId]);
```

### Scenario 2: Network Error During Save

**Flow:**
```
User clicks Save → Network error → Rule not saved
```

**Prevention:**
```typescript
const handleApplyChanges = async () => {
    try {
        // 1. Prepare data
        const payload = preparePayload();
        
        // 2. Show loading state
        setIsSaving(true);
        
        // 3. Attempt save
        const response = await updateIvRegionConfig(
            customer,
            selectedDeviceId,
            payload.rule
        );
        
        // 4. Verify save
        const verified = await fetchIvRoiData(customer, selectedDeviceId);
        
        // 5. Check consistency
        const savedCount = verified?.rule?.length ?? 0;
        const expectedCount = regionAIConfig.rule.length;
        
        if (savedCount !== expectedCount) {
            throw new Error(
                `Data mismatch: expected ${expectedCount}, got ${savedCount}`
            );
        }
        
        // 6. Success
        alert('✅ Saved successfully');
        navigate('/mroi');
        
    } catch (error) {
        // ❌ On error, data stays in-memory
        alert(`❌ Save failed: ${error.message}\nChanges are safe in memory.`);
        // Don't navigate, let user retry
        
    } finally {
        setIsSaving(false);
    }
};
```

### Scenario 3: Concurrent Edits (Multiple Users)

**Flow:**
```
User A edits Rule 1 → User B edits Rule 1 → User A saves (overwrites B)
```

**Prevention:**
```typescript
// Add version tracking
interface Rule {
    ...
    version: number;  // Increment on each save
}

// Before save, check version
const handleSaveRule = async (rule: Rule) => {
    const latestRule = await fetchSingleRule(rule.roi_id);
    
    if (latestRule.version > rule.version) {
        // Conflict detected
        showMergeConflictDialog(rule, latestRule);
        return;
    }
    
    // Safe to save
    await updateIvRegionConfig(...);
};
```

### Scenario 4: Invalid Rule Type Transition

**Flow:**
```
User changes Zoom → Intrusion → Schedule/status lost
```

**Prevention:**
```typescript
const handleRuleTypeChange = (newType: string) => {
    setDataSelectedROI(prev => {
        const updated = { ...prev, roi_type: newType };
        
        // Preserve data before clearing
        const oldType = prev.roi_type;
        
        if (newType === 'zoom') {
            // Going to zoom: remove schedule
            if (prev.schedule) {
                // Could save to sessionStorage for undo
                sessionStorage.setItem(
                    `saved_schedule_${prev.roi_id}`,
                    JSON.stringify(prev.schedule)
                );
            }
            delete updated.schedule;
            delete updated.roi_status;
            updated.surveillance_id = updated.surveillance_id || uuidv4();
            
        } else if (oldType === 'zoom') {
            // Coming from zoom: restore or create schedule
            const savedSchedule = JSON.parse(
                sessionStorage.getItem(`saved_schedule_${prev.roi_id}`) || 'null'
            );
            
            updated.schedule = savedSchedule || [defaultScheduleObject];
            updated.roi_status = 'OFF';
            delete updated.surveillance_id;
        }
        
        return updated;
    });
};
```

---

## 3️⃣ Type Safety & Validation

### TypeScript Strict Mode Checks

```typescript
// Enable strict checks in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Runtime Validation

```typescript
// Validate Rule before saving
const validateRule = (rule: Rule): string[] => {
    const errors: string[] = [];
    
    // Check required fields
    if (!rule.roi_id) errors.push("Missing roi_id");
    if (!rule.name) errors.push("Missing name");
    if (!rule.roi_type) errors.push("Missing roi_type");
    if (!rule.created_date) errors.push("Missing created_date");
    if (!rule.created_by) errors.push("Missing created_by");
    
    // Check points format
    if (!Array.isArray(rule.points)) {
        errors.push("Points must be an array");
    } else {
        rule.points.forEach((p, i) => {
            if (!Array.isArray(p) || p.length !== 2) {
                errors.push(`Point ${i} has invalid format`);
            }
            if (typeof p[0] !== 'number' || typeof p[1] !== 'number') {
                errors.push(`Point ${i} has non-numeric coordinates`);
            }
        });
    }
    
    // Check min points
    const minPoints = {
        intrusion: 3,
        tripwire: 2,
        density: 3,
        zoom: 1,
        health: 3
    };
    
    if (rule.points.length < minPoints[rule.roi_type]) {
        errors.push(
            `Minimum ${minPoints[rule.roi_type]} points required for ${rule.roi_type}`
        );
    }
    
    // Check schedule for non-zoom
    if (rule.roi_type !== 'zoom' && rule.schedule) {
        rule.schedule.forEach((sch, i) => {
            if (!sch.start_time) errors.push(`Schedule ${i}: Missing start_time`);
            if (!sch.end_time) errors.push(`Schedule ${i}: Missing end_time`);
            if (sch.confidence_threshold < 0 || sch.confidence_threshold > 1) {
                errors.push(`Schedule ${i}: Invalid confidence_threshold`);
            }
        });
    }
    
    return errors;
};

// Use before saving
const handleApplyChanges = async () => {
    const errors = regionAIConfig.rule.flatMap(rule => 
        validateRule(rule).map(err => `Rule "${rule.name}": ${err}`)
    );
    
    if (errors.length > 0) {
        alert(`❌ Validation errors:\n${errors.join('\n')}`);
        return;
    }
    
    // Safe to proceed
    await performSave();
};
```

---

## 4️⃣ Component Isolation & Testing

### Each Component Should Be Independent

```typescript
// ✅ RuleList.tsx
export const RuleList: React.FC<RuleListProps> = ({
    rules,
    selectedRuleId,
    onSelectRule,
    onCreateRule,
    onDeleteRule,
    onToggleStatus,
    maxRules,
    zoomCount
}) => {
    // Pure component - no side effects
    // All logic is in props callbacks
    return (
        <div className="rule-list">
            {rules.map(rule => (
                <div
                    key={rule.roi_id}
                    onClick={() => onSelectRule(rule.roi_id)}
                    className={selectedRuleId === rule.roi_id ? 'selected' : ''}
                >
                    <span>{rule.name}</span>
                    <button onClick={() => onToggleStatus(rule.roi_id, toggleStatus)}>
                        {rule.roi_status}
                    </button>
                    <button onClick={() => onDeleteRule(rule.roi_id)}>
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
};

// ✅ Easy to test:
describe('RuleList', () => {
    it('renders all rules', () => {
        const rules = [{ roi_id: '1', name: 'Rule 1', ... }];
        const { getByText } = render(<RuleList rules={rules} ... />);
        expect(getByText('Rule 1')).toBeInTheDocument();
    });
    
    it('calls onSelectRule when rule clicked', () => {
        const onSelectRule = jest.fn();
        const { getByText } = render(<RuleList onSelectRule={onSelectRule} ... />);
        fireEvent.click(getByText('Rule 1'));
        expect(onSelectRule).toHaveBeenCalledWith('1');
    });
});
```

---

## 5️⃣ Backward Compatibility Verification

### Old Format vs New Format

```typescript
// ✅ Old format (may come from old backend)
{
    "rule": [
        {
            "name": "Rule 1",
            "type": "intrusion",  // ← old field name
            "points": [[100, 200]],
            "timestamp": "2025-12-17T12:00:00Z"
            // Missing: roi_id, created_date, created_by, updated_at
        }
    ]
}

// ✅ New format (our new structure)
{
    "rule": [
        {
            "roi_id": "uuid",
            "name": "Rule 1",
            "roi_type": "intrusion",  // ← new field name
            "points": [[100, 200]],
            "created_date": "17/12/2025",
            "created_by": "METTHIER",
            "updated_at": "17/12/2025 14:30:45"
        }
    ]
}

// ✅ Migration function to handle both
const migrateRuleFormat = (rule: any, index: number): Rule => {
    return {
        roi_id: rule.roi_id || uuidv4(),
        name: rule.name || `Rule ${index + 1}`,
        roi_type: rule.roi_type || rule.type || 'intrusion',
        points: rule.points || [],
        roi_status: rule.roi_status || 'OFF',
        created_date: rule.created_date || 'Unknown',
        created_by: rule.created_by || 'System',
        updated_at: rule.updated_at || undefined,
        schedule: rule.schedule || [defaultSchedule],
        surveillance_id: rule.surveillance_id || undefined
    };
};

// ✅ Use on load
const loadRules = async () => {
    const data = await fetchIvRoiData(customer, deviceId);
    const migratedRules = data.rule.map((r, i) => migrateRuleFormat(r, i));
    setRegionAIConfig({ rule: migratedRules });
};
```

---

## 6️⃣ Performance Considerations

### State Update Optimization

```typescript
// ❌ BAD: Recreate entire regionAIConfig
setRegionAIConfig(prev => ({
    rule: prev.rule.map(r => {
        if (r.roi_id === selectedId) {
            return { ...r, name: newName };  // ← Unnecessary copy
        }
        return r;
    })
}));

// ✅ GOOD: Minimal changes
const updateRule = useCallback((roi_id: string, updates: Partial<Rule>) => {
    setRegionAIConfig(prev => ({
        rule: prev.rule.map(r => 
            r.roi_id === roi_id ? { ...r, ...updates } : r
        )
    }));
}, []);

// ✅ BETTER: Separate selected rule
const [selectedRuleUpdates, setSelectedRuleUpdates] = useState<Partial<Rule>>({});

// Only commit to regionAIConfig on save
const handleSaveRule = useCallback(() => {
    setRegionAIConfig(prev => ({
        rule: prev.rule.map(r =>
            r.roi_id === selectedRuleId ? { ...r, ...selectedRuleUpdates } : r
        )
    }));
    setSelectedRuleUpdates({});
}, [selectedRuleId, selectedRuleUpdates]);
```

### Canvas Rendering Performance

```typescript
// ✅ Memoize canvas component
const DrawingCanvas = React.memo(({
    rules,
    currentRule,
    currentPoints
}: Props) => {
    // Only re-render if props actually change
    return (
        <canvas
            ref={canvasRef}
            onMouseClick={handleClick}
        />
    );
}, (prevProps, nextProps) => {
    // Custom comparison
    return (
        prevProps.rules.length === nextProps.rules.length &&
        prevProps.currentRule?.roi_id === nextProps.currentRule?.roi_id &&
        prevProps.currentPoints.length === nextProps.currentPoints.length
    );
});
```

---

## 7️⃣ Error Handling Strategy

### Graceful Degradation

```typescript
const handleApplyChanges = async () => {
    try {
        // Step 1: Validate
        const errors = validateAllRules();
        if (errors.length > 0) throw new ValidationError(errors);
        
        // Step 2: Save to DB
        await updateIvRegionConfig(...);
        
        // Step 3: Verify
        const verified = await fetchIvRoiData(...);
        if (!isConsistent(regionAIConfig, verified)) {
            throw new DataMismatchError();
        }
        
        // Step 4: Success
        alert('✅ Saved');
        navigate('/mroi');
        
    } catch (error) {
        if (error instanceof ValidationError) {
            // User can fix and retry
            showValidationErrors(error.errors);
        } else if (error instanceof DataMismatchError) {
            // Serious issue, suggest reload
            alert('⚠️ Data mismatch. Please reload and try again.');
        } else if (error instanceof NetworkError) {
            // Retry logic
            alert('❌ Network error. Changes are safe in memory. Retrying...');
            setTimeout(() => handleApplyChanges(), 3000);
        } else {
            // Unknown error
            console.error('Unexpected error:', error);
            alert('❌ Unexpected error. Please contact support.');
        }
    }
};

// Custom error classes
class ValidationError extends Error {
    constructor(public errors: string[]) {
        super('Validation failed');
    }
}

class DataMismatchError extends Error {
    constructor() {
        super('Saved data does not match expected state');
    }
}

class NetworkError extends Error {
    constructor() {
        super('Network request failed');
    }
}
```

---

## 📋 Final Checklist Before Starting Implementation

### Code Quality
- [ ] TSLint/ESLint configured
- [ ] TypeScript strict mode enabled
- [ ] Prettier formatter configured
- [ ] Pre-commit hooks setup

### Testing Setup
- [ ] Jest configured
- [ ] React Testing Library setup
- [ ] Mock API endpoints ready
- [ ] Test data prepared

### Documentation
- [ ] API endpoints documented
- [ ] Component props documented
- [ ] Type definitions documented
- [ ] Configuration documented

### Git Setup
- [ ] Feature branch created
- [ ] Pre-commit hooks enabled
- [ ] Branch protection configured
- [ ] Merge strategy decided

### Monitoring
- [ ] Error tracking enabled (Sentry?)
- [ ] Performance monitoring setup
- [ ] User analytics enabled
- [ ] Logging configured

---

**Status**: ✅ Detailed Analysis Complete  
**Ready for Implementation**: Yes, all risks identified and mitigated
