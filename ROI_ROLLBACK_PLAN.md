# 🔄 ROI Editor Fix - Error Recovery & Rollback Plan

## 📋 Scope

This document covers emergency procedures if Test Cases fail or issues arise after deployment.

---

## 🚨 Possible Issues & Solutions

### **Issue #1: Points Disappear After Reload** 
**(Most Likely)**

**Symptoms:**
- ✅ Save succeeds with alert
- ✅ Auto-redirects to /mroi
- ❌ Upon reload, points are gone

**Root Causes (Priority Order):**
1. Data format mismatch - backend expects `{x,y}` but we send `[x,y]`
2. Database save failed silently
3. Data loading format mismatch when fetching
4. Backend doesn't merge data correctly

**Debug Steps:**
```
1. Open DevTools → Console
2. Look for error message in handleSave()
3. Check Network tab:
   - POST /save-region-config → Response status?
   - GET /fetch/roi/data → Response contains points?

4. Query database directly:
   SELECT metthier_ai_config->'rule'->[0]->'points'
   FROM iv_cameras 
   WHERE iv_camera_uuid = '<test-device-id>';
   
   ✅ Result has data? → save works, load issue
   ❌ Result empty? → save failed
```

**Solution:**
```
If root cause is #1 (Format Mismatch):
  ❌ Rollback: Revert points: [[x,y]] → points: [{x,y}]
  ✅ Investigate: Does backend support [x,y] format?
  
If root cause is #2 (Save Failed):
  ❌ Rollback: Check backend logs
  ✅ Investigate: API error response? Database permission?
  
If root cause is #3 (Load Format Mismatch):
  ❌ Rollback: Check data.rule[0].points format in browser
  ✅ Fix: Adjust data transform in loading code
```

---

### **Issue #2: "Data Verification Failed" Alert**

**Symptoms:**
```
Alert: "⚠️ Warning: Data saved but verification failed.
Expected 4 points, got 2 points.
Please check the configuration."
```

**Root Causes:**
1. Backend merge logic overwrites rule array instead of updating points
2. Database transaction not committed
3. Network lag between save and verify calls

**Debug Steps:**
```
1. Check console for actual point count difference
2. Query database immediately after save
3. Check if other ROI configs in same rule array affected
4. Check database transaction logs
```

**Solution:**
```
Short-term:
  ✅ User manually checks database
  ✅ If data correct in DB → no action needed
  ❌ If data missing in DB → consider rollback

Long-term:
  ✅ Review backend merge logic
  ✅ Add transaction locks in database
  ✅ Increase verify timeout (currently immediate)
```

---

### **Issue #3: Network Error During Save**

**Symptoms:**
```
Alert: "❌ Error saving configuration: Network Error / Timeout"
Console: "Error: TypeError: fetch failed"
```

**Root Causes:**
1. Backend server crashed
2. Database connection lost
3. Network timeout

**Debug Steps:**
```
1. Check if backend is running: curl http://localhost:3001/health
2. Check database connection
3. Check browser network conditions
```

**Solution:**
```
User Action:
  ✅ Wait 5-10 seconds
  ✅ Retry save (user is still on Editor page, points preserved)
  
Ops Action:
  ✅ Restart backend service
  ✅ Verify database connectivity
  ✅ Check network connectivity
```

---

### **Issue #4: "Could Not Verify Saved Configuration" Alert**

**Symptoms:**
```
Alert: "❌ Error: Could not verify saved configuration. 
Please check if data was saved correctly."
```

**Root Causes:**
1. Save succeeded but fetch data call failed
2. Data in DB but API fetch doesn't return it
3. Backend restart between save and verify

**Debug Steps:**
```
1. Check if first save POST was successful (200 status)
2. Try manual fetch call:
   fetch('/api/mroi/iv-cameras/fetch/roi/data?schema=metthier&key=<id>')
   .then(r => r.json())
   .then(d => console.log(d))
```

**Solution:**
```
Short-term:
  ✅ Manually reload page and check if data is there
  ✅ If data exists → verification call just failed
  
Long-term:
  ✅ Increase timeout between save and fetch
  ✅ Add retry logic for fetch call
  ✅ Check backend fetch API response time
```

---

## 🔄 Rollback Procedures

### **Option 1: Git Revert (Recommended if merged)**

```bash
# Find commit hash
git log --oneline -n 10
# Example output:
# a1b2c3d ✨ Fix ROI data persistence with verification
# ...

# Revert
git revert a1b2c3d

# Verify
git log --oneline -n 2

# Push
git push origin main
```

**Time to Rollback**: ~5 minutes
**Risk**: Low (Git handles it)

---

### **Option 2: Manual Code Revert (if not yet merged)**

**File**: `frontend/src/pages/mroi/RoiEditor.tsx`

**Step 1: Revert handleSave function**
```typescript
// Replace current handleSave with original:
const handleSave = async () => {
    if (canvasState.points.length === 0) {
        alert('⚠️ Please draw at least one region');
        return;
    }

    if (!selectedDeviceId) {
        alert('⚠️ Please select a device first');
        return;
    }

    setIsSaving(true);
    try {
        // ❌ REVERTED: No transform, no verify
        const config = {
            rule: [
                {
                    name: `${canvasState.roiType.toUpperCase()} Zone`,
                    type: canvasState.roiType,
                    points: canvasState.points,  // Original format
                    timestamp: new Date().toISOString(),
                },
            ],
        };

        await updateIvRegionConfig(customer, selectedDeviceId, config.rule);
        alert('✅ ROI configuration saved successfully!');
        navigate('/mroi');
    } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
        alert(`❌ Error saving configuration: ${errorMsg}`);
        console.error('Error saving configuration:', error);
    } finally {
        setIsSaving(false);
    }
};
```

**Time to Rollback**: ~3 minutes (manual edit)
**Risk**: Medium (must be careful with edits)

---

### **Option 3: Feature Flag (Temporary Disable)**

```typescript
// Add at top of RoiEditor component:
const ENABLE_ROI_VERIFICATION = false;  // Set to false to disable new logic

// In handleSave:
const handleSave = async () => {
    // ... validation ...
    
    if (ENABLE_ROI_VERIFICATION) {
        // New logic with verification
        const transformedPoints = canvasState.points.map(p => [p.x, p.y]);
        // ... rest of new logic ...
    } else {
        // Original logic without verification
        const config = {
            rule: [{
                name: `${canvasState.roiType.toUpperCase()} Zone`,
                type: canvasState.roiType,
                points: canvasState.points,  // Original format
                timestamp: new Date().toISOString(),
            }],
        };
        
        await updateIvRegionConfig(customer, selectedDeviceId, config.rule);
        alert('✅ ROI configuration saved successfully!');
        navigate('/mroi');
    }
};
```

**Time to Rollback**: ~2 minutes (flip flag)
**Risk**: Lowest (no actual code deletion)
**Bonus**: Easy to toggle back on after fix

---

## 📋 Rollback Decision Tree

```
Is production affected?
├─ YES
│  ├─ Can backend be fixed quickly? (< 30 min)
│  │  ├─ YES → Fix backend
│  │  └─ NO → Use Option 3 (Feature Flag)
│  │
│  └─ Cannot fix → Use Option 1 (Git Revert)
│
└─ NO (Staging only)
   └─ Investigate and fix → Re-test
```

---

## ⏱️ Emergency Procedures

### **Procedure 1: Immediate Response (First 5 minutes)**

```
[ ] 1. Stop frontend deployment
[ ] 2. Notify users (if in production)
[ ] 3. Gather information:
      - What exactly failed?
      - Can user still use other features?
      - How many users affected?
[ ] 4. Decide: Fix forward or rollback?
      - Critical data loss? → Rollback immediately
      - Edge case issue? → Fix forward
[ ] 5. Communicate decision to team
```

### **Procedure 2: Disable Feature Immediately (Option 3)**

```
[ ] 1. Set ENABLE_ROI_VERIFICATION = false
[ ] 2. Commit & push (fast!)
[ ] 3. Redeploy frontend
[ ] 4. Notify users that fix is disabled
[ ] 5. Take time to investigate root cause
[ ] 6. Prepare proper fix
```

### **Procedure 3: Full Rollback (Option 1)**

```
[ ] 1. Run git revert command
[ ] 2. Push to main
[ ] 3. Redeploy frontend from previous commit
[ ] 4. Verify old behavior works
[ ] 5. Create issue ticket for investigation
[ ] 6. Schedule proper fix after analysis
```

---

## 📊 Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Format mismatch | HIGH | MEDIUM | ✅ Tested before deployment |
| Data loss | LOW | CRITICAL | ✅ Verified in test |
| Network failure | MEDIUM | LOW | ✅ Error handling in place |
| Verification timeout | LOW | MEDIUM | ✅ User can retry |
| Backend crash | LOW | HIGH | ✅ Rollback ready |

---

## 👥 Escalation Contacts

| Role | Name | Contact | Response Time |
|------|------|---------|---|
| Backend Dev | ? | ? | ? |
| DBA | ? | ? | ? |
| DevOps | ? | ? | ? |
| Product Manager | ? | ? | ? |

*To be filled by operations team*

---

## 📝 Post-Incident Checklist

After rollback or fix:

- [ ] Root cause identified
- [ ] Fix implemented and tested
- [ ] Code review approved
- [ ] Staging environment validated
- [ ] Production deployment scheduled
- [ ] Monitoring alerts set up
- [ ] Incident report created
- [ ] Team debriefing completed

---

## 📌 Important Notes

1. **Data Integrity**: Priority #1
   - If any risk of data loss → rollback immediately
   - Ask questions first, fix later

2. **User Communication**: 
   - Explain what happened (in plain language)
   - Explain when it will be fixed
   - Provide workaround if available

3. **Post-Mortem**:
   - Schedule within 24 hours of incident
   - Identify process gaps
   - Prevent recurrence

---

**Version**: 1.0  
**Last Updated**: 2025-12-17  
**Status**: Active - Ready for Use
