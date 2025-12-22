import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchIvCameras } from '@/services/mroi.service';
import './MroiDashboard.css';

export const MroiDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'devices'>('overview');

    // ดึงข้อมูล devices เท่านั้น
    const { data: devices = [], isLoading: devicesLoading } = useQuery({
        queryKey: ['mroi-devices'],
        queryFn: () => fetchIvCameras('metthier'), // ข้อมูลจาก iv_cameras
        staleTime: 5 * 60 * 1000,
    });

    const activeDevices = devices.filter((d) => d.status === 'active').length;

    const stats = [
        {
            label: 'Total Devices',
            value: devices.length,
            icon: '📹',
            color: '#6366f1',
            lightColor: '#eef2ff',
        },
        {
            label: 'Active Devices',
            value: activeDevices,
            icon: '✓',
            color: '#10b981',
            lightColor: '#f0fdf4',
        },
    ];

    return (
        <div className="mroi-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1 className="dashboard-title">MROI Dashboard</h1>
                    <p className="dashboard-subtitle">Multiple Region of Interest Management System</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, idx) => (
                    <div key={idx} className="stat-card" style={{ backgroundColor: stat.lightColor }}>
                        <div className="stat-icon-wrapper" style={{ color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">{stat.label}</div>
                            <div className="stat-value">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="dashboard-tabs-wrapper">
                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <span className="tab-icon">◻</span>
                        Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'devices' ? 'active' : ''}`}
                        onClick={() => setActiveTab('devices')}
                    >
                        <span className="tab-icon">📹</span>
                        Devices
                        <span className="tab-count">({devices.length})</span>
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content-wrapper">
                {activeTab === 'overview' && (
                    <div className="overview-content">
                        <div className="feature-card">
                            <div className="feature-header">
                                <div className="feature-icon" style={{ backgroundColor: '#eef2ff', color: '#6366f1' }}>
                                    📹
                                </div>
                                <h3>Device Management</h3>
                            </div>
                            <p className="feature-description">Manage your RTSP cameras and create ROI zones for each device with ease.</p>
                            <div className="feature-stats">
                                <span><strong>{devices.length}</strong> cameras</span>
                                <span className="separator">•</span>
                                <span><strong>{activeDevices}</strong> active</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'devices' && (
                    <div className="list-content">
                        <h3>📹 Devices</h3>
                        {devicesLoading ? (
                            <p className="loading">Loading devices...</p>
                        ) : devices.length === 0 ? (
                            <p className="empty">No devices configured yet</p>
                        ) : (
                            <div className="list">
                                {devices.map((device) => (
                                    <div key={device.id} className="list-item">
                                        <div className="item-main">
                                            <span className="item-name">{device.name}</span>
                                            <span className={`item-status ${device.status}`}>{device.status}</span>
                                        </div>
                                        <div className="item-meta">
                                            <span>{device.roiCount || 0} ROIs</span>
                                            <span>{device.scheduleCount || 0} schedules</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MroiDashboard;
