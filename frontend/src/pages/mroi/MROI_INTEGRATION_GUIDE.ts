/**
 * MROI INTEGRATION - TROUBLESHOOTING GUIDE
 * 
 * ไฟล์นี้เป็นคู่มือการแก้ไขปัญหาเมื่อเจอ error จากการใช้ iframe
 */

// ===================================================
// 1. ERROR: CORS (Cross-Origin Resource Sharing)
// ===================================================

/**
 * SYMPTOMS:
 * - Browser console: "Refused to frame 'http://10.2.113.35:4173'"
 * - iframe เว็บ blank
 * - Network tab: status 200 แต่ iframe ไม่ load
 * 
 * CAUSES:
 * - Server MROI set X-Frame-Options: DENY
 * - Server MROI set X-Frame-Options: SAMEORIGIN (ต้องมา domain เดียวกัน)
 * - Server MROI ไม่ set CORS headers
 * 
 * SOLUTIONS:
 * Option A: ขอ MROI server admin เปลี่ยน X-Frame-Options
 *   X-Frame-Options: ALLOW-FROM http://your-app-url (deprecated)
 *   หรือใช้ CSP header แทน
 * 
 * Option B: ใช้ Redirect method (MroiRedirectPage.tsx)
 *   - เปลี่ยนจาก MroiEmbedPage.tsx -> MroiRedirectPage.tsx
 * 
 * CHECKING:
 * curl -I http://10.2.113.35:4173/mroi | grep -i "X-Frame-Options"
 */

// ===================================================
// 2. ERROR: iframe timeout
// ===================================================

/**
 * SYMPTOMS:
 * - Loading spinner แสดงมากกว่า 10 วินาที
 * - "ไม่สามารถโหลด MROI ได้ในเวลาที่กำหนด" message
 * 
 * CAUSES:
 * - Server MROI ช้า / offline
 * - Network connectivity issue
 * - Large assets loading
 * 
 * SOLUTIONS:
 * - ตรวจสอบว่า http://10.2.113.35:4173/mroi accessible
 * - ตรวจสอบ network latency: ping 10.2.113.35
 * - เพิ่ม timeout จาก 10s เป็น 15s ใน MroiEmbedPage.tsx
 *   เปลี่ยนที่บรรทัด: setTimeout(() => { ... }, 10000)
 */

// ===================================================
// 3. ERROR: 401 Unauthorized in iframe
// ===================================================

/**
 * SYMPTOMS:
 * - iframe แสดง "Unauthorized" หรือ login page
 * - MROI มีการ authenticate เอง
 * 
 * CAUSES:
 * - MROI app ต้อง session/token ของตัวเอง
 * - Cookies ไม่ share across iframe
 * 
 * SOLUTIONS:
 * Option A: ส่ง token ผ่าน URL
 *   const token = localStorage.getItem('auth_token');
 *   const url = `http://10.2.113.35:4173/mroi?token=${token}`;
 *   <iframe src={url} />
 * 
 * Option B: ใช้ postMessage API
 *   iframe.contentWindow.postMessage({token: '...'}, origin)
 * 
 * Option C: ใช้ Redirect method (simplest)
 *   MroiRedirectPage.tsx
 */

// ===================================================
// 4. ERROR: Mixed Content (HTTPS/HTTP)
// ===================================================

/**
 * SYMPTOMS:
 * - Browser console: "Mixed Content: The page was loaded over HTTPS..."
 * - iframe blank / not loading
 * 
 * CAUSES:
 * - App ใช้ HTTPS แต่ MROI URL ใช้ HTTP
 * - Browser block insecure content
 * 
 * SOLUTIONS:
 * - ใช้ HTTPS สำหรับ MROI URL (ถ้า possible)
 * - ตรวจสอบ MROI deployment configuration
 * - โปรดแจ้ง MROI admin ให้ใช้ HTTPS
 */

// ===================================================
// 5. ERROR: iframe sandbox attribute
// ===================================================

/**
 * SYMPTOMS:
 * - iframe ไม่สามารถ access external resources
 * - Forms, popups ไม่ทำงาน
 * - Scripts ไม่ execute
 * 
 * SOLUTIONS:
 * เพิ่ม permissions ใน sandbox attribute:
 * <iframe
 *   sandbox="
 *     allow-same-origin
 *     allow-scripts
 *     allow-popups
 *     allow-forms
 *     allow-presentation
 *     allow-popups-to-escape-sandbox
 *   "
 * />
 * 
 * ⚠️ SECURITY WARNING: 
 * ยิ่งมี allow permissions มากเท่าไหร่ เสี่ยง XSS เท่านั้น
 * ควรตรวจสอบ MROI code ก่อนเพิ่ม permissions
 */

// ===================================================
// DIAGNOSTIC CHECKLIST
// ===================================================

export const DIAGNOSTIC_CHECKLIST = {
  step1: "ตรวจสอบ URL: http://10.2.113.35:4173/mroi สามารถเข้าได้หรือไม่",
  step2: "ตรวจสอบ Browser Console: มี error อะไร?",
  step3: "ตรวจสอบ Network tab: ส่ง request ไป MROI หรือไม่? Status code คือ?",
  step4: "ตรวจสอบ Response Headers: มี X-Frame-Options หรือไม่?",
  step5: "ตรวจสอบ CSP headers: Content-Security-Policy มี frame-ancestors หรือไม่?",
  step6: "ลอง curl: curl -I http://10.2.113.35:4173/mroi",
};

// ===================================================
// QUICK FIX SUMMARY
// ===================================================

export const QUICK_FIX = {
  cors_error: {
    message: "CORS Error: Server ห้าม iframe",
    fix: "ใช้ MroiRedirectPage.tsx แทน MroiEmbedPage.tsx",
    file: "frontend/src/pages/mroi/MroiRedirectPage.tsx",
  },
  timeout_error: {
    message: "Timeout: MROI server ไม่ respond",
    fix: "ตรวจสอบว่า MROI server running อยู่",
    command: "ping 10.2.113.35",
  },
  auth_error: {
    message: "401 Unauthorized ใน iframe",
    fix: "ส่ง token ผ่าน URL หรือ postMessage API",
    option: "หรือใช้ Redirect method",
  },
};

// ===================================================
// HOW TO SWITCH TO REDIRECT METHOD
// ===================================================

/**
 * ถ้า iframe ไม่ได้ผล:
 * 
 * 1. ไปที่ AppRoutes.tsx
 * 2. เปลี่ยน import:
 *    FROM: import { MroiEmbedPage, ... } from '../pages/mroi';
 *    TO:   import { MroiRedirectPage as MroiEmbedPage, ... } from '../pages/mroi';
 * 
 * 2. หรือสร้าง alias ใน index.ts ของ mroi folder:
 *    export { default as MroiEmbedPage } from './MroiRedirectPage';
 * 
 * 3. Save and test
 */

export default DIAGNOSTIC_CHECKLIST;
