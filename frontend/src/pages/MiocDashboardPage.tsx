// นำเข้า Component ที่ย้ายมา (สมมติชื่อ PageReport)
import React from 'react';
import PageReport from './mioc/PageReport'; 
import './MiocDashboardPage.css'; // นำเข้าคลาส CSS

const MiocDashboardPage = () => {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1>MIOC</h1>
                <p>Download Reports</p>
            </div>
            
            <div className="page-content">
                <PageReport />
            </div>
        </div>
    );
};

export default MiocDashboardPage;