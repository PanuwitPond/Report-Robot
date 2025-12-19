import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchIvCameras, createDevice, updateDevice, deleteDevice } from '@/services/mroi.service';
import { DeviceResponseDto, CreateDeviceDto, UpdateDeviceDto } from '@/types';
import './DevicesPage.css';

export const DevicesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateDeviceDto>({
        name: '',
        rtspUrl: '',
        description: '',
        location: '',
        status: undefined, // Only used in Edit mode
    });

    // ดึงข้อมูล devices
    const { data: devices = [], isLoading, error } = useQuery({
    queryKey: ['mroi-devices'],
    queryFn: () => fetchIvCameras('metthier'), // ระบุ schema เป็น metthier
    staleTime: 5 * 60 * 1000,
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
            setFormData({ name: '', rtspUrl: '', description: '', location: '', status: undefined });
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
            status: device.status as 'active' | 'inactive' | 'disconnected',
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', rtspUrl: '', description: '', location: '', status: undefined });
    };

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showForm) {
                handleCancel();
            }
        };

        if (showForm) {
            document.addEventListener('keydown', handleEscKey);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.body.style.overflow = 'unset';
        };
    }, [showForm]);

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
                <button 
                    className="btn-add" 
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', rtspUrl: '', description: '', location: '', status: undefined });
                        setShowForm(true);
                    }}
                >
                    ➕ Add Device
                </button>
            </div>

            {/* Modal Form */}
            {showForm && (
                <>
                    <div className="modal-overlay" onClick={() => handleCancel()} />
                    <div className="modal-container">
                        <form onSubmit={handleSubmit} className="devices-form modal-form">
                            <div className="modal-header">
                                <h2>{editingId ? '✏️ Edit Device' : '➕ Add New Device'}</h2>
                                <button
                                    type="button"
                                    className="btn-modal-close"
                                    onClick={handleCancel}
                                    aria-label="Close dialog"
                                >
                                    ✕
                                </button>
                            </div>

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

                        {editingId && (
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={(formData as UpdateDeviceDto).status || 'active'}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            status: e.target.value as 'active' | 'inactive' | 'disconnected',
                                        }))
                                    }
                                >
                                    <option value="active">🟢 Active</option>
                                    <option value="inactive">🔵 Inactive</option>
                                    <option value="disconnected">🔴 Disconnected</option>
                                </select>
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn-submit" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Saving...' : editingId ? '💾 Update' : '✨ Create'}
                            </button>
                            <button type="button" className="btn-cancel" onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                        </form>
                    </div>
                </>
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
                                <div className="device-title-section">
                                    <h3>{device.name}</h3>
                                    {device.isExternal && (
                                        <span className="badge-external" title="This device is managed externally">
                                            📌 Managed Externally
                                        </span>
                                    )}
                                </div>
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
                                <button 
                                    className="btn-edit" 
                                    onClick={() => handleEdit(device)}
                                    disabled={device.isExternal}
                                    title={device.isExternal ? 'Cannot edit external device' : 'Edit device'}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn-draw"
                                    onClick={() => navigate(`/mroi/editor/${device.id}`)}
                                    title="Draw ROI zones on this camera"
                                >
                                    🎨 Draw ROI
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => {
                                        if (confirm(`Delete device "${device.name}"?`)) {
                                            deleteMutation.mutate(device.id);
                                        }
                                    }}
                                    disabled={deleteMutation.isPending || device.isExternal}
                                    title={device.isExternal ? 'Cannot delete external device' : 'Delete device'}
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
