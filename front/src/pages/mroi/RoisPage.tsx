import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRois, fetchDevices, createRoi, updateRoi, deleteRoi } from '@/services/mroi.service';
import { RoiResponseDto, CreateRoiDto, UpdateRoiDto } from '@/types';
import './RoisPage.css';

export const RoisPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateRoiDto>({
        name: '',
        type: 'intrusion',
        deviceId: '',
        coordinates: { points: [] },
        description: '',
    });

    // ดึงข้อมูล ROIs
    const { data: rois = [], isLoading, error } = useQuery({
        queryKey: ['mroi-rois'],
        queryFn: () => fetchRois(),
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
                return updateRoi(editingId, formData as UpdateRoiDto);
            } else {
                return createRoi(formData as CreateRoiDto);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mroi-rois'] });
            setShowForm(false);
            setEditingId(null);
            setFormData({
                name: '',
                type: 'intrusion',
                deviceId: '',
                coordinates: { points: [] },
                description: '',
            });
            alert('✅ ROI saved successfully!');
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
            alert(`❌ Error: ${errorMsg}`);
            console.error('Error saving ROI:', error);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteRoi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mroi-rois'] });
            alert('✅ ROI deleted successfully!');
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
            alert(`❌ Error: ${errorMsg}`);
            console.error('Error deleting ROI:', error);
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.deviceId.trim()) {
            alert('⚠️ Please fill in required fields (Name and Device)');
            return;
        }
        mutation.mutate();
    };

    const handleEdit = (roi: RoiResponseDto) => {
        setEditingId(roi.id);
        setFormData({
            name: roi.name,
            type: roi.type,
            deviceId: roi.deviceId,
            coordinates: roi.coordinates,
            description: roi.description || '',
            settings: roi.settings,
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            name: '',
            type: 'intrusion',
            deviceId: '',
            coordinates: { points: [] },
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
            <div className="rois-container">
                <div className="loading">📊 Loading ROIs...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rois-container">
                <div className="error">
                    ❌ Error loading ROIs: {(error as Error).message}
                </div>
            </div>
        );
    }

    return (
        <div className="rois-container">
            <div className="rois-header">
                <h1>🎯 Regions of Interest Management</h1>
                <button className="btn-add" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Cancel' : '+ Add ROI'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="rois-form-wrapper">
                    <form onSubmit={handleSubmit} className="rois-form">
                        <h2>{editingId ? 'Edit ROI' : 'Add New ROI'}</h2>

                        <div className="form-group">
                            <label>ROI Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Front Door Intrusion Zone"
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

                        <div className="form-group">
                            <label>ROI Type *</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="intrusion">🚨 Intrusion Detection</option>
                                <option value="tripwire">📏 Tripwire Line</option>
                                <option value="density">🔥 Density Monitoring</option>
                                <option value="zoom">🔍 Zoom Region</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleInputChange}
                                placeholder="ROI description..."
                                rows={3}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-submit" disabled={mutation.isPending}>
                                {mutation.isPending ? '⏳ Saving...' : '💾 Save ROI'}
                            </button>
                            <button type="button" className="btn-cancel" onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ROIs List */}
            <div className="rois-list">
                {(rois as any[]).length === 0 ? (
                    <div className="empty-state">
                        <p>🎯 No ROIs yet. Create your first region of interest!</p>
                    </div>
                ) : (
                    (rois as any[]).map((roi: RoiResponseDto) => (
                        <div key={roi.id} className="roi-card">
                            <div className="roi-header">
                                <div>
                                    <h3>{roi.name}</h3>
                                    <span className="roi-type">
                                        {roi.type === 'intrusion' && '🚨'}
                                        {roi.type === 'tripwire' && '📏'}
                                        {roi.type === 'density' && '🔥'}
                                        {roi.type === 'zoom' && '🔍'}
                                        {' ' + roi.type.charAt(0).toUpperCase() + roi.type.slice(1)}
                                    </span>
                                </div>
                                <span className={`status ${roi.isActive ? 'active' : 'inactive'}`}>
                                    {roi.isActive ? '✓ Active' : '✕ Inactive'}
                                </span>
                            </div>

                            <div className="roi-details">
                                <p>
                                    <strong>Device:</strong> {getDeviceName(roi.deviceId)}
                                </p>
                                {roi.description && (
                                    <p>
                                        <strong>Description:</strong> {roi.description}
                                    </p>
                                )}
                                <p>
                                    <strong>Points:</strong> {roi.coordinates?.points?.length || 0} points
                                </p>
                                <p className="timestamp">
                                    Created: {new Date(roi.createdAt).toLocaleString()}
                                </p>
                            </div>

                            <div className="roi-actions">
                                <button className="btn-edit" onClick={() => handleEdit(roi)}>
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => {
                                        if (confirm(`Delete ROI "${roi.name}"?`)) {
                                            deleteMutation.mutate(roi.id);
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

export default RoisPage;
