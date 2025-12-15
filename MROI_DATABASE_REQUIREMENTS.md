# MROI Database & Configuration Requirements 📋

## 🗄️ Database Analysis dari MROI Original

### **Primary Database: PostgreSQL**
```
Database Name: mroi_db (หรือต่อจากระบบหลัก)
Tables ที่ต้อง:
1. iv_cameras (กล้อง RTSP)
2. iv_camera_rois (ROI configuration)
3. iv_camera_schedules (Scheduling)
4. (Optional) schemas/workspaces (Multi-tenant support)
```

---

## 📊 Table Structure ที่ MROI ต้องใช้

### **1️⃣ iv_cameras (Devices/Cameras)**
```sql
CREATE TABLE iv_cameras (
    iv_camera_uuid VARCHAR(255) PRIMARY KEY,
    rtsp VARCHAR(255) NOT NULL,
    camera_name VARCHAR(255),
    camera_name_display VARCHAR(255),
    camera_type VARCHAR(255),
    device_id VARCHAR(255),
    reference_id VARCHAR(255),
    metthier_ai_config JSON,              -- เก็บ ROI rules ทั้งหมด
    docker_info JSON,                      -- SSH connection info
    camera_site VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

**Key Fields:**
- `rtsp` - RTSP URL ของกล้อง
- `metthier_ai_config` - เก็บ `{ rule: [...] }` (ROI data)
- `docker_info` - SSH info สำหรับ remote control
- `camera_site` - Location/Site

---

### **2️⃣ iv_camera_rois (Regions of Interest)**
```sql
CREATE TABLE iv_camera_rois (
    id SERIAL PRIMARY KEY,
    iv_camera_uuid VARCHAR(255) NOT NULL REFERENCES iv_cameras(iv_camera_uuid),
    roi_name VARCHAR(255),
    roi_type VARCHAR(50),                  -- 'intrusion' | 'tripwire' | 'density' | 'zoom'
    coordinates JSON,                      -- { points: [{x,y}], width, height }
    roi_settings JSON,                     -- { sensitivity, threshold, color }
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

**Key Fields:**
- `coordinates` - Polygon/Line points จาก Konva canvas
- `roi_settings` - Sensitivity, threshold, color config
- `roi_type` - ประเภท ROI (intrusion, tripwire, density, zoom)

---

### **3️⃣ iv_camera_schedules (Time-based Automation)**
```sql
CREATE TABLE iv_camera_schedules (
    id SERIAL PRIMARY KEY,
    iv_camera_uuid VARCHAR(255) NOT NULL REFERENCES iv_cameras(iv_camera_uuid),
    schedule_name VARCHAR(255),
    start_time TIME,                       -- HH:mm
    end_time TIME,                         -- HH:mm
    days_of_week VARCHAR(100),             -- 'MON,TUE,WED,...'
    actions JSON,                          -- { enableRois: [], disableRois: [], recordVideo, sendAlert }
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

**Key Fields:**
- `start_time`, `end_time` - Schedule timing
- `days_of_week` - Days when active
- `actions` - Actions to take (enable/disable ROIs, record, alert)

---

### **4️⃣ iv_line_users_sensetimes (Optional - Sensitivity Times)**
```sql
CREATE TABLE iv_line_users_sensetimes (
    id SERIAL PRIMARY KEY,
    iv_camera_uuid VARCHAR(255) NOT NULL REFERENCES iv_cameras(iv_camera_uuid),
    line_user_id VARCHAR(255),
    sensitivity_level INT,
    time_slot VARCHAR(100),                -- 'morning' | 'afternoon' | 'night'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

---

## 🔌 API Endpoints ที่ MROI Frontend ต้องเรียก

### **Camera Endpoints**
```
GET    /api/mroi/cameras/all              - ดึงกล้องทั้งหมด
GET    /api/mroi/cameras/:schema          - ดึงกล้องของ schema
GET    /api/mroi/snapshot?rtsp=URL        - Capture snapshot จาก RTSP
```

### **ROI Data Endpoints**
```
GET    /api/mroi/roi/data?schema=X&key=Y - ดึง ROI config
POST   /api/mroi/roi/save                 - บันทึก ROI config
```

### **Schemas/Sites Endpoints**
```
GET    /api/mroi/schemas                  - ดึง schemas/sites ทั้งหมด
GET    /api/mroi/schemas/:site            - ดึงข้อมูล site เฉพาะ
```

---

## ⚙️ Environment Variables ที่ต้องตั้งค่า

### **.env สำหรับ Backend**
```env
# MROI Database (ใช้ database ของระบบหลัก)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=report_robot_db

# MROI FFmpeg Configuration
FFMPEG_TIMEOUT=5000
FFMPEG_QUALITY=high

# MROI SSH Configuration (สำหรับ remote execution)
SSH_HOST=192.168.1.100
SSH_PORT=22
SSH_USERNAME=admin
SSH_PASSWORD=password
SSH_TIMEOUT=10000

# MROI MQTT (Optional - สำหรับ real-time updates)
MQTT_BROKER=mqtt://localhost:1883
MQTT_TOPIC=mroi/notifications

# MROI Storage
MROI_SNAPSHOT_DIR=/var/mroi/snapshots
MROI_RECORDING_DIR=/var/mroi/recordings
```

### **.env สำหรับ Frontend**
```env
VITE_API_ENDPOINT=http://localhost:3001/api
VITE_MROI_API_BASE=/api/mroi
VITE_MAX_TOTAL_REGIONS=6
VITE_MAX_ZOOM_REGIONS=1
VITE_SNAPSHOT_REFRESH_RATE=5000  # ms
VITE_RTSP_TIMEOUT=30000          # ms
```

---

## 🔄 Data Flow

### **1. Getting Camera List**
```
Frontend → GET /api/mroi/cameras/all
Backend  → Query iv_cameras table
         → Return { cameras: [...] }
Frontend → Display in dropdown
```

### **2. Drawing ROI & Saving**
```
Frontend → Konva canvas draws zones
         → POST /api/mroi/roi/save
           { schema, cameraId, rule: {...} }
Backend  → Update iv_camera_rois table
         → Update metthier_ai_config in iv_cameras
         → Return { success: true }
```

### **3. Real-time Snapshot**
```
Frontend → GET /api/mroi/snapshot?rtsp=rtsp://...
Backend  → FFmpeg captures frame
         → Return image/jpeg
Frontend → Display in canvas overlay
```

### **4. Scheduling**
```
Frontend → Create schedule
         → POST /api/mroi/schedules
Backend  → Store in iv_camera_schedules
         → Apply at runtime (MQTT or polling)
```

---

## 📦 Dependencies ที่ต้องเพิ่ม

### **Backend Dependencies**
```json
{
  "fluent-ffmpeg": "^2.1.3",      // FFmpeg wrapper
  "node-ssh": "^13.2.1",           // SSH client
  "mqtt": "^5.14.0",               // MQTT client (optional)
  "pg": "^8.16.0",                 // PostgreSQL client
  "sequelize": "^6.37.7"           // ORM (alternative)
}
```

### **Frontend Dependencies**
```json
{
  "konva": "^9.3.20",              // Canvas drawing library
  "react-konva": "^19.0.3",        // React wrapper for Konva
  "axios": "^1.13.2"               // HTTP client
}
```

---

## 🎯 Implementation Checklist

### **Phase 1: Database Setup**
- [ ] Create iv_cameras table
- [ ] Create iv_camera_rois table
- [ ] Create iv_camera_schedules table
- [ ] Create sample data

### **Phase 2: Backend Migrations**
- [ ] Add Sequelize models for MROI tables
- [ ] Create migration scripts
- [ ] Setup database connection pooling

### **Phase 3: Backend APIs**
- [ ] GET /cameras/all
- [ ] GET /cameras/:schema
- [ ] GET /roi/data
- [ ] POST /roi/save
- [ ] GET /snapshot

### **Phase 4: Frontend Integration**
- [ ] Import Konva library
- [ ] Build drawing canvas
- [ ] Connect to API endpoints
- [ ] Real-time snapshot refresh

### **Phase 5: Advanced Features**
- [ ] FFmpeg snapshots
- [ ] SSH remote execution
- [ ] MQTT real-time updates
- [ ] Schedule automation

---

## 🚀 Quick Setup Guide

```bash
# 1. Create database tables
psql -U postgres -d report_robot_db -f mroi_migration.sql

# 2. Install dependencies
cd backend && npm install fluent-ffmpeg node-ssh mqtt

# 3. Update environment variables
echo "FFMPEG_TIMEOUT=5000" >> .env

# 4. Start backend
npm run start:dev

# 5. Test API
curl http://localhost:3001/api/mroi/cameras/all
```

---

## 📝 Notes

- ✅ ใช้ **PostgreSQL** ของระบบหลัก (database เดียวกัน)
- ✅ ใช้ **NestJS** ที่สร้างไว้แล้ว
- ✅ Integrate กับ **Keycloak** สำหรับ auth
- ✅ เข้า **domain-based** filtering
- ⚠️ ต้องติดตั้ง **FFmpeg** ในเซิร์ฟเวอร์
- ⚠️ ต้อง **SSH access** ถ้าต้อง remote control

