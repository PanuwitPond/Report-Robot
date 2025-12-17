# 🧪 MROI Testing Guide

## Quick Test Scenarios

### Scenario 1: Enter via Sidebar Menu
```
1. Click MROI in sidebar (left panel)
2. Click "✏️ ROI Editor"
3. Expected: Shows device selector grid
4. Select any device
5. Expected: Shows camera snapshot and canvas
```

### Scenario 2: Enter via DevicesPage Draw Button
```
1. Click MROI → "📹 Manage Devices"
2. Find a device card
3. Click "🎨 Draw ROI" button
4. Expected: Direct to canvas with device pre-selected
```

### Scenario 3: Direct URL Access
```
1. Navigate to: /mroi/editor/[deviceId]
2. Expected: Shows canvas immediately (if deviceId exists)
3. View snapshot should load from FFmpeg
```

---

## Canvas Drawing Tests

### Test 1: Draw Simple Square
```
Click 4 points to form a square:
1. Top-left corner
2. Top-right corner
3. Bottom-right corner  
4. Bottom-left corner

Expected: 4 red circles and 3 red connecting lines
```

### Test 2: Point Coordinates
```
1. Open browser DevTools (F12)
2. Look at "Points:" count in sidebar
3. Draw 5 points
4. Verify: Sidebar shows "Points: 5"
5. Verify: Each point displays as "P1: (x, y)" format
```

### Test 3: Undo Functionality
```
1. Draw 3 points
2. Click "↶ Undo" button
3. Expected: Last point disappears, Points count goes from 3 → 2
4. Click "↶ Undo" again
5. Expected: Points count goes from 2 → 1
```

### Test 4: Clear All
```
1. Draw 5 points
2. Click "🗑️ Clear" button
3. Expected: All points removed, canvas shows only image, Points: 0
```

---

## Error Handling Tests

### Test 1: Snapshot Load Failure
```
1. Navigate to /mroi/editor/:invalidDeviceId (use fake UUID)
2. Expected: Error message appears: "❌ Error loading device..."
3. Can click back button to return to dashboard
```

### Test 2: Snapshot Generation Fails
```
1. If FFmpeg is down or RTSP URL invalid
2. Expected: Red error message "📸 ⚠️ Failed to capture snapshot..."
3. Can try another device or go back
```

### Test 3: Save Without Points
```
1. Load device and snapshot
2. Don't draw any points
3. Click "✅ Save Configuration"
4. Expected: Alert: "⚠️ Please draw at least one region"
5. Must draw at least 1 point to save
```

### Test 4: Save Success
```
1. Draw 4+ points (complete region)
2. Select ROI type: "🎯 Intrusion Detection"
3. Click "✅ Save Configuration"
4. Expected: Alert: "✅ ROI configuration saved successfully!"
5. Auto-redirect to /mroi dashboard
```

---

## Device Selector Tests

### Test 1: List All Devices
```
1. Navigate to /mroi/editor (no deviceId)
2. Expected: Grid of device cards shows
3. Verify: All cameras from database appear
4. Each card shows: name, location, status
```

### Test 2: Select Device
```
1. From device selector grid
2. Click any device card
3. Expected: Navigates to /mroi/editor/:deviceId
4. Canvas appears with snapshot loaded
```

### Test 3: Change Device Mid-Drawing
```
1. Draw 3 points on Device A
2. Click "🔄 Change Device" button
3. Expected: Returns to device selector
4. Select Device B
5. Expected: New snapshot loads, previous points cleared
6. Canvas ready to draw on new device
```

---

## ROI Type Tests

### Test 1: Select Different ROI Types
```
For each ROI type:
  - 🚨 Intrusion Detection
  - 📏 Tripwire Line
  - 🔥 Density Monitoring
  - 🔍 Zoom Region

1. Draw region
2. Change ROI Type dropdown
3. Save configuration
4. Expected: Correct type saved in backend
```

---

## RoisPage Tests

### Test 1: View Saved ROIs
```
1. After saving ROI in editor
2. Navigate to MROI → "🎯 Manage ROIs"
3. Expected: New ROI appears in list
4. Shows device name, ROI type, created date
```

### Test 2: Edit ROI
```
1. Click edit on any ROI
2. Modify fields (device, type)
3. Click save
4. Expected: ROI updates in list
```

### Test 3: Delete ROI
```
1. Click delete on any ROI
2. Confirm deletion
3. Expected: ROI removed from list
```

---

## SchedulesPage Tests

### Test 1: Create Schedule
```
1. Navigate to MROI → "⏱️ Manage Schedules"
2. Click "New Schedule"
3. Select device dropdown
4. Set start time: 09:00
5. Set end time: 17:00
6. Toggle days: Mon, Tue, Wed, Thu, Fri (blue highlight)
7. Click Save
8. Expected: Schedule appears in list
```

### Test 2: Time Picker
```
1. Click time input field
2. Type: 14:30
3. Expected: Parsed correctly as HH:MM format
4. Display shows: 2:30 PM
```

### Test 3: Day Selection
```
1. Click day buttons (Mon, Tue, Wed, etc.)
2. Selected days show blue background
3. Save and reload
4. Expected: Same days remain selected
```

---

## Browser Console Tests

### Test 1: Check Console for Errors
```
1. Open DevTools (F12)
2. Go to Console tab
3. Perform above tests
4. Expected: No red errors
5. Warnings are acceptable
```

### Test 2: Monitor Network Calls
```
1. Open DevTools → Network tab
2. Draw and save ROI
3. Look for requests:
   - GET /api/mroi/iv-cameras/snapshot → 200 OK
   - POST /mroi/iv-cameras/save-region-config → 200 OK
4. Check request/response payloads
```

### Test 3: Application State
```
1. Open DevTools → Application tab
2. Check localStorage for tokens
3. Should have JWT tokens for authentication
```

---

## Responsive Design Tests

### Test 1: Desktop (1920x1080)
```
1. Access all pages
2. Expected: Full sidebar + content layout
3. Canvas takes up 70% of width
```

### Test 2: Tablet (768x1024)
```
1. Access /mroi/editor
2. Expected: Sidebar stacks, canvas full width
3. Still fully functional
```

### Test 3: Mobile (375x667)
```
1. Access /mroi/editor
2. Expected: Sidebar might collapse
3. Canvas and controls remain accessible
4. Touch-friendly button sizes
```

---

## Data Persistence Tests

### Test 1: Refresh Page
```
1. Draw ROI and save
2. Press F5 to refresh
3. Expected: Still logged in, can navigate back to same device
```

### Test 2: Navigate Away and Back
```
1. Draw ROI in progress
2. Click "✕ Cancel" or navigate away
3. Go to another page
4. Come back to /mroi/editor
5. Expected: Points are cleared (fresh state)
```

### Test 3: Database Verification
```
1. Save ROI via UI
2. Check database directly:
   - SELECT * FROM rois WHERE device_id = 'xxx'
3. Expected: New row exists with correct data
```

---

## API Integration Tests

### Test 1: Snapshot Endpoint
```
Test via curl or Postman:
  GET /api/mroi/iv-cameras/snapshot?rtsp=rtsp://camera.url

Expected:
  - Status 200
  - Content-Type: image/jpeg (or image/png)
  - Body: Image binary data
```

### Test 2: Save Config Endpoint
```
Test via Postman:
  POST /mroi/iv-cameras/save-region-config
  Params: customer=metthier&cameraId=uuid-xxx
  Body: {
    "rule": [
      {
        "name": "INTRUSION Zone",
        "type": "intrusion",
        "points": [{"x": 100, "y": 200}, {"x": 300, "y": 400}],
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }

Expected:
  - Status 200 or 201
  - Response: Success message or saved config object
```

---

## Known Limitations

1. **Canvas Size**: Limited by browser viewport (no zoom)
2. **RTSP Streams**: Requires FFmpeg backend to be running
3. **Snapshot Frequency**: One snapshot per device selection
4. **Real-time Updates**: Not implemented (static snapshots only)
5. **Data Export**: No export functionality yet

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Device selector not showing | Verify devices exist in DB, check API call in Network tab |
| Snapshot not loading | Check FFmpeg service is running, verify RTSP URL in device record |
| Points not appearing on canvas | Check browser DevTools Console for JavaScript errors |
| Save fails silently | Check Network tab for 400/500 error responses |
| Can't navigate between pages | Verify JWT token is present in localStorage |
| Sidebar menu items hidden | Check user permissions include `menu.mroi` |

---

## Test Execution Checklist

### Basic Functionality
- [ ] All 3 entry points accessible
- [ ] Device selector loads
- [ ] Canvas renders snapshot
- [ ] Can draw points on canvas
- [ ] Points appear as red circles
- [ ] Lines connect points
- [ ] Undo removes last point
- [ ] Clear removes all points

### CRUD Operations
- [ ] Can create ROI (save successful)
- [ ] Can create Schedule
- [ ] Can view ROIs/Schedules in list
- [ ] Can edit ROI
- [ ] Can edit Schedule
- [ ] Can delete ROI
- [ ] Can delete Schedule

### Error Scenarios
- [ ] Snapshot load failure shows error
- [ ] Invalid device shows error
- [ ] Save without points shows warning
- [ ] Network errors handled gracefully

### Data Integrity
- [ ] Saved ROI appears in RoisPage
- [ ] ROI type saved correctly
- [ ] Points coordinates saved correctly
- [ ] Schedule times saved in 24hr format
- [ ] Selected days saved correctly

### Performance
- [ ] Pages load within 2 seconds
- [ ] Canvas drawing is smooth
- [ ] No console errors
- [ ] No memory leaks on page navigation

---

Generated: 2024
Status: Ready for Testing ✅
