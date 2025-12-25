import { useState } from 'react';
import PageReport from './mioc/PageReport';
import PageTrueAlarm from './mioc/PageTrueAlarm';
import IncompleteIncident from './mioc/IncompleteIncident';
import './MiocDashboardPage.css';

const MiocDashboardPage = () => {
    const [activeTab, setActiveTab] = useState<'report' | 'true-alarm' | 'incomplete'>('report');

    const tabStyle = {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '0',
    };

    const buttonStyle = (isActive: boolean) => ({
        padding: '12px 20px',
        background: 'none',
        border: 'none',
        borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: isActive ? '600' : '400',
        color: isActive ? '#2563eb' : '#666',
        transition: 'all 0.3s',
    });

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>MIOC Management System</h1>
                <p>Manage Reports and Incidents</p>
            </div>

            {/* Tab Menu */}
            <div style={tabStyle}>
                <button
                    onClick={() => setActiveTab('report')}
                    style={buttonStyle(activeTab === 'report')}
                >
                    📄 Report Download
                </button>
                <button
                    onClick={() => setActiveTab('true-alarm')}
                    style={buttonStyle(activeTab === 'true-alarm')}
                >
                    ✅ True Alarm
                </button>
                <button
                    onClick={() => setActiveTab('incomplete')}
                    style={buttonStyle(activeTab === 'incomplete')}
                >
                    ⏳ Incomplete
                </button>
            </div>

            {/* Content */}
            <div className="page-content">
                {activeTab === 'report' && <PageReport />}
                {activeTab === 'true-alarm' && <PageTrueAlarm />}
                {activeTab === 'incomplete' && <IncompleteIncident />}
            </div>
        </div>
    );
};

export default MiocDashboardPage;