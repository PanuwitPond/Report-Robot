import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDevices, createDevice, updateDevice, deleteDevice } from '@/services/mroi.service';
import { DeviceResponseDto, CreateDeviceDto, UpdateDeviceDto } from '@/types';
import './DevicesPage.css';

export const DevicesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateDeviceDto>({
        name: '',
        rtspUrl: '',
        description: '',
        location: '',
    });

    // ดึงข้อมูล devices
    const { data: devices = [], isLoading, error } = useQuery({
        queryKey: ['mroi-devices'],
        queryFn: fetchDevices,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Create/Update mutation
    const mutation = useMutation({
        mutationFn: async () => {
            if (editingId) {
                return updateDevice(editingId, formData as UpdateDeviceDto);
            } else {
                return createDevice(formData as CreateDeviceDto);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mroi-devices'] });
            setShowForm(false);
            setEditingId(null);
            setFormData({ name: '', rtspUrl: '', description: '', location: '' });
        },
        onError: (error: any) => {
            alert(`Error: ${error.response?.data?.message || error.message}`);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteDevice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mroi-devices'] });
        },
        onError: (error: any) => {
            alert(`Error: ${error.response?.data?.message || error.message}`);
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.rtspUrl.trim()) {
            alert('Please fill in required fields');
            return;
        }
        mutation.mutate();
    };

    const handleEdit = (device: DeviceResponseDto) => {
        setEditingId(device.id);
        setFormData({
            name: device.name,
            rtspUrl: device.rtspUrl,
            description: device.description || '',
            location: device.location || '',
            cameraSettings: device.cameraSettings,
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', rtspUrl: '', description: '', location: '' });
    };

    if (isLoading) {
        return (
            <div className="devices-container">
                <div className="loading">Loading devices...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="devices-container">
                <div className="error">Error loading devices: {(error as Error).message}</div>
            </div>
        );
    }

    return (
        <div className="devices-container">
            <div className="devices-header">
                <h1>📹 MROI Devices Management</h1>
                <button className="btn-add" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Cancel' : '+ Add Device'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="devices-form-wrapper">
                    <form onSubmit={handleSubmit} className="devices-form">
                        <h2>{editingId ? 'Edit Device' : 'Add New Device'}</h2>

                        <div className="form-group">
                            <label>Device Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Front Door Camera"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>RTSP URL *</label>
                            <input
                                type="text"
                                name="rtspUrl"
                                value={formData.rtspUrl}
                                onChange={handleInputChange}
                                placeholder="e.g., rtsp://192.168.1.100:554/stream"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleInputChange}
                                placeholder="Device description..."
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label>Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location || ''}
                                onChange={handleInputChange}
                                placeholder="e.g., Building A, Floor 2"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-submit" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Saving...' : 'Save Device'}
                            </button>
                            <button type="button" className="btn-cancel" onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Devices List */}
            <div className="devices-list">
                {devices.length === 0 ? (
                    <div className="empty-state">
                        <p>🎥 No devices yet. Add your first RTSP camera!</p>
                    </div>
                ) : (
                    devices.map((device) => (
                        <div key={device.id} className="device-card">
                            <div className="device-header">
                                <h3>{device.name}</h3>
                                <span className={`status ${device.status}`}>{device.status}</span>
                            </div>

                            <div className="device-details">
                                <p>
                                    <strong>RTSP URL:</strong> <code>{device.rtspUrl}</code>
                                </p>
                                {device.description && (
                                    <p>
                                        <strong>Description:</strong> {device.description}
                                    </p>
                                )}
                                {device.location && (
                                    <p>
                                        <strong>Location:</strong> {device.location}
                                    </p>
                                )}
                                <p>
                                    <strong>ROIs:</strong> {device.roiCount || 0} | <strong>Schedules:</strong>{' '}
                                    {device.scheduleCount || 0}
                                </p>
                                <p className="timestamp">
                                    Created: {new Date(device.createdAt).toLocaleString()}
                                </p>
                            </div>

                            <div className="device-actions">
                                <button className="btn-edit" onClick={() => handleEdit(device)}>
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => {
                                        if (confirm(`Delete device "${device.name}"?`)) {
                                            deleteMutation.mutate(device.id);
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

export default DevicesPage;
