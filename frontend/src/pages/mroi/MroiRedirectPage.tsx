/**
 * FALLBACK REDIRECT METHOD
 * 
 * ถ้าหากวิธี iframe ไม่ได้ผล (CORS Error, X-Frame-Options: DENY, etc.)
 * ให้ replace component MroiEmbedPage.tsx ด้วย component นี้
 * 
 * วิธีการใช้งาน:
 * 1. Copy code นี้ทั้งหมด
 * 2. Paste ลงใน MroiEmbedPage.tsx แทนที่ code เดิม
 * 3. Update route ใน AppRoutes.tsx (อาจไม่ต้อง เพราะยังใช้ชื่อ component เดียวกัน)
 */

import React from 'react';
import './MroiRedirectPage.css';

const MROI_EXTERNAL_URL = 'http://10.2.113.35:4173/mroi';

export const MroiEmbedPage: React.FC = () => {
  const handleRedirect = () => {
    window.location.href = MROI_EXTERNAL_URL;
  };

  const handleOpenNewTab = () => {
    window.open(MROI_EXTERNAL_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mroi-redirect-container">
      {/* Header */}
      <div className="mroi-redirect-header">
        <h1>🎥 MROI Dashboard</h1>
        <p>Multiple Region of Interest Management System</p>
      </div>

      {/* Content */}
      <div className="mroi-redirect-content">
        <div className="redirect-card">
          <div className="redirect-icon">🔗</div>
          
          <h2>MROI Dashboard</h2>
          <p className="description">
            MROI Dashboard ทำงานใน application ที่แยกต่างหาก
          </p>

          <div className="info-box">
            <p>
              <strong>URL:</strong>
            </p>
            <code className="url-display">{MROI_EXTERNAL_URL}</code>
          </div>

          {/* Action Buttons */}
          <div className="redirect-actions">
            <button className="btn btn-primary" onClick={handleRedirect}>
              ➜ ไปยัง MROI Dashboard
            </button>
            <button className="btn btn-secondary" onClick={handleOpenNewTab}>
              🗗 เปิดใน Tab ใหม่
            </button>
          </div>

          {/* Additional Info */}
          <div className="redirect-info">
            <p>
              💡 <strong>เคล็ดลับ:</strong> ใช้ "เปิดใน Tab ใหม่" เพื่อให้สามารถกลับมาที่ Report-Robot ได้
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MroiEmbedPage;
