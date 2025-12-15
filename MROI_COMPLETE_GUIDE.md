# 🎯 MROI Integration - Complete Data Sources & Configuration Guide

## Executive Summary

MROI ได้ถูกเพิ่มเข้าระบบ AI Report System เป็นฟีเจอร์ลำดับที่ 4 ในเมนู Sidebar

---

## 📍 Data Sources Overview

### **จากที่ไหนต้องไปเก็บ/กำหนดข้อมูล:**

```
1. RTSP Camera URLs
   ↓ WHERE: Hardware Manufacturer / Network Admin
   ↓ STORE: database.iv_cameras.rtsp
   ↓ FORMAT: rtsp://username:password@ip:port/stream

2. Camera Device Info
   ↓ WHERE: Frontend UI or Manual Entry
   ↓ STORE: database.iv_cameras (name, location, type)
   ↓ METHOD: POST /api/mroi/devices

3. ROI Zones (Intrusion, Tripwire, Density, Zoom)
   ↓ WHERE: Frontend Konva Canvas Drawing
   ↓ STORE: database.iv_camera_rois (coordinates, settings)
   ↓ METHOD: POST /api/mroi/rois

4. Schedules (Time-based Automation)
   ↓ WHERE: Frontend Time Picker UI
   ↓ STORE: database.iv_camera_schedules (times, days, actions)
   ↓ METHOD: POST /api/mroi/schedules

5. Snapshots (Real-time Camera Images)
   ↓ WHERE: FFmpeg captures from RTSP
   ↓ STORE: File system + iv_camera_snapshots table
   ↓ METHOD: GET /api/mroi/snapshot?rtsp=...

6. SSH Configuration (Remote Execution)
   ↓ WHERE: System Admin / Server Config
   ↓ STORE: database.iv_cameras.docker_info (JSON)
   ↓ METHOD: Environment Variables in .env

7. Authentication & Roles
   ↓ WHERE: Keycloak Admin Console
   ↓ STORE: Keycloak Roles (mroi_viewer, mroi_editor, mroi_admin)
   ↓ METHOD: Automatic via JWT token
```

---

## 🗄️ Database Requirements

### **PostgreSQL Tables (Use existing report_robot_db)**

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| **iv_cameras** | RTSP camera devices | uuid, rtsp, camera_name, metthier_ai_config, docker_info |
| **iv_camera_rois** | Region of Interest definitions | id, camera_uuid, roi_name, roi_type, coordinates, settings |
| **iv_camera_schedules** | Time-based scheduling | id, camera_uuid, start_time, end_time, days, actions |
| **iv_camera_snapshots** | Snapshot archival | id, camera_uuid, snapshot_path, timestamp |

**Setup:**
```bash
psql -U postgres -d report_robot_db -f scripts/mroi_migration.sql
```

---

## 🔧 Configuration Files Needed

### **1. Backend .env Variables**
```env
# Database (same as main system)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=report_robot_db

# FFmpeg for snapshots
FFMPEG_TIMEOUT=5000
FFMPEG_QUALITY=high

# SSH for remote commands
SSH_HOST=192.168.1.200
SSH_PORT=22
SSH_USERNAME=admin
SSH_PASSWORD=password

# Storage paths
MROI_SNAPSHOT_DIR=/var/mroi/snapshots
MROI_RECORDING_DIR=/var/mroi/recordings
```

### **2. Frontend .env Variables**
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_MAX_TOTAL_REGIONS=6
VITE_MAX_ZOOM_REGIONS=1
VITE_SNAPSHOT_REFRESH_INTERVAL=5000
```

### **3. Database Migration Script**
File: `scripts/mroi_migration.sql`
- Creates 4 tables (cameras, rois, schedules, snapshots)
- Creates indexes for performance
- Includes sample data

---

## 🎬 How to Set Up

### **Step 1: Database Setup**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create/select database (should already exist)
\c report_robot_db

# Run migration script
\i scripts/mroi_migration.sql

# Verify
SELECT * FROM v_mroi_summary;
```

### **Step 2: Update Backend Environment**
```bash
cd backend

# Edit .env file
nano .env
# Add the variables from above section

# Install dependencies
npm install fluent-ffmpeg node-ssh mqtt

# Build
npm run build
```

### **Step 3: Update Frontend Environment**
```bash
cd frontend

# Edit .env file
nano .env
# Add the variables from above section

# Build
npm run build
```

### **Step 4: Start Services**
```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Access
# Frontend: http://localhost:3000/mroi
# API: http://localhost:3001/api/mroi
```

---

## 📊 Data Input Methods

### **Via Frontend UI:**
1. **Add Camera Device**
   - Path: Sidebar → 🎥 MROI → Manage Devices
   - Input: Name, RTSP URL, Location
   - Action: POST /api/mroi/devices

2. **Draw ROI Zones**
   - Path: Sidebar → 🎥 MROI → (Future) Draw ROIs
   - Input: Select type, draw on canvas, set sensitivity
   - Action: POST /api/mroi/rois

3. **Create Schedule**
   - Path: Sidebar → 🎥 MROI → (Future) Create Schedule
   - Input: Time range, days, actions
   - Action: POST /api/mroi/schedules

### **Via API (Curl Examples):**
```bash
# Create device
curl -X POST http://localhost:3001/api/mroi/devices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Front Door",
    "rtspUrl": "rtsp://admin:pass@192.168.1.100:554/stream1",
    "location": "Building A"
  }'

# Get all devices
curl http://localhost:3001/api/mroi/devices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Capture snapshot
curl "http://localhost:3001/api/mroi/snapshot?rtsp=rtsp://admin:pass@192.168.1.100:554/stream1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output snapshot.jpg
```

### **Via SQL (Direct Database):**
```sql
-- Insert camera
INSERT INTO iv_cameras (iv_camera_uuid, rtsp, camera_name, camera_site, domain)
VALUES ('cam-001', 'rtsp://...', 'Front Door', 'Building A', 'default-domain');

-- Insert ROI
INSERT INTO iv_camera_rois (iv_camera_uuid, roi_name, roi_type, coordinates, domain)
VALUES ('cam-001', 'Entrance', 'intrusion', '{"points":[...]}', 'default-domain');

-- Insert Schedule
INSERT INTO iv_camera_schedules (iv_camera_uuid, schedule_name, start_time, end_time, domain)
VALUES ('cam-001', 'Business Hours', '08:00', '18:00', 'default-domain');
```

---

## 🔐 Keycloak Integration

### **Create MROI Roles**
1. Login to Keycloak Admin Console
2. Go to: Realm → Roles → Create

**Roles to Create:**
- `mroi_viewer` - Read-only access
- `mroi_editor` - Can create/edit ROIs
- `mroi_admin` - Full access

### **Assign to Users**
1. Go to Users
2. Select user
3. Role Mappings → Assign role

---

## 📋 Complete File Checklist

### **Created/Modified Files**

**Backend:**
```
✅ backend/src/modules/mroi/
   ├── entities/ (device, roi, schedule)
   ├── dtos/ (create/update/response DTOs)
   ├── services/ (business logic)
   ├── controllers/ (API endpoints)
   └── mroi.module.ts

✅ backend/src/app.module.ts (added MroiModule import)
```

**Frontend:**
```
✅ frontend/src/pages/mroi/
   ├── DevicesPage.tsx (+ CSS)
   ├── MroiDashboard.tsx (+ CSS)
   └── index.ts

✅ frontend/src/services/mroi.service.ts
✅ frontend/src/types/mroi.types.ts
✅ frontend/src/routes/AppRoutes.tsx (added /mroi routes)
✅ frontend/src/components/layout/Sidebar.tsx (added menu #4)
```

**Documentation:**
```
✅ MROI_DATABASE_REQUIREMENTS.md
✅ MROI_CONFIGURATION_SETUP.md
✅ MROI_DATA_SOURCES_REFERENCE.md (this file)
✅ scripts/mroi_migration.sql
```

---

## ⚙️ External Software Requirements

| Software | Purpose | How to Install |
|----------|---------|----------------|
| **FFmpeg** | Capture snapshots from RTSP | `apt-get install ffmpeg` |
| **PostgreSQL** | Database server | `docker run postgres` |
| **Keycloak** | Authentication | `docker run keycloak` |
| **MQTT** (optional) | Real-time updates | `docker run mosquitto` |

---

## 🎯 Quick Start Commands

```bash
# 1. Setup database
psql -U postgres -d report_robot_db -f scripts/mroi_migration.sql

# 2. Backend
cd backend
cp .env.example .env  # Edit with your values
npm install
npm run build
npm run start:dev

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env  # Edit with your values
npm install
npm run dev

# 4. Access
# UI: http://localhost:3000/mroi
# API: http://localhost:3001/api/mroi
# Docs: See this file
```

---

## 🚀 Next Steps (Future Development)

1. **Implement Konva Canvas Drawing** for ROI creation
2. **Add FFmpeg Snapshot Service** for real-time camera views
3. **Implement MQTT** for real-time notifications
4. **Add Schedule Automation** background jobs
5. **Create SSH Remote Execution** for device control
6. **Add Advanced Analytics** dashboard with metrics

---

## 📞 Support & Troubleshooting

See `/MROI_CONFIGURATION_SETUP.md` for:
- Detailed environment variable setup
- Hardware requirements
- Common issues & solutions
- Verification checklist

---

## 📚 Related Documents

1. **MROI_DATABASE_REQUIREMENTS.md** - Database schema, API endpoints, data flow
2. **MROI_CONFIGURATION_SETUP.md** - Detailed setup guide, troubleshooting
3. **MROI_DATA_SOURCES_REFERENCE.md** - Quick reference, checklists
4. **scripts/mroi_migration.sql** - Database migration script

---

**System Status:** ✅ Ready for Configuration & Development
**Last Updated:** December 15, 2025
**Version:** 1.0.0

