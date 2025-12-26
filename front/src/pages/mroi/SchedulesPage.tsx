import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSchedules, fetchDevices, createSchedule, updateSchedule, deleteSchedule } from '@/services/mroi.service';
import { ScheduleResponseDto, CreateScheduleDto, UpdateScheduleDto } from '@/types';
import './SchedulesPage.css';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const SchedulesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateScheduleDto>({
        name: '',
        deviceId: '',
        timeRange: { startTime: '09:00', endTime: '17:00' },
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        description: '',
    });

    // ดึงข้อมูล Schedules
    const { data: schedules = [], isLoading, error } = useQuery({
        queryKey: ['mroi-schedules'],
        queryFn: () => fetchSchedules(),
        staleTime: 5 * 60 * 1000,
    });

    // ดึงข้อมูล Devices สำหรับ dropdown
    const { data: devices = [] } = useQuery({
        queryKey: ['mroi-devices'],
        queryFn: () => fetchDevices(),
        staleTime: 5 * 60 * 1000,
    });

    // Create/Update mutation
    const mutation = useMutation({
        mutationFn: async () => {
            if (editingId) {
                return updateSchedule(editingId, formData as UpdateScheduleDto);
            } else {
                return createSchedule(formData as CreateScheduleDto);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mroi-schedules'] });
            setShowForm(false);
            setEditingId(null);
            setFormData({
                name: '',
                deviceId: '',
                timeRange: { startTime: '09:00', endTime: '17:00' },
                daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                description: '',
            });
            alert('✅ Schedule saved successfully!');
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
            alert(`❌ Error: ${errorMsg}`);
            console.error('Error saving schedule:', error);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mroi-schedules'] });
            alert('✅ Schedule deleted successfully!');
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
            alert(`❌ Error: ${errorMsg}`);
            console.error('Error deleting schedule:', error);
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'startTime' || name === 'endTime') {
            setFormData((prev) => ({
                ...prev,
                timeRange: { ...prev.timeRange, [name]: value },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleDayToggle = (day: string) => {
        setFormData((prev) => {
            const days = prev.daysOfWeek || [];
            if (days.includes(day)) {
                return { ...prev, daysOfWeek: days.filter((d) => d !== day) };
            } else {
                return { ...prev, daysOfWeek: [...days, day] };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.deviceId.trim()) {
            alert('⚠️ Please fill in required fields (Name and Device)');
            return;
        }
        if (!formData.daysOfWeek || formData.daysOfWeek.length === 0) {
            alert('⚠️ Please select at least one day');
            return;
        }
        mutation.mutate();
    };

    const handleEdit = (schedule: ScheduleResponseDto) => {
        setEditingId(schedule.id);
        setFormData({
            name: schedule.name,
            deviceId: schedule.deviceId,
            timeRange: schedule.timeRange,
            daysOfWeek: schedule.daysOfWeek,
            description: schedule.description || '',
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            name: '',
            deviceId: '',
            timeRange: { startTime: '09:00', endTime: '17:00' },
            daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            description: '',
        });
    };

    // Get device name by ID
    const getDeviceName = (deviceId: string) => {
        const device = devices.find((d: any) => d.id === deviceId);
        return device?.name || deviceId.slice(0, 8) + '...';
    };

    if (isLoading) {
        return (
            <div className="schedules-container">
                <div className="loading">⏰ Loading schedules...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="schedules-container">
                <div className="error">
                    ❌ Error loading schedules: {(error as Error).message}
                </div>
            </div>
        );
    }

    return (
        <div className="schedules-container">
            <div className="schedules-header">
                <h1>⏱️ Schedule Management</h1>
                <button className="btn-add" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Cancel' : '+ Add Schedule'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="schedules-form-wrapper">
                    <form onSubmit={handleSubmit} className="schedules-form">
                        <h2>{editingId ? 'Edit Schedule' : 'Add New Schedule'}</h2>

                        <div className="form-group">
                            <label>Schedule Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Business Hours Monitoring"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Device *</label>
                            <select
                                name="deviceId"
                                value={formData.deviceId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select a device...</option>
                                {devices.map((device: any) => (
                                    <option key={device.id} value={device.id}>
                                        {device.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Time *</label>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={formData.timeRange.startTime}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>End Time *</label>
                                <input
                                    type="time"
                                    name="endTime"
                                    value={formData.timeRange.endTime}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Days of Week *</label>
                            <div className="days-selector">
                                {DAYS_OF_WEEK.map((day) => (
                                    <button
                                        key={day}
                                        type="button"
                                        className={`day-btn ${(formData.daysOfWeek || []).includes(day) ? 'selected' : ''}`}
                                        onClick={() => handleDayToggle(day)}
                                    >
                                        {day.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleInputChange}
                                placeholder="Schedule description..."
                                rows={3}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-submit" disabled={mutation.isPending}>
                                {mutation.isPending ? '⏳ Saving...' : '💾 Save Schedule'}
                            </button>
                            <button type="button" className="btn-cancel" onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Schedules List */}
            <div className="schedules-list">
                {(schedules as any[]).length === 0 ? (
                    <div className="empty-state">
                        <p>⏰ No schedules yet. Create your first schedule!</p>
                    </div>
                ) : (
                    (schedules as any[]).map((schedule: ScheduleResponseDto) => (
                        <div key={schedule.id} className="schedule-card">
                            <div className="schedule-header">
                                <div>
                                    <h3>{schedule.name}</h3>
                                    <div className="schedule-time">
                                        🕐 {schedule.timeRange.startTime} - {schedule.timeRange.endTime}
                                    </div>
                                </div>
                                <span className={`status ${schedule.isActive ? 'active' : 'inactive'}`}>
                                    {schedule.isActive ? '✓ Active' : '✕ Inactive'}
                                </span>
                            </div>

                            <div className="schedule-details">
                                <p>
                                    <strong>Device:</strong> {getDeviceName(schedule.deviceId)}
                                </p>
                                <p>
                                    <strong>Days:</strong>{' '}
                                    <span className="days-badge">
                                        {schedule.daysOfWeek.map((d) => d.slice(0, 3)).join(', ')}
                                    </span>
                                </p>
                                {schedule.description && (
                                    <p>
                                        <strong>Description:</strong> {schedule.description}
                                    </p>
                                )}
                                <p className="timestamp">
                                    Created: {new Date(schedule.createdAt).toLocaleString()}
                                </p>
                            </div>

                            <div className="schedule-actions">
                                <button className="btn-edit" onClick={() => handleEdit(schedule)}>
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => {
                                        if (confirm(`Delete schedule "${schedule.name}"?`)) {
                                            deleteMutation.mutate(schedule.id);
                                        }
                                    }}
                                    disabled={deleteMutation.isPending}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SchedulesPage;
