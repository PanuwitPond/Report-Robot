# 📊 Role-Based Access Control (RBAC) - Analysis & Implementation Plan

## ✅ ความเข้าใจความต้องการ

### สิทธิ์การเข้าถึงตามแต่ละ Role:

```
┌─────────────────────────────────────────────────────────┐
│ Admin (4 เมนู - เข้าได้ทั้งหมด)                          │
├─────────────────────────────────────────────────────────┤
│ ✅ METTPOLE   (📂 Download Reports)                    │
│ ✅ METTBOT    (🧹 Cleaning Report, 🤖 Robot Mgmt)     │
│ ✅ MIOC       (📊 MIOC Generator)                      │
│ ✅ MROI       (🎥 MROI Dashboard)                      │
│ ✅ Admin      (👥 Manage Roles)                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ MIOC (3 เมนู)                                            │
├─────────────────────────────────────────────────────────┤
│ ✅ METTPOLE   (📂 Download Reports)                    │
│ ✅ METTBOT    (🧹 Cleaning Report, 🤖 Robot Mgmt)     │
│ ✅ MIOC       (📊 MIOC Generator)                      │
│ ❌ MROI       (ไม่สามารถเข้าถึง)                       │
│ ❌ Admin      (ไม่สามารถเข้าถึง)                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ MROI (1 เมนู)                                            │
├─────────────────────────────────────────────────────────┤
│ ❌ METTPOLE   (ไม่สามารถเข้าถึง)                       │
│ ❌ METTBOT    (ไม่สามารถเข้าถึง)                       │
│ ❌ MIOC       (ไม่สามารถเข้าถึง)                       │
│ ✅ MROI       (🎥 MROI Dashboard)                      │
│ ❌ Admin      (ไม่สามารถเข้าถึง)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Current State Analysis

### Issues Found:

1. **Sidebar.tsx** - ปัจจุบันแสดงเมนูทั้งหมด
   ```typescript
   const showPole = true;   // ❌ ไม่มี role check
   const showBot = true;    // ❌ ไม่มี role check
   const showMioc = true;   // ❌ ไม่มี role check
   const showMroi = true;   // ❌ ไม่มี role check
   ```

2. **Routes (AppRoutes.tsx)** - ไม่มี role-based protection
   - routes ต่างๆ ใช้ `<ProtectedRoute>` แต่ไม่มี `requiredRoles` prop
   - ต้องเพิ่ม role checks สำหรับแต่ละ route

3. **roleBasedRedirect.ts** - พบเพียง 3 roles
   ```typescript
   - 'admin'   ✅
   - 'mioc'    ✅
   - 'service' ⚠️ (ต้องตรวจสอบ)
   - 'mroi'    ❌ (หายไป!)
   ```

---

## 📋 Implementation Plan

### Phase 1: Create Role Configuration
**File:** `frontend/src/config/roleMenuMap.ts` (ใหม่)

```typescript
export const ROLE_MENU_ACCESS = {
    admin: ['pole', 'bot', 'mioc', 'mroi'],      // ทั้งหมด
    mioc: ['pole', 'bot', 'mioc'],               // 3 เมนู
    mroi: ['mroi'],                               // 1 เมนู เท่านั้น
} as const;

export const ROLE_ROUTE_ACCESS = {
    admin: [
        '/download-report',
        '/report-task-config',
        '/task-editor',
        '/add-image',
        '/report-image-config',
        '/mioc-dashboard',
        '/robots',
        '/workforce',
        '/robot-cleaning-report',
        '/admin/manage-roles',
    ],
    mioc: [
        '/download-report',
        '/report-task-config',
        '/task-editor',
        '/add-image',
        '/report-image-config',
        '/mioc-dashboard',
        '/robots',
        '/workforce',
        '/robot-cleaning-report',
    ],
    mroi: [
        // เข้าทาง external link เท่านั้น
    ],
} as const;
```

### Phase 2: Update Sidebar.tsx
**Changes:**
- ใช้ user role เพื่อตัดสินใจว่าแสดงเมนูไหน
- Implement logic:
  ```typescript
  const canAccessPole = isAdmin || userRole === 'mioc';
  const canAccessBot = isAdmin || userRole === 'mioc';
  const canAccessMioc = isAdmin || userRole === 'mioc';
  const canAccessMroi = isAdmin || userRole === 'mroi';
  ```

### Phase 3: Update AppRoutes.tsx
**Changes:**
- เพิ่ม `requiredRoles` prop ให้กับแต่ละ route
  ```typescript
  // METTPOLE routes
  <Route path="/download-report" element={
      <ProtectedRoute requiredRoles={['admin', 'mioc']}>
          <Layout><DownloadReportPage /></Layout>
      </ProtectedRoute>
  } />

  // METTBOT routes  
  <Route path="/robots" element={
      <ProtectedRoute requiredRoles={['admin', 'mioc']}>
          <Layout><RobotListPage /></Layout>
      </ProtectedRoute>
  } />

  // MIOC routes
  <Route path="/mioc-dashboard" element={
      <ProtectedRoute requiredRoles={['admin', 'mioc']}>
          <Layout><MiocDashboardPage /></Layout>
      </ProtectedRoute>
  } />

  // MROI - external link (no route protection needed)

  // Admin routes
  <Route path="/admin/manage-roles" element={
      <ProtectedRoute requiredRoles={['admin']}>
          <Layout><ManageRolesPage /></Layout>
      </ProtectedRoute>
  } />
  ```

### Phase 4: Update roleBasedRedirect.ts
**Changes:**
- เพิ่ม 'mroi' role
  ```typescript
  if (roles.includes('mroi')) {
      // Redirect to MROI external URL
      return window.location.href = 'http://10.2.113.35:4173/mroi';
  }
  ```

### Phase 5: Update ProtectedRoute.tsx
**Changes:**
- ปรับปรุง role comparison logic (ต้องให้ admin bypass ได้ทั้งหมด)
  ```typescript
  const hasRequiredRole = requiredRoles.some(role =>
      user?.roles?.includes(role) || user?.roles?.includes('admin')
  );
  ```

---

## 🎯 User Experience After Implementation

### Admin User Login:
```
Sidebar shows: METTPOLE | METTBOT | MIOC | MROI | Admin Menu
Can access: All routes + Manage Roles page
```

### MIOC User Login:
```
Sidebar shows: METTPOLE | METTBOT | MIOC
Can access: /download-report, /robots, /workforce, /mioc-dashboard, etc.
Cannot access: /mroi, /admin/manage-roles
```

### MROI User Login:
```
Sidebar shows: MROI (only)
Can access: External MROI dashboard
Cannot access: Any other menu or route
Redirect on login: http://10.2.113.35:4173/mroi
```

---

## 📝 Summary of Changes Required

| Component | Changes | Priority |
|-----------|---------|----------|
| Create `roleMenuMap.ts` | New file with role configs | HIGH |
| Sidebar.tsx | Add role-based menu visibility | HIGH |
| AppRoutes.tsx | Add `requiredRoles` to routes | HIGH |
| ProtectedRoute.tsx | Verify role checking logic | MEDIUM |
| roleBasedRedirect.ts | Add MROI role handling | HIGH |
| UserMenu.tsx | No changes needed | LOW |
| Backend | No changes needed | - |

---

## ⚠️ Important Notes

1. **Admin role = Super User**: เข้าได้ทุกเมนู ทุก route
2. **MIOC role** = ผู้จัดการ METTPOLE + METTBOT + MIOC
3. **MROI role** = ผู้ใช้งาน MROI เท่านั้น (external redirect)
4. **Backward Compatibility**: Service users ควรจัดการด้วยกฎ fallback
5. **Security**: ต้องตรวจสอบทั้ง Frontend และ Backend

---

## 🚀 Next Steps

1. ✅ ยืนยันแผนนี้กับคุณ
2. ⏳ สร้างไฟล์ roleMenuMap.ts
3. ⏳ Update Sidebar.tsx
4. ⏳ Update AppRoutes.tsx
5. ⏳ Test ด้วยแต่ละ role
6. ⏳ Test unauthorized access (verify redirect)

---

**ยืนยันแล้วว่า:**
- ✅ เข้าใจความต้องการของคุณอย่างถูกต้อง
- ✅ วิเคราะห์ปัญหา current implementation
- ✅ วางแผนการแก้ไขที่ชัดเจน
- ✅ พร้อมดำเนินการปรับปรุง
