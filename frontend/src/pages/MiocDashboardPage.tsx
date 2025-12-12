import React from 'react';
// นำเข้า Component ที่ย้ายมา (สมมติชื่อ PageReport)
import PageReport from '../pages/mioc/PageReport'; 

const MiocDashboardPage = () => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            {/* แสดงผลหน้าจอ MIOC เดิมที่นี่ */}
            <PageReport />
        </div>
    );
};

export default MiocDashboardPage;