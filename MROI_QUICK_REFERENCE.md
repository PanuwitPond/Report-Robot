# 🎯 MROI Quick Reference Card

## 🚀 Quick Start

### For Users
**3 Ways to Draw ROI:**
1. Sidebar → MROI → ✏️ ROI Editor → Select Device → Draw
2. MROI → 📹 Manage Devices → 🎨 Draw ROI on Device Card → Draw
3. Direct URL: `/mroi/editor/:deviceId` → Draw

**How to Draw:**
1. Select or view device
2. Wait for snapshot to load
3. Click on image to add points (red circles appear)
4. Points connect with red lines
5. Click Save when done

---

## 🛠️ For Developers

### File Locations
```
frontend/
├── src/pages/mroi/RoiEditor.tsx ← Main canvas component
├── src/pages/mroi/RoiEditor.css ← Styling
├── src/routes/AppRoutes.tsx ← Routes
└── src/components/layout/Sidebar.tsx ← Navigation
```

### Key State Variables
```typescript
canvasRef              // Canvas DOM reference
selectedDeviceId      // Current device ID
canvasState.points    // Array of {x, y} points
snapshotUrl          // Image blob URL
snapshotError        // Error message display
```

### API Endpoints
```
GET /api/mroi/iv-cameras/snapshot?rtsp=...
POST /mroi/iv-cameras/save-region-config
```

### Debug Commands
```typescript
// Check canvas ref in browser console
console.log(canvasRef.current)

// Check points array
console.log(canvasState.points)

// Monitor API calls
// Open DevTools → Network tab → Filter for 'snapshot' or 'save-region'
```

---

## ⚡ Common Tasks

### Add New ROI Type
**File**: `RoiEditor.tsx`
```typescript
// In roiType dropdown, add option:
<option value="newtype">🎨 New Type Name</option>

// Update interface:
type roiType = 'intrusion' | 'tripwire' | 'density' | 'zoom' | 'newtype';
```

### Change Error Message Color
**File**: `RoiEditor.css`
```css
.snapshot-error {
    color: #ff6666; /* Change this */
}
```

### Add New Device Info to Selector
**File**: `RoiEditor.tsx`
```typescript
// In device selector card, add:
<div className="device-selector-newinfo">{device.newProperty}</div>
```

### Change Canvas Point Size
**File**: `RoiEditor.tsx`
```typescript
// In drawing effect, change radius:
ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI); // 5 = size
```

---

## 🐛 Troubleshooting

| Problem | Check |
|---------|-------|
| Device list empty | Database has devices, API returns data |
| Snapshot not loading | FFmpeg service running, RTSP URL valid |
| Canvas not responding | Browser allows cross-origin, camera online |
| Points not visible | z-index of canvas, canvas dimensions correct |
| Save fails | Backend endpoint responding, network connected |

---

## 📊 Architecture Diagram

```
┌─────────────────────┐
│  MROI Module Tabs   │
│  (React Router)     │
└──────────┬──────────┘
           │
    ┌──────┴──────────────────┐
    │                         │
┌───▼────┐  ┌────────┐  ┌────▼────┐
│ Editor │  │ ROIs   │  │Schedule  │
│(Canvas)│  │(CRUD)  │  │(CRUD)    │
└───┬────┘  └────────┘  └──────────┘
    │
    └─► Device Selector
        └─► Snapshot (FFmpeg)
            └─► Canvas Drawing
                └─► Save Config
```

---

## 🎨 UI Element Reference

| Element | Icon | Purpose |
|---------|------|---------|
| ROI Editor | ✏️ | Access canvas from sidebar |
| Draw ROI | 🎨 | Quick access from device card |
| Manage Devices | 📹 | List all cameras |
| Manage ROIs | 🎯 | View/edit saved regions |
| Manage Schedules | ⏱️ | Manage time-based rules |
| Change Device | 🔄 | Reselect camera |
| Undo | ↶ | Remove last point |
| Clear | 🗑️ | Remove all points |
| Save | ✅ | Save configuration |
| Cancel | ✕ | Discard changes |

---

## 🔐 Permissions

User needs:
- **Role**: admin or service
- **Permission**: `menu.mroi`
- **Token**: Valid JWT in localStorage

---

## 📱 Responsive Breakpoints

| Device | Width | Breakpoint |
|--------|-------|-----------|
| Desktop | > 1024px | Full sidebar + canvas |
| Tablet | 768-1024px | Single column layout |
| Mobile | < 768px | Stacked layout |

---

## 🗂️ Database Schema (Frontend Usage)

### Devices
```sql
id, name, location, status, rtspUrl
```

### ROIs
```sql
id, deviceId, type, points[], timestamp
```

### Schedules
```sql
id, deviceId, startTime, endTime, dayOfWeek[]
```

---

## 🔍 Performance Tips

- **Clear browser cache** if styles not updating
- **Close browser tabs** if canvas becomes slow
- **Reduce snapshot frequency** by changing device less often
- **Use Firefox DevTools** for better Canvas debugging
- **Check Network tab** to verify API response time

---

## 📚 Related Documentation

- **Full Guide**: MROI_INTEGRATION_COMPLETE.md
- **Testing**: MROI_TESTING_GUIDE.md
- **Setup**: MROI_CONFIGURATION_SETUP.md
- **Database**: MROI_DATABASE_REQUIREMENTS.md
- **API Reference**: MROI_DATA_SOURCES_REFERENCE.md

---

## ✉️ Quick Fixes

### Canvas Not Showing
```
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page (F5)
3. Check console for errors (F12)
```

### Snapshot Fails to Load
```
1. Verify device has valid RTSP URL
2. Check if FFmpeg service running
3. Try a different device
```

### Can't Save ROI
```
1. Ensure at least 1 point drawn
2. Check network tab for error response
3. Verify backend is running (port 3001)
```

### Menu Items Hidden
```
1. Check user role (admin/service)
2. Verify permissions include "menu.mroi"
3. Clear localStorage and re-login
```

---

## 🎓 Learning Resources

### Canvas 2D API
- MDN: [Canvas API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- Tutorial: Using ctx.arc(), ctx.stroke(), ctx.moveTo()

### React Patterns
- useRef for stable DOM references
- useEffect for side effects
- useState for component state

### React Query
- Query hooks for data fetching
- Mutation hooks for POST/PUT/DELETE
- Cache invalidation patterns

---

## 🚀 Deployment Steps

1. **Build**: `npm run build`
2. **Test**: `npm run test` (if available)
3. **Deploy**: Copy `/dist` to server
4. **Verify**: Check all routes accessible
5. **Monitor**: Watch browser console for errors

---

## 📞 Emergency Contacts

- **Frontend Issues**: Check MROI_TESTING_GUIDE.md
- **Backend Issues**: Verify NestJS running
- **Database Issues**: Check PostgreSQL connection
- **Deployment Issues**: Review error logs

---

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅
