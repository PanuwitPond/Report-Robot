# Refactoring Analysis Report - Report-Robot Project

**วันที่:** 22 December 2025
**สถานะ:** Analysis Phase (ยังไม่ได้แก้ไขโค้ด)

---

## 📋 Executive Summary

โปรเจคนี้เป็นระบบ **AI Report System** ที่ประกอบไปด้วย:
- **Backend:** NestJS + TypeORM + PostgreSQL
- **Frontend:** React + TypeScript + Vite
- **Authentication:** Keycloak
- **Storage:** MinIO
- **MROI Module:** Advanced region management system

---

## 🔍 BACKEND REFACTORING OPPORTUNITIES

### 1. **Module Structure Optimization**

#### ปัญหาที่พบ:
```
backend/src/modules/
├── auth/              ✅ Good structure
├── images/            ⚠️ Needs DTOs consolidation
├── mroi/              ⚠️ Mixed concerns
├── reports/           ⚠️ Multiple databases handling
├── robots/            ✅ Good structure
├── tasks/             ✅ Needs DTO folder
└── users/             ✅ Good structure
```

#### แนะนำการ Refactor:

1. **MROI Module - Split Responsibilities**
   - Current: `devices.service.ts` handles both local devices and external cameras
   - **Issues:**
     - Mixed concerns: database operations + external API calls + caching
     - Caching logic embedded in service (should be separate)
     - Too many responsibilities
   
   - **Recommended Structure:**
     ```
     backend/src/modules/mroi/
     ├── controllers/
     ├── services/
     │   ├── devices.service.ts        (Local device DB operations)
     │   ├── iv-cameras.service.ts     (External camera API calls)
     │   ├── rois.service.ts
     │   ├── schedules.service.ts
     │   └── cache.service.ts          (NEW - Centralized caching)
     ├── dtos/
     ├── entities/
     ├── guards/                       (NEW - If needed)
     ├── interceptors/                 (NEW - For caching)
     └── pipes/                        (NEW - For validation)
     ```

2. **Reports Module - Database Connection Consolidation**
   - Current: Multiple database connections scattered in service
     ```
     @InjectDataSource() dataSource
     @InjectDataSource('mioc_conn') miocDataSource
     @InjectDataSource('robot_conn') robotDataSource
     @InjectDataSource('wf_conn') wfDataSource
     ```
   - **Issues:**
     - Hard to test
     - No single source of truth for connection management
     - Complex SQL queries inline
   
   - **Recommended:**
     ```
     backend/src/modules/reports/
     ├── controllers/
     ├── services/
     │   ├── reports.service.ts        (High-level orchestration)
     │   ├── cam-owners.service.ts     (NEW - MIOC DB operations)
     │   ├── workforce.service.ts      (NEW - WF DB operations)
     │   ├── jasper.service.ts         (NEW - External report generation)
     │   └── robot.service.ts          (NEW - Robot DB operations)
     └── ...
     ```

3. **Images Module - DTO Organization**
   - Current: No `dto/` folder
   - **Action:** Create `backend/src/modules/images/dtos/` folder with:
     ```
     - create-image.dto.ts
     - update-image.dto.ts
     - image-response.dto.ts
     ```

4. **Tasks Module - DTO Organization**
   - Current: DTOs in `dto/` folder ✅ Good
   - **Action:** Keep but ensure consistency

5. **Auth Module - Consolidation**
   - Current: Good structure with guards, strategies, decorators
   - **Action:** Consider adding:
     - `dto/` folder for login/register DTOs
     - `interceptors/` folder for token handling

---

### 2. **Database Connection Management**

#### ปัญหา:
- Duplicate database configuration (in app.module.ts)
- No abstraction layer for multi-database queries
- Raw SQL queries scattered across services

#### แนะนำ:
1. **Create DatabaseService Layer:**
   ```
   backend/src/database/
   ├── database.module.ts             (Existing)
   ├── services/
   │   ├── database.service.ts        (NEW - Abstract layer)
   │   ├── mioc-db.service.ts         (NEW - MIOC specific)
   │   ├── robot-db.service.ts        (NEW - Robot DB specific)
   │   ├── workforce-db.service.ts    (NEW - Workforce DB specific)
   │   └── mroi-db.service.ts         (NEW - MROI DB specific)
   └── ...
   ```

2. **Create Query Builders:**
   ```
   backend/src/database/queries/
   ├── cam-owners.query.ts
   ├── workforce-departments.query.ts
   ├── robot-reports.query.ts
   └── ...
   ```

---

### 3. **Code Quality Issues**

#### TODO/FIXME Items Found:
```
- auth.controller.ts:17  - TODO: Implement logout logic
- auth.controller.ts:23  - TODO: Implement token refresh
```

**Action:** Remove TODOs or implement missing features

#### Type Safety:
- Most code uses TypeScript properly ✅
- Consider adding stricter `tsconfig.json` settings:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true
    }
  }
  ```

---

### 4. **Error Handling & Logging**

#### Current State:
- Limited error handling in some services
- Logger usage inconsistent

#### Recommended:
1. **Create Exception Filters:**
   ```
   backend/src/common/filters/
   ├── http-exception.filter.ts
   ├── database-exception.filter.ts
   └── validation-exception.filter.ts
   ```

2. **Standardize Logging:**
   ```
   backend/src/common/logger/
   ├── logger.service.ts
   └── logger.decorator.ts
   ```

---

## 🎨 FRONTEND REFACTORING OPPORTUNITIES

### 1. **Component Structure Optimization**

#### Current State:
```
frontend/src/
├── components/
│   ├── data-table/      ✅ Good modularization
│   ├── layout/          ✅ Good modularization
│   ├── mioc/            ✅ Good modularization
│   ├── routes/          ✅ Good
│   ├── ui/              ✅ Good
│   └── ErrorBoundary.tsx
├── pages/
│   ├── admin/           ⚠️ Only 1 page
│   ├── mioc/            ✅ Good organization
│   ├── mroi/            ⚠️ Mixed components and pages
│   └── [Various pages]  ⚠️ Should be organized by feature
└── ...
```

#### Issues:
1. **Page Organization:**
   - Pages mixed with styles (`.css` + `.tsx`)
   - Some pages are standalone, others are grouped by domain
   - No consistent naming convention

2. **MROI Feature Chaos:**
   - Components: `MroiDashboard.tsx`, `RoiEditor.tsx`, etc.
   - Has nested `components/` folder
   - CSS files scattered

#### Recommended Structure:
```
frontend/src/pages/
├── auth/
│   ├── SignInPage.tsx
│   ├── SignInPage.css
│   └── index.ts
├── admin/
│   ├── ManageRolesPage.tsx
│   ├── ManageRolesPage.css
│   └── index.ts
├── reports/
│   ├── ReportTaskConfigPage.tsx
│   ├── DownloadReportPage/
│   │   ├── DownloadReportPage.tsx
│   │   ├── DownloadReportPage.css
│   │   └── index.ts
│   └── index.ts
├── robots/
│   ├── RobotListPage/
│   │   ├── RobotListPage.tsx
│   │   ├── RobotListPage.css
│   │   ├── components/
│   │   │   ├── RobotForm.tsx
│   │   │   ├── RobotCard.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── RobotImageConfigPage/
│   ├── RobotReportPage/
│   └── index.ts
├── tasks/
│   ├── ReportTaskConfigPage/
│   ├── TaskEditorPage/
│   └── index.ts
├── workforce/
│   ├── WorkforcePage/
│   │   ├── WorkforcePage.tsx
│   │   ├── WorkforcePage.css
│   │   └── index.ts
│   └── index.ts
├── mioc/
│   ├── MiocDashboardPage/
│   │   ├── MiocDashboardPage.tsx
│   │   ├── MiocDashboardPage.css
│   │   ├── components/
│   │   └── index.ts
│   └── index.ts
├── mroi/
│   ├── MroiDashboard/
│   │   ├── MroiDashboard.tsx
│   │   ├── MroiDashboard.css
│   │   ├── components/
│   │   │   ├── DeviceList.tsx
│   │   │   ├── RoiGrid.tsx
│   │   │   ├── SchedulePanel.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── DevicesPage/
│   ├── RoisPage/
│   ├── RoiEditor/
│   ├── SchedulesPage/
│   └── index.ts
├── images/
│   ├── AddImagePage/
│   │   ├── AddImagePage.tsx
│   │   ├── components/
│   │   └── index.ts
│   └── index.ts
├── index.ts
└── NotFoundPage.tsx
```

### 2. **Component Extraction & Reusability**

#### Issues Found:
- Pages contain too much inline code
- MROI editor logic not modularized
- No separation of concerns (UI vs business logic)

#### Examples to Refactor:

1. **RoiEditor Component:**
   - Current: Contains canvas logic, form handling, state management
   - **Recommended:** Split into:
     ```
     frontend/src/pages/mroi/RoiEditor/
     ├── RoiEditor.tsx                (Container/Orchestration)
     ├── components/
     │   ├── Canvas.tsx               (Drawing logic)
     │   ├── PointList.tsx            (Point management)
     │   ├── PropertiesPanel.tsx      (Form/properties)
     │   ├── ToolBar.tsx              (Action buttons)
     │   └── index.ts
     ├── hooks/
     │   ├── useRoiCanvas.ts          (Canvas drawing logic)
     │   ├── useRoiPoints.ts          (Point manipulation)
     │   └── useRoiForm.ts            (Form state)
     ├── utils/
     │   └── drawing.ts
     ├── RoiEditor.css
     └── index.ts
     ```

2. **Device Management:**
   - Create reusable device components
   ```
   frontend/src/components/devices/
   ├── DeviceForm.tsx
   ├── DeviceCard.tsx
   ├── DeviceList.tsx
   └── index.ts
   ```

3. **Common UI Components:**
   - Create dedicated folder for repeated patterns
   ```
   frontend/src/components/common/
   ├── Loading.tsx
   ├── ErrorMessage.tsx
   ├── ConfirmDialog.tsx
   ├── DataTable.tsx
   └── index.ts
   ```

### 3. **Service Layer Organization**

#### Current State:
```
frontend/src/services/
├── api.client.ts        ✅ Good axios setup
├── auth.service.ts      ✅ Good
├── image.service.ts     ✅ Good
├── mroi.service.ts      ✅ Good
├── report.service.ts    ✅ Good
├── robots.service.ts    ✅ Good
├── storage.service.ts   ✅ Good
├── task.service.ts      ✅ Good
└── users.service.ts     ✅ Good
```

#### Recommendations:
1. **Create Service Classes (not just functions):**
   - Current: Some services export functions, some export objects
   - **Recommendation:** Standardize to class-based services
   ```typescript
   // Instead of:
   export const robotsService = { ... }
   
   // Use:
   export class RobotsService { ... }
   export const robotsService = new RobotsService()
   ```

2. **Centralize API Error Handling:**
   ```
   frontend/src/services/
   ├── api-client/
   │   ├── api.client.ts             (Axios config)
   │   ├── interceptors.ts           (Request/response)
   │   ├── error-handler.ts          (Error handling)
   │   └── index.ts
   └── [existing services]
   ```

3. **Create Service Interfaces:**
   ```
   frontend/src/types/services/
   ├── auth-service.interface.ts
   ├── robot-service.interface.ts
   └── ...
   ```

### 4. **Type Safety Issues**

#### Problems Found:
```typescript
// mroi.normalizer.ts
export function isPointArray(point: any): point is PointArray { ... }
export function normalizeRulePoints(rule: any): any { ... }
// Many `any` types!
```

#### Recommended:
1. **Create Complete Type Definitions:**
   ```
   frontend/src/types/
   ├── auth.types.ts
   ├── image.types.ts
   ├── mroi/
   │   ├── index.ts
   │   ├── device.types.ts
   │   ├── roi.types.ts
   │   ├── schedule.types.ts
   │   ├── point.types.ts
   │   └── canvas.types.ts
   ├── report.types.ts
   ├── task.types.ts
   └── robot.types.ts
   ```

2. **Replace `any` with Proper Types:**
   ```typescript
   // Before:
   export function normalizeRulePoints(rule: any): any { ... }
   
   // After:
   export function normalizeRulePoints(rule: RoiRule): NormalizedRoiRule { ... }
   ```

### 5. **State Management & Hooks**

#### Current State:
- Using Context API (AuthContext, DomainContext)
- Using React Query for data fetching
- Using React Hook Form for forms

#### Recommendations:
1. **Create Custom Hooks Library:**
   ```
   frontend/src/hooks/
   ├── auth/
   │   ├── useAuth.ts
   │   ├── useAuthWithTimeout.ts
   │   └── index.ts
   ├── data/
   │   ├── useDevices.ts
   │   ├── useRois.ts
   │   ├── useSchedules.ts
   │   └── index.ts
   ├── ui/
   │   ├── useModal.ts
   │   ├── useNotification.ts
   │   └── index.ts
   └── index.ts
   ```

2. **Create Query Hooks:**
   ```
   frontend/src/hooks/queries/
   ├── useDevicesQuery.ts
   ├── useRoisQuery.ts
   ├── useRobotsQuery.ts
   └── index.ts
   ```

### 6. **CSS Organization**

#### Issues:
- CSS files mixed with components
- No consistent naming (`.css` next to `.tsx`)
- Some component-level, some page-level

#### Recommended:
```
frontend/src/styles/
├── variables.css           (Colors, spacing, fonts)
├── global.css             (Reset, base styles)
├── mixins.css             (Utility classes)
└── themes/                (Theme variants)
    ├── light.css
    └── dark.css

frontend/src/pages/
├── [PageName]/
│   ├── [PageName].tsx
│   ├── [PageName].css     (Co-located)
│   └── index.ts
```

### 7. **Utils Organization**

#### Current State:
```
frontend/src/utils/
├── mroi.logger.ts
├── mroi.normalizer.ts
├── roleBasedRedirect.ts
└── __tests__/
```

#### Recommendations:
```
frontend/src/utils/
├── mroi/
│   ├── logger.ts
│   ├── normalizer.ts
│   ├── validators.ts      (NEW)
│   ├── __tests__/
│   └── index.ts
├── auth/
│   ├── roleBasedRedirect.ts
│   ├── permissions.ts     (NEW)
│   └── index.ts
├── validators/
│   ├── image.ts
│   ├── device.ts
│   └── index.ts
├── formatters/
│   ├── date.ts
│   ├── number.ts
│   └── index.ts
├── api/
│   ├── client.ts
│   ├── handlers.ts
│   └── index.ts
└── index.ts
```

---

## 📦 FOLDER STRUCTURE SUMMARY

### Backend - Current vs Recommended

**Current Issues:**
- ❌ Mixed concerns in services (especially reports, mroi)
- ❌ No abstraction for multi-database handling
- ❌ Raw SQL queries scattered in services
- ❌ Missing DTOs folder in some modules
- ❌ TODO items left unimplemented

**Recommended Structure:**
```
backend/src/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── exceptions/
├── config/
│   ├── database.config.ts
│   ├── cache.config.ts
│   └── ...
├── database/
│   ├── services/
│   ├── queries/
│   └── database.module.ts
├── modules/
│   ├── auth/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── decorators/
│   │   └── auth.module.ts
│   ├── reports/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── reports.service.ts
│   │   │   ├── cam-owners.service.ts
│   │   │   ├── workforce.service.ts
│   │   │   ├── jasper.service.ts
│   │   │   └── robot.service.ts
│   │   ├── dto/
│   │   └── reports.module.ts
│   ├── mroi/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── devices.service.ts
│   │   │   ├── rois.service.ts
│   │   │   ├── schedules.service.ts
│   │   │   ├── iv-cameras.service.ts
│   │   │   └── cache.service.ts
│   │   ├── dto/
│   │   ├── entities/
│   │   └── mroi.module.ts
│   └── [other modules...]
├── app.module.ts
└── main.ts
```

### Frontend - Current vs Recommended

**Current Issues:**
- ❌ Pages not consistently organized by feature
- ❌ CSS mixed with component files
- ❌ No page-level sub-components folder
- ❌ Many `any` types in MROI utilities
- ❌ No hooks library
- ❌ Services could be more standardized

**Recommended Structure:**
```
frontend/src/
├── components/
│   ├── common/
│   │   ├── Loading.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── index.ts
│   ├── devices/
│   ├── data-table/
│   ├── layout/
│   ├── mioc/
│   ├── routes/
│   └── ui/
├── pages/
│   ├── auth/
│   ├── admin/
│   ├── reports/
│   ├── robots/
│   ├── tasks/
│   ├── workforce/
│   ├── mioc/
│   ├── mroi/
│   ├── images/
│   └── index.ts
├── hooks/
│   ├── auth/
│   ├── data/
│   ├── queries/
│   ├── ui/
│   └── index.ts
├── services/
│   ├── api-client/
│   └── [domain services]
├── contexts/
├── types/
│   ├── mroi/
│   └── ...
├── utils/
│   ├── mroi/
│   ├── auth/
│   ├── validators/
│   ├── formatters/
│   └── index.ts
├── styles/
│   ├── variables.css
│   ├── global.css
│   └── mixins.css
└── config/
```

---

## 🔧 PRIORITY REFACTORING ROADMAP

### Phase 1: High Priority (Foundation)
1. **Backend Database Abstraction Layer**
   - Create database service layer
   - Move SQL queries to query builders
   - Estimated Impact: Improves testability & maintainability
   
2. **Frontend Page Structure Reorganization**
   - Reorganize pages by feature domain
   - Add index.ts files for clean exports
   - Estimated Impact: Improves code navigation & scalability

### Phase 2: Medium Priority (Enhancement)
1. **Backend MROI Module Refactoring**
   - Extract caching logic to separate service
   - Separate local vs external device handling
   
2. **Frontend Type Safety**
   - Replace `any` types with proper interfaces
   - Create complete type definitions
   
3. **Frontend Component Extraction**
   - Break down large components
   - Create reusable component library

### Phase 3: Low Priority (Polish)
1. **Error Handling Standardization**
2. **Logging Consistency**
3. **CSS Organization & Theming**
4. **Hooks Library Creation**

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Backend: Create database abstraction layer
- [ ] Backend: Refactor reports module (split by concern)
- [ ] Backend: Refactor MROI module (extract caching)
- [ ] Backend: Create DTOs for all modules
- [ ] Backend: Implement TODO items (logout, refresh token)
- [ ] Frontend: Reorganize pages by feature
- [ ] Frontend: Replace `any` types with interfaces
- [ ] Frontend: Create hooks library
- [ ] Frontend: Extract large components
- [ ] Frontend: Organize CSS/styles
- [ ] Frontend: Create shared component library
- [ ] Both: Add stricter linting rules
- [ ] Both: Update documentation

---

## 📝 NOTES

- All refactoring must preserve existing functionality
- No breaking changes to API contracts
- Update tests/docs as changes are made
- Consider impact on CI/CD pipeline
- Plan for incremental refactoring (don't do all at once)

---

**Next Step:** Proceed with implementation based on priority phases
