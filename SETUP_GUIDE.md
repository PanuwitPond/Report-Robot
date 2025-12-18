# 🚀 Setup Guide - Report Robot (MROI Editor)

การ Setup ระบบจากศูนย์ให้สามารถใช้งาน MROI Editor ได้

---

## 📋 ขั้นตอนที่ 1: ติดตั้ง Node Dependencies

### Backend
```powershell
cd c:\Users\panuwit.rak\Documents\GitHub\Report-Robot\backend
npm install
```

### Frontend
```powershell
cd c:\Users\panuwit.rak\Documents\GitHub\Report-Robot\frontend
npm install
```

---

## 🎬 ขั้นตอนที่ 2: ติดตั้ง FFmpeg (สำคัญ!)

### สาเหตุ: 
- Backend ใช้ FFmpeg เพื่อจับภาพ (snapshot) จากกล้อง RTSP
- หากไม่มี FFmpeg → ภาพจะไม่แสดงใน MROI Editor

### วิธีติดตั้ง

#### Option A: ใช้ WinGet (ขนาด ~223 MB)  
```powershell
winget install Gyan.FFmpeg
```

#### Option B: ใช้ Chocolatey
```powershell
choco install ffmpeg
```

---

## ⚙️ ขั้นตอนที่ 3: ตั้ง PATH Environment Variable

**สำคัญ:** PowerShell ต้องรู้ว่าจะหา FFmpeg ได้จากไหน

### วิธีที่ 1: ใช้ PowerShell (ถาวร)
```powershell
$ffmpegPath = "C:\Users\panuwit.rak\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin"
[Environment]::SetEnvironmentVariable("Path", "$([Environment]::GetEnvironmentVariable('Path', [EnvironmentVariableTarget]::Machine));$ffmpegPath", [EnvironmentVariableTarget]::Machine)
```

### วิธีที่ 2: ใช้ GUI
1. เปิด **Environment Variables** (ค้นหา "environment" ใน Start Menu)
2. เลือก **Path** → **Edit**
3. เพิ่ม path ของ FFmpeg bin folder

---

## ✅ ขั้นตอนที่ 4: ตรวจสอบ FFmpeg

### ปิด PowerShell ปัจจุบัน แล้ว **เปิดใหม่**

จากนั้น รัน:
```powershell
ffmpeg -version
```

**ถ้าเห็น version number → OK ✅**

---

## 🏃 ขั้นตอนที่ 5: รัน Backend Server

```powershell
cd c:\Users\panuwit.rak\Documents\GitHub\Report-Robot\backend
npm run start:dev
```

**ระบบจะแสดง:**
```
✅ FFmpeg is installed
🚀 Application is running on: http://localhost:3001/api
```

---

## 🎨 ขั้นตอนที่ 6: รัน Frontend Server

**เปิด PowerShell ใหม่** (window แยก)
```powershell
cd c:\Users\panuwit.rak\Documents\GitHub\Report-Robot\frontend
npm run dev
```

**ระบบจะแสดง:**
```
VITE v5.x.x  ready in xxxx ms

➜  Local:   http://localhost:3000/
```

---

## 🌐 ขั้นตอนที่ 7: เปิด Browser

1. เข้าไป http://localhost:3000/
2. ไปที่ **MROI** → **ROI Drawing Editor**
3. เลือก Camera device
4. ภาพจะแสดดออกมา ✅

---

## 🔍 Troubleshooting

### ❌ Error: FFmpeg ไม่ถูกรู้จัก
**วิธีแก้:**
1. ตรวจสอบว่า FFmpeg ติดตั้งแล้ว: `ffmpeg -version`
2. ปิด PowerShell และเปิดใหม่ (เพื่อให้ PATH update)
3. ถ้ายังไม่ได้ → ทำตามขั้นตอนที่ 3 ใหม่

### ❌ Backend Error: "⚠️ FFmpeg is NOT installed"
**วิธีแก้:**
1. Backend ยังใช้ cache PATH เก่า
2. Restart backend server (`Ctrl+C` แล้ว `npm run start:dev`)

### ❌ ภาพไม่แสดด (Error 500)
**วิธีแก้:**
1. ตรวจสอบ RTSP URL ของกล้อง (ต้องถูกต้อง)
2. ตรวจสอบว่ากล้องทำงานอยู่
3. ดู Backend logs เพื่อดูข้อมูลลม่าเพิ่มเติม

---

## 📝 Notes

- **Backend port:** 3001
- **Frontend port:** 5173
- **FFmpeg version:** 8.0.1
- **Node version:** ต้อง 16+ ขึ้นไป

---

## 💡 Quick Reference

| คำสั่ง | ที่เลือก | ผลลัพธ์ |
|--------|---------|---------|
| `npm install` | backend + frontend | ติดตั้ง dependencies |
| `npm run start:dev` | backend | รัน server ที่ port 3001 |
| `npm run dev` | frontend | รัน vite ที่ port 5173 |
| `ffmpeg -version` | anywhere | ตรวจสอบ FFmpeg |

---

**✨ Setup เรียบร้อย! ระบบพร้อมใช้งาน**
