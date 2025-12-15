# 🔧 MROI Configuration Setup Guide

## 📍 Where to Get & Set Data

### **1. RTSP Cameras URLs** 
**ที่มา:** 
- Dari hardware camera manufacturer (Hikvision, Dahua, Uniview, etc.)
- Dari network admin
- Format: `rtsp://username:password@ip:port/path`

**ตัวอย่าง:**
```
rtsp://admin:admin123@192.168.1.100:554/stream1
rtsp://user:pass@10.0.0.50:554/h264/ch1/main/av_stream
```

**การเพิ่มเข้า System:**
```bash
# Frontend UI: Sidebar → MROI → Manage Devices
# กรอก:
- Device Name: "Front Door Camera"
- RTSP URL: "rtsp://admin:admin123@192.168.1.100:554/stream1"
- Location: "Building A, Floor 1"
```

---

### **2. SSH Configuration (สำหรับ Remote Execution)**
**ที่มา:**
- Server IP address
- SSH credentials from sysadmin
- Public key (optional)

**การตั้งค่า:**
```env
# ใน .env backend:
SSH_HOST=192.168.1.200
SSH_PORT=22
SSH_USERNAME=admin
SSH_PASSWORD=password
SSH_KEY_PATH=/etc/ssh/id_rsa  # optional
SSH_TIMEOUT=10000
```

**กำหนดใน Database:**
```json
{
  "docker_info": {
    "host": "192.168.1.200",
    "port": 22,
    "username": "admin",
    "password": "encrypted_password",
    "command_type": "docker"  // or "native"
  }
}
```

---

### **3. FFmpeg Configuration (สำหรับ Snapshot)**
**ที่มา:**
- Installed locally on server: `apt-get install ffmpeg`
- Docker image: `jrottenberg/ffmpeg`
- Conda/pip: `pip install ffmpeg-python`

**ตัวอย่าง Setup:**
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# Docker
docker pull jrottenberg/ffmpeg

# Verify
ffmpeg -version
```

**Configuration ใน .env:**
```env
FFMPEG_PATH=/usr/bin/ffmpeg        # Linux
FFMPEG_PATH=C:\ffmpeg\bin\ffmpeg.exe # Windows
FFMPEG_TIMEOUT=5000                 # timeout in ms
FFMPEG_QUALITY=high                 # high | medium | low
FFMPEG_OUTPUT_FORMAT=jpg            # jpg | png | webp
```

---

### **4. PostgreSQL Database Tables**
**ที่มา:**
- Database server ของระบบหลัก
- Use ฐานข้อมูล: `report_robot_db`

**Setup Steps:**

#### **Step 1: Create Tables**
```sql
-- Run this in PostgreSQL
CREATE TABLE IF NOT EXISTS iv_cameras (
    iv_camera_uuid VARCHAR(255) PRIMARY KEY,
    rtsp VARCHAR(255) NOT NULL,
    camera_name VARCHAR(255),
    camera_name_display VARCHAR(255),
    camera_type VARCHAR(255),
    device_id VARCHAR(255),
    reference_id VARCHAR(255),
    metthier_ai_config JSONB,
    docker_info JSONB,
    camera_site VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS iv_camera_rois (
    id SERIAL PRIMARY KEY,
    iv_camera_uuid VARCHAR(255) NOT NULL REFERENCES iv_cameras(iv_camera_uuid) ON DELETE CASCADE,
    roi_name VARCHAR(255),
    roi_type VARCHAR(50),
    coordinates JSONB,
    roi_settings JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS iv_camera_schedules (
    id SERIAL PRIMARY KEY,
    iv_camera_uuid VARCHAR(255) NOT NULL REFERENCES iv_cameras(iv_camera_uuid) ON DELETE CASCADE,
    schedule_name VARCHAR(255),
    start_time TIME,
    end_time TIME,
    days_of_week VARCHAR(100),
    actions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_iv_cameras_site ON iv_cameras(camera_site);
CREATE INDEX idx_iv_rois_uuid ON iv_camera_rois(iv_camera_uuid);
CREATE INDEX idx_iv_schedules_uuid ON iv_camera_schedules(iv_camera_uuid);
```

#### **Step 2: Insert Sample Data**
```sql
INSERT INTO iv_cameras (
    iv_camera_uuid, 
    rtsp, 
    camera_name, 
    camera_name_display, 
    camera_site
) VALUES (
    'cam-001-uuid',
    'rtsp://admin:admin123@192.168.1.100:554/stream1',
    'front_door',
    'Front Door Camera',
    'Building A'
);
```

---

### **5. MQTT Configuration (Optional - สำหรับ Real-time Updates)**
**ที่มา:**
- MQTT Broker (mosquitto, HiveMQ, etc.)
- Port: 1883 (unsecured) or 8883 (SSL)

**Setup:**
```bash
# Install MQTT Broker
docker run -d --name mosquitto -p 1883:1883 -p 9001:9001 eclipse-mosquitto

# ตั้งค่า .env
MQTT_BROKER=mqtt://localhost:1883
MQTT_USERNAME=mroi_user
MQTT_PASSWORD=mroi_pass
MQTT_TOPIC_PREFIX=mroi/

# Topics:
# - mroi/cameras/snapshots
# - mroi/rois/updates
# - mroi/schedules/triggered
```

---

### **6. Environment Variables - Complete Setup**

#### **.env Backend (ใน /backend)**
```env
# ========== Database ==========
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=report_robot_db

# ========== MROI Specific ==========
MROI_ENABLED=true

# FFmpeg
FFMPEG_TIMEOUT=5000
FFMPEG_QUALITY=high
FFMPEG_OUTPUT_FORMAT=jpg

# SSH (สำหรับ remote command execution)
SSH_HOST=192.168.1.200
SSH_PORT=22
SSH_USERNAME=admin
SSH_PASSWORD=password

# Storage
MROI_SNAPSHOT_DIR=/var/mroi/snapshots
MROI_RECORDING_DIR=/var/mroi/recordings

# MQTT (Optional)
MQTT_ENABLED=false
MQTT_BROKER=mqtt://localhost:1883
MQTT_USERNAME=mroi_user
MQTT_PASSWORD=mroi_pass

# Authentication
MROI_REQUIRE_AUTH=true
MROI_ALLOWED_ROLES=mroi_viewer,mroi_editor,admin
```

#### **.env Frontend (ใน /frontend)**
```env
# API
VITE_API_BASE_URL=http://localhost:3001/api
VITE_MROI_API_PATH=/mroi

# MROI Settings
VITE_MAX_TOTAL_REGIONS=6
VITE_MAX_ZOOM_REGIONS=1
VITE_SNAPSHOT_REFRESH_INTERVAL=5000  # ms
VITE_RTSP_TIMEOUT=30000              # ms

# UI Settings
VITE_MROI_CANVAS_WIDTH=1280
VITE_MROI_CANVAS_HEIGHT=720
VITE_ENABLE_ROI_DRAWING=true
VITE_ENABLE_SCHEDULE_EDITOR=true
```

---

### **7. Hardware/Network Requirements**

#### **Minimum Server Specs for MROI:**
```
CPU:      4 cores
RAM:      8 GB
Storage:  500 GB (for snapshots/recordings)
Network:  1 Gbps
```

#### **Network Access Required:**
```
- PostgreSQL: 5432
- Backend API: 3001
- Frontend: 3000 (dev) / 80 (prod)
- MQTT Broker: 1883
- SSH: 22
- RTSP Stream: 554 (from cameras)
```

---

### **8. Keycloak Integration (สำหรับ Auth)**

#### **Create MROI Role in Keycloak:**
```bash
# Login to Keycloak Admin Console
# Navigate to: Realm → Roles → Create

# Create roles:
- mroi_viewer   (read-only access)
- mroi_editor   (can create/edit ROIs)
- mroi_admin    (full access + settings)
```

#### **Assign Users:**
```
User → Role Mappings → Add role
  → mroi_viewer / mroi_editor / mroi_admin
```

#### **Backend Validation:**
```typescript
// In ProtectedRoute or Middleware
@UseGuards(AuthGuard('jwt'))
async createDevice(@Req() req: any) {
    const userRoles = req.user.roles; // From Keycloak
    if (!userRoles?.includes('mroi_editor')) {
        throw new ForbiddenException('Insufficient permissions');
    }
}
```

---

### **9. Verification Checklist**

#### **Database:**
- [ ] PostgreSQL running: `psql -U postgres -d report_robot_db`
- [ ] Tables created: `\dt` in psql
- [ ] Sample data inserted

#### **Backend:**
- [ ] FFmpeg installed: `ffmpeg -version`
- [ ] SSH connectivity: `ssh admin@192.168.1.200`
- [ ] .env variables set
- [ ] npm dependencies: `npm install` in /backend
- [ ] Build successful: `npm run build`

#### **Frontend:**
- [ ] .env variables set
- [ ] npm dependencies: `npm install` in /frontend
- [ ] Build successful: `npm run build`

#### **Integration:**
- [ ] Backend running: `npm run start:dev`
- [ ] API responds: `curl http://localhost:3001/api/mroi/devices`
- [ ] Frontend loads: `http://localhost:3000/mroi`
- [ ] Can see MROI menu in sidebar

---

### **10. Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| FFmpeg not found | `which ffmpeg` and update FFMPEG_PATH in .env |
| RTSP connection failed | Check IP, port, username/password |
| Database connection error | Verify PostgreSQL is running, credentials correct |
| Snapshot timeout | Increase FFMPEG_TIMEOUT value |
| SSH command failed | Check SSH credentials, server firewall |
| Auth errors | Verify Keycloak roles assigned to user |

---

## 📊 Data Sources Summary Table

| Component | Data Source | Where to Get | Format |
|-----------|-------------|------------|--------|
| **RTSP URL** | Camera | Hardware manufacturer spec sheet | `rtsp://...` |
| **SSH Config** | Server | System admin | IP, port, user/pass |
| **FFmpeg** | Server package | `apt install ffmpeg` | Binary path |
| **PostgreSQL** | Database | Docker / Local install | Connection string |
| **MQTT Broker** | Optional service | Docker mosquitto | Connection URL |
| **Keycloak Roles** | Auth system | Keycloak Admin Console | Role names |
| **Device Config** | UI/Admin | Sidebar MROI menu | Manual entry |

---

## 🚀 Quick Start

```bash
# 1. Setup PostgreSQL Tables
psql -U postgres -f scripts/mroi_tables.sql

# 2. Configure Environment
cp .env.example .env
# Edit .env with actual values

# 3. Install & Build
cd backend && npm install && npm run build
cd frontend && npm install && npm run build

# 4. Start Services
# Terminal 1:
cd backend && npm run start:dev

# Terminal 2:
cd frontend && npm run dev

# 5. Access
# Frontend: http://localhost:3000/mroi
# API: http://localhost:3001/api/mroi
# Keycloak: http://localhost:8080
```

---

