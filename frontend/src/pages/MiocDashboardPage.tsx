// นำเข้า Component ที่ย้ายมา (สมมติชื่อ PageReport)
import React from 'react';
import PageReport from '../pages/mioc/PageReport'; 

const MiocDashboardPage = () => {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Mioc</h1>
                <p>Downlode Reports</p>
                <div style={{ width: '100%', height: '100%' }}>
                    <PageReport />
                </div>
            </div>
        </div>
    );
};

export default MiocDashboardPage;