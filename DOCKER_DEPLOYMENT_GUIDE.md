# 🐳 DOCKER DEPLOYMENT GUIDE - Report Robot

**Date:** 2025-12-26  
**Status:** ✅ Ready for Production Deployment

---

## 📋 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Database Configuration](#database-configuration)
5. [Troubleshooting](#troubleshooting)
6. [Production Checklist](#production-checklist)
7. [Architecture Overview](#architecture-overview)

---

## 🚀 QUICK START

### 1. Clone and Setup
```bash
cd Report-Robot
cp .env.docker .env
# Edit .env with your actual credentials
nano .env
```

### 2. Build and Deploy
```bash
# Option A: Using docker-compose directly
docker-compose up -d

# Option B: Using provided script (Linux/Mac)
chmod +x docker-build.sh
./docker-build.sh

# Option C: Using Windows PowerShell
docker-compose build --no-cache
docker-compose up -d
```

### 3. Verify Services
```bash
# Check all services running
docker-compose ps

# View logs
docker-compose logs -f

# Test API
curl http://localhost:3001/api/mroi/iv-cameras/health

# Test Frontend
curl http://localhost/health
```

### 4. Initial Keycloak Setup (First Time Only)
```bash
# Access Keycloak admin console
# http://localhost:8080

# Login with:
# Username: admin (from .env KEYCLOAK_ADMIN_USERNAME)
# Password: (from .env KEYCLOAK_ADMIN_PASSWORD)

# Create realm: robot-report
# Create client: robot-report-client
# Configure OIDC settings
```

---

## 📋 PREREQUISITES

### System Requirements
- **Docker:** 20.10+
- **Docker Compose:** 2.0+
- **Memory:** 4GB minimum (8GB recommended)
- **Disk Space:** 10GB minimum
- **Network:** Access to external databases and services

### Required Credentials
```
Database Credentials (5 databases):
✅ Primary DB (192.168.100.125)
✅ MROI DB (192.168.100.83)
✅ MIOC DB (35.186.159.153)
✅ Robot DB (34.142.222.114)
✅ Workforce DB (34.87.166.125)

MinIO Credentials (2 buckets):
✅ Report bucket credentials
✅ Robot bucket credentials

Keycloak Credentials:
✅ Admin username & password
✅ Client ID & secret
✅ Realm name

Other Credentials:
✅ JWT secret
✅ Jasper Reports credentials
✅ True Alarm Web credentials
```

### Network Requirements
```
Outbound Connections:
✅ Database hosts (5 x PostgreSQL 5432)
✅ MinIO endpoints (storage.metthier.com:443)
✅ Keycloak (localhost:8080)
✅ MQTT broker (mqtt-open.metthier.ai:61883)
✅ Jasper Reports (192.168.100.135:8080)

Inbound Ports:
✅ Port 80   (Frontend HTTP)
✅ Port 3001 (Backend API)
✅ Port 8080 (Keycloak)
```

---

## 🔧 INSTALLATION STEPS

### Step 1: Prepare Environment File

```bash
# Copy template
cp .env.docker .env

# Edit with your credentials
nano .env  # Linux/Mac
# or
notepad .env  # Windows
```

### Step 2: Verify Configuration

Check that all 47+ environment variables are set:

```bash
# View what's configured
cat .env | grep -v "^#" | grep -v "^$"

# Should see entries like:
DATABASE_HOST=192.168.100.125
KEYCLOAK_ADMIN_USERNAME=admin
MINIO_ENDPOINT=storage.metthier.com
# ... etc
```

### Step 3: Build Docker Images

```bash
# Build both backend and frontend images
docker-compose build --no-cache

# This will:
# 1. Build backend image (node:18-alpine + ffmpeg)
# 2. Build frontend image (nginx:alpine)
# 3. Download keycloak:26.0.0 image
# Time: 5-15 minutes (depends on internet speed)
```

### Step 4: Start Services

```bash
# Start all services in background
docker-compose up -d

# Or start in foreground to see logs
docker-compose up

# Expected output:
# Creating report-robot-keycloak ... done
# Creating report-robot-backend ... done
# Creating report-robot-frontend ... done
```

### Step 5: Wait for Health Checks

```bash
# Monitor service health
docker-compose logs -f

# Or check individual services
docker-compose ps

# Wait for STATUS column to show "healthy" or "running"
# Frontend:  10-30 seconds
# Backend:   30-60 seconds  
# Keycloak:  60-120 seconds
```

### Step 6: Run Database Migrations

```bash
# IMPORTANT: Run migrations for MROI database
# This creates the camera, ROI, schedule, and snapshot tables

# Option A: Direct execution
docker-compose exec backend psql \
  -h 192.168.100.83 \
  -U aiintern \
  -d ivs_service \
  -f scripts/mroi_migration.sql

# Option B: Using environment variables
docker-compose exec backend psql \
  -h $MROI_DB_HOST \
  -U $MROI_DB_USERNAME \
  -d $MROI_DB_NAME \
  -f scripts/mroi_migration.sql

# Expected output:
# CREATE TABLE
# CREATE INDEX
# CREATE VIEW
# INSERT 0 3
# ... (no errors)
```

### Step 7: Verify Deployment

```bash
# Check container status
docker-compose ps

# Test frontend
curl http://localhost/health
# Expected: 200 OK

# Test backend API
curl http://localhost:3001/api/mroi/iv-cameras/health
# Expected: {"installed":true,"version":"..."}

# Test database connection
docker-compose exec backend npm run typeorm migration:show
# Should list migrations
```

---

## 🗄️ DATABASE CONFIGURATION

### Database Connection Topology

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Container                      │
│                   (Backend Service)                      │
└─────────────────────────────────────────────────────────┘
         │              │              │              │
         │              │              │              │
    [Primary]       [MROI]        [MIOC]         [Robot]
    192.168.      192.168.      35.186.       34.142.
    100.125       100.83        159.153       222.114
    (know_db)   (ivs_service) (metlink_   (data_
                              app_db)      robot)
```

### Primary Database (192.168.100.125)

```env
DATABASE_HOST=192.168.100.125
DATABASE_PORT=5432
DATABASE_USERNAME=aiintern
DATABASE_PASSWORD=your_password
DATABASE_NAME=know_db
```

**Contains:**
- Users, roles, permissions
- Reports, tasks
- Image metadata
- Incident data

---

### MROI Database (192.168.100.83)

```env
MROI_DB_HOST=192.168.100.83
MROI_DB_PORT=5432
MROI_DB_USERNAME=aiintern
MROI_DB_PASSWORD=your_password
MROI_DB_NAME=ivs_service
```

**Contains:**
- IV Cameras (video input devices)
- ROIs (Regions of Interest)
- Camera schedules
- Snapshots

**Migration Required:** ✅ YES
```bash
# Run on first deployment
docker-compose exec backend psql \
  -h 192.168.100.83 \
  -U aiintern \
  -d ivs_service \
  -f scripts/mroi_migration.sql
```

---

### MIOC Legacy Database (35.186.159.153)

```env
MIOC_DB_HOST=35.186.159.153
MIOC_DB_PORT=5432
MIOC_DB_USERNAME=postgres
MIOC_DB_PASSWORD=your_password
MIOC_DB_NAME=metlink_app_db
```

**Notes:**
- GCP public database
- ⚠️ No SSL (consider enabling)
- Pre-existing schema (no migration needed)

---

### Robot Database (34.142.222.114)

```env
ROBOT_DB_HOST=34.142.222.114
ROBOT_DB_PORT=5432
ROBOT_DB_USER=postgres
ROBOT_DB_PASSWORD=your_password
ROBOT_DB_NAME=data_robot
```

**Notes:**
- GCP public database
- SSL enabled
- Pre-existing schema

---

### Workforce Database (34.87.166.125)

```env
WF_DB_HOST=34.87.166.125
WF_DB_PORT=5432
WF_DB_USER=postgres
WF_DB_PASSWORD=your_password
WF_DB_NAME=ms_workforce
```

**Notes:**
- GCP public database
- SSL enabled
- Pre-existing schema

---

### Verify Database Connectivity

```bash
# Test from inside container
docker-compose exec backend bash

# Inside container, test connections
# Primary
psql -h 192.168.100.125 -U aiintern -d know_db -c "SELECT 1"

# MROI (requires migration)
psql -h 192.168.100.83 -U aiintern -d ivs_service -c "SELECT * FROM iv_cameras LIMIT 1"

# Exit container
exit
```

---

## 🐛 TROUBLESHOOTING

### Problem: Backend not connecting to database

```bash
# Check backend logs
docker-compose logs backend

# Look for errors like:
# "Error: connect ECONNREFUSED 192.168.100.125:5432"

# Verify network access
docker-compose exec backend ping 192.168.100.125

# If no connectivity: Check firewall, VPN, network routes
```

### Problem: Frontend shows "API connection failed"

```bash
# Check if backend is responding
curl http://localhost:3001/api/mroi/iv-cameras/health

# Check frontend logs
docker-compose logs frontend

# Verify CORS configuration
# Should see: CORS_ORIGIN=http://localhost (or your domain)
```

### Problem: Keycloak login not working

```bash
# Check Keycloak logs
docker-compose logs keycloak

# Verify realm and client exist
# Access: http://localhost:8080
# Admin credentials: from .env

# Check backend Keycloak config
# Should match KEYCLOAK_REALM and KEYCLOAK_CLIENT_ID
```

### Problem: FFmpeg not found

```bash
# Check backend logs
docker-compose logs backend | grep -i ffmpeg

# Manually verify FFmpeg in container
docker-compose exec backend ffmpeg -version

# FFmpeg should be installed automatically
# If not: Dockerfile.backend has `apk add ffmpeg`
```

### Problem: Database migration fails

```bash
# Check for existing tables (if migration already ran)
docker-compose exec backend psql \
  -h 192.168.100.83 \
  -U aiintern \
  -d ivs_service \
  -c "\dt"

# If tables exist: Migration already done (safe to skip)
# If not: Check database password and connectivity

# View migration script
cat scripts/mroi_migration.sql

# Run migration with verbose output
docker-compose exec backend psql \
  -h 192.168.100.83 \
  -U aiintern \
  -d ivs_service \
  -v ON_ERROR_STOP=1 \
  -f scripts/mroi_migration.sql
```

### Problem: Port already in use

```bash
# Example: Port 80 already in use
# Error: bind: address already in use

# Find process using port
netstat -tulpn | grep :80  # Linux
netstat -ano | findstr :80  # Windows

# Either:
# 1. Stop conflicting service
# 2. Change port in docker-compose.yml
#    Change: "- ${FRONTEND_PORT:-80}:80"
#    To:     "- ${FRONTEND_PORT:-8000}:80"
# 3. Restart docker-compose
```

### Problem: Out of disk space

```bash
# Check Docker disk usage
docker system df

# Clean up unused images/containers
docker system prune -a

# If still running out: May need more storage
# Check Docker Desktop settings (if using Docker Desktop)
```

---

## ✅ PRODUCTION CHECKLIST

### Pre-Deployment

- [ ] All 47+ environment variables configured
- [ ] Database credentials verified
- [ ] Network connectivity tested
- [ ] Firewall rules configured
- [ ] SSL certificates prepared (if needed)
- [ ] Backup of .env file created
- [ ] Database backups exist

### Deployment

- [ ] Run `docker-compose build --no-cache`
- [ ] Run `docker-compose up -d`
- [ ] Wait for all services to be healthy
- [ ] Run database migrations
- [ ] Test all API endpoints
- [ ] Test frontend functionality
- [ ] Test Keycloak login
- [ ] Verify health check endpoints

### Post-Deployment

- [ ] Set up monitoring
- [ ] Configure log aggregation
- [ ] Enable automatic restarts
- [ ] Schedule database backups
- [ ] Document deployment procedure
- [ ] Train team on Docker commands
- [ ] Set up alerting

### Ongoing Maintenance

- [ ] Monitor Docker resource usage
- [ ] Check logs regularly
- [ ] Update base images monthly
- [ ] Test disaster recovery procedures
- [ ] Review security settings quarterly

---

## 🏗️ ARCHITECTURE OVERVIEW

### Service Topology

```
┌───────────────────────────────────────────────────────────┐
│                     Docker Network                        │
│                  (report-network)                         │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │  Frontend    │   │  Backend     │   │  Keycloak    │ │
│  │  (Nginx)     │   │  (NestJS)    │   │  (Java)      │ │
│  │              │   │              │   │              │ │
│  │ Port: 80     │   │ Port: 3001   │   │ Port: 8080   │ │
│  └──────────────┘   └──────────────┘   └──────────────┘ │
│       │                   │                   │          │
│       └───────────────────┼───────────────────┘          │
│                           │                             │
│                   (API calls, Auth)                     │
│                                                         │
└───────────────────────────────────────────────────────────┘
          │                    │
          │                    │
   ┌──────▼──────┐    ┌────────▼────────┐
   │  External   │    │   External      │
   │ Databases   │    │   Services      │
   │  (5 x PG)   │    │   (MinIO, MQTT) │
   └─────────────┘    └─────────────────┘
```

### Data Flow

```
1. User Browser
   ↓
2. Frontend (Nginx) - Serves React app
   ↓
3. Backend API (NestJS) - Processes requests
   ├─ Authenticate via Keycloak
   ├─ Query databases (5 connections)
   ├─ Interact with MinIO storage
   ├─ Call external services (MQTT, Jasper, etc.)
   └─ Return JSON responses
   ↓
4. User Browser - Display updated UI
```

### Service Dependencies

```
Frontend
  ├─ depends_on: Backend (healthy)
  └─ communicates: Backend API, Keycloak

Backend
  ├─ depends_on: Keycloak (healthy)
  └─ communicates: 5 Databases, MinIO, MQTT, etc.

Keycloak
  └─ no dependencies within Docker
```

---

## 📊 RESOURCE ALLOCATION

### Recommended Hardware

| Component | Minimum | Recommended | Production |
|-----------|---------|------------|------------|
| **CPU** | 2 cores | 4 cores | 8+ cores |
| **RAM** | 4 GB | 8 GB | 16+ GB |
| **Storage** | 10 GB | 50 GB | 100+ GB |
| **Network** | 10 Mbps | 100 Mbps | 1 Gbps |

### Container Resource Limits

```yaml
# In docker-compose.yml (add if needed)
backend:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

---

## 🔐 SECURITY CONSIDERATIONS

### Current Implementation

✅ **Good:**
- Environment variables for secrets
- Non-root user in containers
- Health check endpoints
- HTTPS/TLS for external databases
- SQL injection prevention via ORM

⚠️ **Needs Attention:**
- `.env` file contains plaintext secrets
- Keycloak H2 database not persistent
- No image scanning
- No rate limiting configured

### Production Recommendations

1. **Secret Management**
   ```bash
   # Use Docker Secrets instead of .env
   docker secret create db_password -
   # Or: Use HashiCorp Vault, AWS Secrets Manager
   ```

2. **Enable HTTPS**
   ```yaml
   # Add Traefik reverse proxy with Let's Encrypt
   # or nginx with SSL certificates
   ```

3. **Database Encryption**
   ```bash
   # Enable SSL for all database connections
   # Currently: Some databases don't use SSL
   ```

4. **Image Scanning**
   ```bash
   # Scan images for vulnerabilities
   docker scan report-robot-backend
   docker scan report-robot-frontend
   ```

---

## 📈 MONITORING & LOGGING

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs (tail -f)
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Since specific time
docker-compose logs --since 10m
```

### Health Checks

```bash
# Frontend health
curl http://localhost/health

# Backend health & FFmpeg status
curl http://localhost:3001/api/mroi/iv-cameras/health

# Keycloak health
curl http://localhost:8080/health/ready

# Full container status
docker-compose ps
```

### Performance Monitoring

```bash
# Docker resource usage
docker stats

# Container inspection
docker inspect report-robot-backend

# Network connectivity
docker-compose exec backend ping 192.168.100.125
```

---

## 🔄 UPDATING & MAINTENANCE

### Update Docker Images

```bash
# Pull latest base images
docker-compose pull

# Rebuild with new images
docker-compose build --no-cache

# Restart services
docker-compose up -d
```

### Backup & Recovery

```bash
# Backup configuration
cp .env .env.backup
docker-compose logs > deployment.log

# Stop services (don't delete volumes)
docker-compose stop

# Restart after backup
docker-compose start
```

### Scaling

```bash
# Scale backend to multiple instances
docker-compose up -d --scale backend=3

# Note: You'd need a reverse proxy (nginx/traefik) 
# to distribute traffic across instances
```

---

## 📞 SUPPORT & DOCUMENTATION

### Useful Commands

```bash
# View all services
docker-compose ps

# Stop all services
docker-compose down

# Stop with volume cleanup
docker-compose down -v

# Rebuild everything
docker-compose up -d --build

# SSH into container
docker-compose exec backend bash
docker-compose exec backend sh  # Alpine shell

# View container filesystem
docker-compose exec backend ls -la /app

# Run one-off command
docker-compose exec backend npm run typeorm migration:show
```

### Documentation Files

- **DOCKER_FINAL_COMPLETE_READINESS.md** - Complete analysis
- **docker-compose.yml** - Service configuration
- **.env.docker** - Environment template
- **Dockerfile.backend** - Backend image definition
- **Dockerfile.frontend** - Frontend image definition
- **nginx.conf** - Frontend web server config
- **docker-build.sh** - Automated build script

### External Resources

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Documentation](https://docs.docker.com/compose)
- [NestJS Documentation](https://docs.nestjs.com)
- [React Documentation](https://react.dev)
- [Keycloak Documentation](https://www.keycloak.org/documentation)

---

**Last Updated:** 2025-12-26  
**Status:** ✅ Production Ready
