# 📊 MROI Data Sources & Configuration Summary

## 🎯 Quick Reference - Where to Get Each Component

```
┌─────────────────────────────────────────────────────────────┐
│           MROI SYSTEM DATA SOURCES MAPPING                  │
└─────────────────────────────────────────────────────────────┘

┏━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━┓
┃ Component         ┃ Source          ┃ How to Obtain        ┃
┡━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━┩
│ RTSP URLs         │ Hardware/Camera │ Contact sysadmin     │
│ SSH Credentials   │ Server/Sysadmin │ Request from IT      │
│ FFmpeg Binary     │ Server Install  │ apt/docker install   │
│ PostgreSQL DB     │ Database Server │ Setup/Migrate        │
│ MQTT Broker       │ Service/Docker  │ Docker/package mgr   │
│ Keycloak Roles    │ Admin Console   │ Create in UI         │
│ Canvas Dimensions │ Frontend Config │ Set in env vars      │
│ API Endpoints     │ Backend Routes  │ Auto-generated       │
└────────────────────┴─────────────────┴──────────────────────┘
```

---

## 🗄️ DATABASE STRUCTURE

### **1. iv_cameras (Primary Devices Table)**
```
TABLE: iv_cameras
├── iv_camera_uuid (UUID)          ← Unique identifier
├── rtsp (String)                  ← RTSP URL from hardware
├── camera_name (String)           ← Internal name
├── camera_name_display (String)   ← Display name
├── camera_type (String)           ← Manufacturer/Model
├── camera_site (String)           ← Location/Building
├── metthier_ai_config (JSON)      ← ROI rules: {rule: [...]}
├── docker_info (JSON)             ← SSH connection details
├── is_active (Boolean)            ← Status flag
├── domain (String)                ← Multi-tenant isolation
├── created_at (Timestamp)
└── updated_at (Timestamp)

EXAMPLE ROW:
{
  "iv_camera_uuid": "cam-001-uuid",
  "rtsp": "rtsp://admin:admin123@192.168.1.100:554/stream1",
  "camera_name": "front_door",
  "camera_name_display": "Front Door Camera",
  "camera_site": "Building A",
  "metthier_ai_config": {
    "rule": [
      {
        "name": "Entrance Zone",
        "type": "intrusion",
        "points": [{x: 100, y: 100}, {x: 300, y: 100}, ...],
        "sensitivity": 80
      }
    ]
  },
  "docker_info": {
    "host": "192.168.1.200",
    "port": 22,
    "username": "admin"
  }
}
```

### **2. iv_camera_rois (Region of Interest Details)**
```
TABLE: iv_camera_rois
├── id (Serial PK)
├── iv_camera_uuid (FK)            ← Reference to camera
├── roi_name (String)              ← ROI identifier
├── roi_type (Enum)                ← intrusion|tripwire|density|zoom
├── coordinates (JSON)             ← Polygon points from Konva
├── roi_settings (JSON)            ← Sensitivity, threshold, color
├── is_active (Boolean)
├── created_by (String)            ← User who created it
├── domain (String)
└── timestamps

EXAMPLE ROW:
{
  "id": 1,
  "iv_camera_uuid": "cam-001-uuid",
  "roi_name": "Entrance Zone",
  "roi_type": "intrusion",
  "coordinates": {
    "points": [
      {"x": 100, "y": 100},
      {"x": 300, "y": 100},
      {"x": 300, "y": 300},
      {"x": 100, "y": 300}
    ],
    "width": 1280,
    "height": 720
  },
  "roi_settings": {
    "sensitivity": 80,
    "threshold": 90,
    "color": "#FF0000"
  }
}
```

### **3. iv_camera_schedules (Time-based Automation)**
```
TABLE: iv_camera_schedules
├── id (Serial PK)
├── iv_camera_uuid (FK)            ← Reference to camera
├── schedule_name (String)         ← Schedule identifier
├── start_time (TIME)              ← HH:mm format
├── end_time (TIME)                ← HH:mm format
├── days_of_week (String)          ← MON,TUE,WED,...
├── actions (JSON)                 ← Enable/disable ROIs, record, alert
├── is_active (Boolean)
├── domain (String)
└── timestamps

EXAMPLE ROW:
{
  "id": 1,
  "iv_camera_uuid": "cam-001-uuid",
  "schedule_name": "Business Hours",
  "start_time": "08:00",
  "end_time": "18:00",
  "days_of_week": "MON,TUE,WED,THU,FRI",
  "actions": {
    "enableROIs": ["Entrance Zone"],
    "recordVideo": true,
    "sendAlert": true
  }
}
```

---

## 🔄 DATA FLOW DIAGRAM

```
┌─────────────────┐
│  RTSP Camera    │  ← Hardware (Hikvision, Dahua, etc.)
│  IP: 192.x.x.x │
└────────┬────────┘
         │ rtsp://...
         ▼
┌─────────────────────────────────────────┐
│      MROI Frontend (React/Konva)        │
│  ┌─────────────────────────────────────┐│
│  │ 1. List Devices (GET /cameras)      ││
│  │ 2. Draw ROI (Canvas + Konva.js)     ││
│  │ 3. Set Schedule (Time picker)       ││
│  │ 4. View Snapshot (Refresh 5s)       ││
│  └─────────────────────────────────────┘│
└────────┬────────────────────────────────┘
         │ HTTP/API calls
         ▼
┌─────────────────────────────────────────┐
│      MROI Backend (NestJS)              │
│  ┌─────────────────────────────────────┐│
│  │ DevicesController  → CRUD cameras   ││
│  │ RoisController     → CRUD ROIs      ││
│  │ SchedulesController → CRUD schedules││
│  │ SnapshotService    → FFmpeg capture ││
│  └─────────────────────────────────────┘│
└────────┬────────────────────────────────┘
         │ SQL queries
         ▼
┌─────────────────────────────────────────┐
│      PostgreSQL Database                │
│  ┌─────────────────────────────────────┐│
│  │ iv_cameras                          ││
│  │ iv_camera_rois                      ││
│  │ iv_camera_schedules                 ││
│  │ iv_camera_snapshots (optional)      ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   Additional Services (Optional)        │
│  ┌─────────────────────────────────────┐│
│  │ FFmpeg    → Snapshot capture        ││
│  │ SSH       → Remote execution        ││
│  │ MQTT      → Real-time notifications ││
│  │ Keycloak  → Authentication          ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## 📝 Configuration Checklist

### **Before Starting Development:**

#### **Phase 1: Infrastructure** 
- [ ] PostgreSQL running
- [ ] Create `report_robot_db` database
- [ ] Run `scripts/mroi_migration.sql`

#### **Phase 2: Backend Setup**
- [ ] Copy `.env.example` to `.env`
- [ ] Set database credentials
- [ ] Install FFmpeg: `apt-get install ffmpeg`
- [ ] Set FFMPEG_PATH in .env
- [ ] Configure SSH credentials (if needed)
- [ ] `npm install` in /backend

#### **Phase 3: Frontend Setup**
- [ ] Copy `.env.example` to `.env`
- [ ] Set API endpoint: `http://localhost:3001/api`
- [ ] `npm install` in /frontend

#### **Phase 4: Testing**
- [ ] Backend builds: `npm run build`
- [ ] Frontend builds: `npm run build`
- [ ] Can access `/api/mroi/devices` endpoint
- [ ] Can see MROI menu in sidebar

---

## 🎬 Environment Variables Template

### **Backend .env**
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=report_robot_db

# MROI
MROI_ENABLED=true
MROI_SNAPSHOT_DIR=/var/mroi/snapshots
MROI_RECORDING_DIR=/var/mroi/recordings

# FFmpeg
FFMPEG_TIMEOUT=5000
FFMPEG_QUALITY=high
FFMPEG_OUTPUT_FORMAT=jpg

# SSH (Optional)
SSH_HOST=192.168.1.200
SSH_PORT=22
SSH_USERNAME=admin
SSH_PASSWORD=password

# MQTT (Optional)
MQTT_ENABLED=false
MQTT_BROKER=mqtt://localhost:1883

# Auth
MROI_REQUIRE_AUTH=true
MROI_ALLOWED_ROLES=mroi_viewer,mroi_editor,admin
```

### **Frontend .env**
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_MAX_TOTAL_REGIONS=6
VITE_MAX_ZOOM_REGIONS=1
VITE_SNAPSHOT_REFRESH_INTERVAL=5000
VITE_RTSP_TIMEOUT=30000
```

---

## 🔌 API Endpoints Summary

### **Devices (Cameras)**
```
GET    /api/mroi/devices              → Get all cameras
POST   /api/mroi/devices              → Create new camera
GET    /api/mroi/devices/:id          → Get camera details
PUT    /api/mroi/devices/:id          → Update camera
DELETE /api/mroi/devices/:id          → Delete camera
GET    /api/mroi/devices/:id/status   → Get camera status
GET    /api/mroi/snapshot?rtsp=URL    → Capture snapshot
```

### **ROIs**
```
GET    /api/mroi/rois                 → Get all ROIs
POST   /api/mroi/rois                 → Create ROI
GET    /api/mroi/rois/:id             → Get ROI details
PUT    /api/mroi/rois/:id             → Update ROI
DELETE /api/mroi/rois/:id             → Delete ROI
PUT    /api/mroi/rois/:id/toggle      → Enable/disable ROI
GET    /api/mroi/rois?deviceId=X      → Get ROIs for device
```

### **Schedules**
```
GET    /api/mroi/schedules            → Get all schedules
POST   /api/mroi/schedules            → Create schedule
GET    /api/mroi/schedules/:id        → Get schedule details
PUT    /api/mroi/schedules/:id        → Update schedule
DELETE /api/mroi/schedules/:id        → Delete schedule
PUT    /api/mroi/schedules/:id/toggle → Enable/disable schedule
```

---

## 📦 Required Software

```
┌─────────────────────────────────────────┐
│          Software Requirements          │
├─────────────────────────────────────────┤
│ Node.js          │ 16.x or higher      │
│ npm              │ 8.x or higher       │
│ PostgreSQL       │ 12.x or higher      │
│ FFmpeg           │ 4.x or higher       │
│ Keycloak         │ 20.x or higher      │
│ Docker (opt.)    │ Latest              │
└─────────────────────────────────────────┘
```

### **Installation Commands**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib ffmpeg nodejs npm

# macOS
brew install postgresql ffmpeg node

# Windows
# Download installers from:
# - PostgreSQL: https://www.postgresql.org/download/windows/
# - FFmpeg: https://ffmpeg.org/download.html
# - Node.js: https://nodejs.org/
```

---

## 🚨 Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `FFmpeg not found` | Not installed or wrong path | Install FFmpeg, update FFMPEG_PATH |
| `RTSP connection timeout` | Wrong URL/credentials | Verify with `ffprobe rtsp://...` |
| `Database connection error` | PostgreSQL not running | `sudo systemctl start postgresql` |
| `Port already in use` | Backend/Frontend port conflict | Change port in .env or kill process |
| `CORS error` | Frontend-backend domain mismatch | Update VITE_API_BASE_URL |
| `Auth failed` | Missing Keycloak role | Assign mroi_viewer/mroi_editor role |

---

## 📚 Reference Files

- Backend configuration: `/backend/.env`
- Frontend configuration: `/frontend/.env`
- Database migrations: `/scripts/mroi_migration.sql`
- Docker setup: `/docker_configs/docker-compose.yml`
- Documentation: This file + `/MROI_*.md`

---

**Last Updated:** December 15, 2025
**Version:** 1.0.0

