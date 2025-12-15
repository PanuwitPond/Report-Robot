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
            color: '#667eea',
        },
        {
            label: 'Active Devices',
            value: activeDevices,
            icon: '✅',
            color: '#4ade80',
        },
        {
            label: 'Total ROIs',
            value: (rois as any[]).length,
            icon: '🎯',
            color: '#f97316',
        },
        {
            label: 'Active ROIs',
            value: activeRois,
            icon: '⚡',
            color: '#ec4899',
        },
        {
            label: 'Schedules',
            value: (schedules as any[]).length,
            icon: '⏰',
            color: '#06b6d4',
        },
        {
            label: 'Active Schedules',
            value: activeSchedules,
            icon: '▶️',
            color: '#8b5cf6',
        },
    ];

    return (
        <div className="mroi-dashboard">
            <div className="dashboard-header">
                <h1>🎥 MROI Dashboard</h1>
                <p className="subtitle">Multiple Region of Interest Management System</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, idx) => (
                    <div key={idx} className="stat-card" style={{ borderLeftColor: stat.color }}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-content">
                            <div className="stat-label">{stat.label}</div>
                            <div className="stat-value">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="dashboard-tabs">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </button>
                <button
                    className={`tab-btn ${activeTab === 'devices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('devices')}
                >
                    📹 Devices ({devices.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'rois' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rois')}
                >
                    🎯 ROIs ({(rois as any[]).length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'schedules' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schedules')}
                >
                    ⏰ Schedules ({(schedules as any[]).length})
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'overview' && (
                    <div className="overview-content">
                        <div className="info-card">
                            <h3>📹 Device Management</h3>
                            <p>Manage your RTSP cameras and create ROI zones for each device.</p>
                            <p className="stats-text">
                                <strong>{devices.length}</strong> cameras • <strong>{activeDevices}</strong> active
                            </p>
                        </div>

                        <div className="info-card">
                            <h3>🎯 ROI Detection</h3>
                            <p>
                                Create multiple types of regions of interest:
                                <br />
                                • Intrusion detection zones
                                <br />
                                • Tripwire lines
                                <br />
                                • Density monitoring areas
                                <br />
                                • Zoom regions
                            </p>
                            <p className="stats-text">
                                <strong>{(rois as any[]).length}</strong> total • <strong>{activeRois}</strong> active
                            </p>
                        </div>

                        <div className="info-card">
                            <h3>⏰ Scheduling</h3>
                            <p>Define time-based schedules to enable/disable ROIs or trigger actions automatically.</p>
                            <p className="stats-text">
                                <strong>{(schedules as any[]).length}</strong> schedules • <strong>{activeSchedules}</strong> active
                            </p>
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
