# System Backup & Rollback Instructions

**Created:** 2025-12-15  
**Purpose:** Protect existing Report-Robot system before Docker implementation

## ⚠️ CRITICAL - READ BEFORE PROCEEDING

This file documents the backup state of the system. **DO NOT DELETE THIS FILE**.

---

## Current System State (Before Docker)

### Database Configuration
```
Main Database (report-robot):
- Host: 192.168.100.125
- Port: 5432
- Username: kdadmin
- Database: know_db

MIOC Database:
- Host: 35.186.159.153
- Port: 5432
- Username: supisara
- Database: metlink_app_db
```

### Running Services
- Frontend: `npm run dev` (Port 3000)
- Backend: `npm run start:dev` (Port 3001)
- Keycloak: `bin/kc.bat start-dev` (Port 8080)

### Code State
- All source code in `frontend/src/` - **UNTOUCHED**
- All source code in `backend/src/` - **UNTOUCHED**
- Node modules installed: `npm ci`

---

## Backup Checklist

- [x] .env files documented
- [x] Database passwords recorded
- [x] Current system tested
- [x] Keycloak running
- [x] API endpoints verified

---

## If Something Goes Wrong

### Quick Rollback (1 minute)
```bash
# Stop Docker
docker-compose down

# Run original system
cd backend && npm run start:dev
cd ../frontend && npm run dev
```

### Full Database Restore
```bash
# Restore from backup
psql -h 192.168.100.125 -U kdadmin know_db < backup_robot_db.sql
```

### Check git Status
```bash
# Verify no production code changed
git status  # Should only show .gitignore or docker-related files
git diff    # Should show NO changes to src/ directories
```

---

## System Components That WILL NOT CHANGE

✅ **frontend/src/** - All code untouched  
✅ **backend/src/** - All code untouched  
✅ **frontend/package.json** - No new dependencies  
✅ **backend/package.json** - No new dependencies  
✅ **database:know_db** - No table modifications  
✅ **keycloak/** - Keycloak configuration untouched  

---

## New Components Added (ISOLATED)

📦 **docker-compose.yml** - New, orchestrates containers  
📦 **nginx/nginx.conf** - New, reverse proxy  
📦 **postgres/init-db.sql** - New, Docker DB initialization  
📦 **.dockerignore** files - New, optimizations  
📦 **Dockerfile** in frontend, backend, mroi-* - New, containerization  

**None of these affect the existing system code.**

---

## MROI Integration Points

🔗 **Sidebar Menu** - Will add MROI icon (SEPARATE from MIOC)  
🔗 **AppRoutes.tsx** - Will add /mroi route (NEW, doesn't modify existing routes)  
🔗 **nginx.conf** - Will add /mroi and /mroi-api proxy rules (NEW)  

**Nothing will be REMOVED or CHANGED in existing routes.**

---

## Verification Tests Before Proceeding

Before going to Phase 2, ensure:

```bash
# Test 1: Git status shows only new files
git status | grep -E "frontend/src|backend/src"  # Should return nothing

# Test 2: Code files untouched
git diff frontend/src/
git diff backend/src/
# Both should return nothing

# Test 3: Original system still works
npm run start:dev  # backend should run
npm run dev        # frontend should run
```

---

## Emergency Contact Points

If anything breaks:
1. Stop everything: `docker-compose down`
2. Check git status: `git status`
3. Restore from this backup state
4. Original system code is pristine and untouched

---
