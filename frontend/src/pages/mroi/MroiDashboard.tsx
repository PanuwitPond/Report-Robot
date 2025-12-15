import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDevices, fetchRois, fetchSchedules } from '@/services/mroi.service';
import './MroiDashboard.css';

export const MroiDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'rois' | 'schedules'>('overview');

    // ดึงข้อมูล
    const { data: devices = [], isLoading: devicesLoading } = useQuery({
        queryKey: ['mroi-devices'],
        queryFn: fetchDevices,
        staleTime: 5 * 60 * 1000,
    });

    const { data: rois = [], isLoading: roisLoading } = useQuery({
        queryKey: ['mroi-rois'],
        queryFn: () => fetchRois(),
        staleTime: 5 * 60 * 1000,
    });

    const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
        queryKey: ['mroi-schedules'],
        queryFn: () => fetchSchedules(),
        staleTime: 5 * 60 * 1000,
    });

    const activeDevices = devices.filter((d) => d.status === 'active').length;
    const activeRois = (rois as any[]).filter((r: any) => r.isActive).length;
    const activeSchedules = (schedules as any[]).filter((s: any) => s.isActive).length;

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
        {
            label: 'Total ROIs',
            value: (rois as any[]).length,
            icon: '◉',
            color: '#f59e0b',
            lightColor: '#fffbf0',
        },
        {
            label: 'Active ROIs',
            value: activeRois,
            icon: '⚡',
            color: '#ec4899',
            lightColor: '#fdf2f8',
        },
        {
            label: 'Schedules',
            value: (schedules as any[]).length,
            icon: '⏱',
            color: '#0891b2',
            lightColor: '#f0f9fa',
        },
        {
            label: 'Active Schedules',
            value: activeSchedules,
            icon: '▶',
            color: '#8b5cf6',
            lightColor: '#faf5ff',
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
                    <button
                        className={`tab-btn ${activeTab === 'rois' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rois')}
                    >
                        <span className="tab-icon">◉</span>
                        ROIs
                        <span className="tab-count">({(rois as any[]).length})</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'schedules' ? 'active' : ''}`}
                        onClick={() => setActiveTab('schedules')}
                    >
                        <span className="tab-icon">⏱</span>
                        Schedules
                        <span className="tab-count">({(schedules as any[]).length})</span>
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

                        <div className="feature-card">
                            <div className="feature-header">
                                <div className="feature-icon" style={{ backgroundColor: '#fffbf0', color: '#f59e0b' }}>
                                    ◉
                                </div>
                                <h3>ROI Detection</h3>
                            </div>
                            <p className="feature-description">Create multiple types of regions of interest for comprehensive monitoring:</p>
                            <ul className="feature-list">
                                <li>Intrusion detection zones</li>
                                <li>Tripwire lines</li>
                                <li>Density monitoring areas</li>
                                <li>Zoom regions</li>
                            </ul>
                            <div className="feature-stats">
                                <span><strong>{(rois as any[]).length}</strong> total</span>
                                <span className="separator">•</span>
                                <span><strong>{activeRois}</strong> active</span>
                            </div>
                        </div>

                        <div className="feature-card">
                            <div className="feature-header">
                                <div className="feature-icon" style={{ backgroundColor: '#f0f9fa', color: '#0891b2' }}>
                                    ⏱
                                </div>
                                <h3>Scheduling</h3>
                            </div>
                            <p className="feature-description">Define time-based schedules to enable/disable ROIs or trigger actions automatically.</p>
                            <div className="feature-stats">
                                <span><strong>{(schedules as any[]).length}</strong> schedules</span>
                                <span className="separator">•</span>
                                <span><strong>{activeSchedules}</strong> active</span>
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

                {activeTab === 'rois' && (
                    <div className="list-content">
                        <h3>🎯 Regions of Interest</h3>
                        {roisLoading ? (
                            <p className="loading">Loading ROIs...</p>
                        ) : (rois as any[]).length === 0 ? (
                            <p className="empty">No ROIs created yet</p>
                        ) : (
                            <div className="list">
                                {(rois as any[]).map((roi: any) => (
                                    <div key={roi.id} className="list-item">
                                        <div className="item-main">
                                            <span className="item-name">{roi.name}</span>
                                            <span className="item-badge">{roi.type}</span>
                                            <span className={`item-status ${roi.isActive ? 'active' : 'inactive'}`}>
                                                {roi.isActive ? '✓ Active' : '✕ Inactive'}
                                            </span>
                                        </div>
                                        <div className="item-meta">
                                            <span>Device: {roi.deviceId.slice(0, 8)}...</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'schedules' && (
                    <div className="list-content">
                        <h3>⏰ Schedules</h3>
                        {schedulesLoading ? (
                            <p className="loading">Loading schedules...</p>
                        ) : (schedules as any[]).length === 0 ? (
                            <p className="empty">No schedules created yet</p>
                        ) : (
                            <div className="list">
                                {(schedules as any[]).map((schedule: any) => (
                                    <div key={schedule.id} className="list-item">
                                        <div className="item-main">
                                            <span className="item-name">{schedule.name}</span>
                                            <span className={`item-status ${schedule.isActive ? 'active' : 'inactive'}`}>
                                                {schedule.isActive ? '✓ Active' : '✕ Inactive'}
                                            </span>
                                        </div>
                                        <div className="item-meta">
                                            <span>
                                                {schedule.timeRange.startTime} - {schedule.timeRange.endTime}
                                            </span>
                                            <span>{schedule.daysOfWeek.join(', ')}</span>
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
