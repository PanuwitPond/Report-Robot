import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDeviceById, fetchDevices, updateIvRegionConfig } from '@/services/mroi.service';
import './RoiEditor.css';

interface CanvasState {
    isDrawing: boolean;
    points: Array<{ x: number; y: number }>;
    roiType: 'intrusion' | 'tripwire' | 'density' | 'zoom';
}

export const RoiEditor: React.FC = () => {
    const { deviceId: routeDeviceId } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(routeDeviceId || null);
    const [canvasState, setCanvasState] = useState<CanvasState>({
        isDrawing: false,
        points: [],
        roiType: 'intrusion',
    });
    const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
    const [snapshotError, setSnapshotError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const customer = 'metthier';

    // ดึง devices ทั้งหมด เพื่อให้ user เลือก
    const { data: allDevices = [], isLoading: devicesLoading } = useQuery({
        queryKey: ['mroi-devices-all'],
        queryFn: () => fetchDevices(),
        staleTime: 5 * 60 * 1000,
    });

    // ดึงข้อมูล device ที่เลือก (ถ้าเลือกแล้ว)
    const { data: device, isLoading: deviceLoading, error: deviceError } = useQuery({
        queryKey: ['mroi-device', selectedDeviceId],
        queryFn: () => (selectedDeviceId ? fetchDeviceById(selectedDeviceId) : Promise.reject('No device selected')),
        enabled: !!selectedDeviceId,
    });

    // ดึง snapshot เมื่อ device เปลี่ยน
    useEffect(() => {
        if (device?.rtspUrl) {
            const generateSnapshot = async () => {
                try {
                    setSnapshotError(null);
                    const response = await fetch(`/api/mroi/iv-cameras/snapshot?rtsp=${encodeURIComponent(device.rtspUrl)}`);
                    if (response.ok) {
                        const blob = await response.blob();
                        console.log('✅ Snapshot blob received:', blob.size, 'bytes, type:', blob.type);
                        const blobUrl = URL.createObjectURL(blob);
                        console.log('✅ Blob URL created:', blobUrl);
                        setSnapshotUrl(blobUrl);
                    } else {
                        // Parse error details from response
                        let errorMsg = `Failed to capture snapshot (Status: ${response.status})`;
                        try {
                            const errorData = await response.json();
                            errorMsg = errorData.error || errorMsg;
                            if (errorData.details) {
                                errorMsg += ` - ${errorData.details}`;
                            }
                            if (errorData.suggestion) {
                                errorMsg += `\n💡 ${errorData.suggestion}`;
                            }
                        } catch (e) {
                            // Response is not JSON, use default message
                        }
                        setSnapshotError(errorMsg);
                    }
                } catch (err: any) {
                    setSnapshotError(`Error capturing snapshot: ${err.message}`);
                    console.error('Snapshot error:', err);
                }
            };

            generateSnapshot();
        }
    }, [device?.rtspUrl]);

    // Redraw canvas เมื่อ points หรือ snapshot เปลี่ยน
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !snapshotUrl) return;

        const img = new Image();
        img.onload = () => {
            console.log('✅ Snapshot image loaded:', img.width, 'x', img.height);
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // ✅ Draw the image first
                ctx.drawImage(img, 0, 0);
                
                // Draw points
                canvasState.points.forEach((point) => {
                    ctx.fillStyle = '#ff4444';
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                    ctx.fill();
                });

                // Draw lines between points
                if (canvasState.points.length > 1) {
                    ctx.strokeStyle = '#ff4444';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(canvasState.points[0].x, canvasState.points[0].y);
                    for (let i = 1; i < canvasState.points.length; i++) {
                        ctx.lineTo(canvasState.points[i].x, canvasState.points[i].y);
                    }
                    ctx.stroke();
                }
            }
        };
        img.onerror = (error) => {
            console.error('❌ Failed to load snapshot image:', error);
            setSnapshotError('Failed to load snapshot image');
        };
        console.log('Loading snapshot from:', snapshotUrl);
        img.src = snapshotUrl;
    }, [snapshotUrl, canvasState.points]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!snapshotUrl) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setCanvasState((prev) => ({
            ...prev,
            points: [...prev.points, { x, y }],
        }));
    };

    const handleCanvasClear = () => {
        setCanvasState((prev) => ({
            ...prev,
            points: [],
        }));
    };

    const handleUndo = () => {
        setCanvasState((prev) => ({
            ...prev,
            points: prev.points.slice(0, -1),
        }));
    };

    const handleSave = async () => {
        if (canvasState.points.length === 0) {
            alert('⚠️ Please draw at least one region');
            return;
        }

        if (!selectedDeviceId) {
            alert('⚠️ Please select a device first');
            return;
        }

        setIsSaving(true);
        try {
            const config = {
                rule: [
                    {
                        name: `${canvasState.roiType.toUpperCase()} Zone`,
                        type: canvasState.roiType,
                        points: canvasState.points,
                        timestamp: new Date().toISOString(),
                    },
                ],
            };

            await updateIvRegionConfig(customer, selectedDeviceId, config.rule);
            alert('✅ ROI configuration saved successfully!');
            navigate('/mroi');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
            alert(`❌ Error saving configuration: ${errorMsg}`);
            console.error('Error saving configuration:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (deviceLoading) {
        return (
            <div className="roi-editor-container">
                <div className="loading">🔄 Loading device information...</div>
            </div>
        );
    }

    if (deviceError || (!device && selectedDeviceId && !devicesLoading)) {
        return (
            <div className="roi-editor-container">
                <div className="error">
                    ❌ Error loading device: {deviceError?.toString() || 'Device not found'}
                </div>
            </div>
        );
    }

    // ถ้ายังไม่เลือก device ให้แสดง selector
    if (!selectedDeviceId || !device) {
        return (
            <div className="roi-editor-container">
                <div className="editor-header">
                    <h1>✏️ ROI Drawing Editor</h1>
                    <button className="btn-back" onClick={() => navigate('/mroi')}>
                        ← Back to Dashboard
                    </button>
                </div>

                <div className="device-selector-wrapper">
                    <div className="device-selector-card">
                        <h2>📹 Select a Camera</h2>
                        <p className="selector-subtitle">Choose a camera to start drawing ROI regions</p>

                        {devicesLoading ? (
                            <div className="loading-inline">Loading devices...</div>
                        ) : (
                            <div className="devices-grid">
                                {allDevices.length === 0 ? (
                                    <div className="empty-inline">
                                        No devices available. Please add a device first.
                                    </div>
                                ) : (
                                    allDevices.map((dev: any) => (
                                        <button
                                            key={dev.id}
                                            className="device-selector-btn"
                                            onClick={() => setSelectedDeviceId(dev.id)}
                                        >
                                            <div className="device-selector-icon">📹</div>
                                            <div className="device-selector-name">{dev.name}</div>
                                            <div className="device-selector-location">{dev.location || 'N/A'}</div>
                                            <div className={`device-selector-status ${dev.status}`}>{dev.status}</div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="roi-editor-container">
            <div className="editor-header">
                <h1>✏️ ROI Drawing Editor</h1>
                <button className="btn-back" onClick={() => navigate('/mroi')}>
                    ← Back to Dashboard
                </button>
            </div>

            <div className="editor-content">
                <div className="editor-sidebar">
                    <div className="info-panel">
                        <h3>📹 Camera Information</h3>
                        <div className="info-item">
                            <label>Camera Name:</label>
                            <p>{device.name}</p>
                        </div>
                        <div className="info-item">
                            <label>Location:</label>
                            <p>{device.location || 'N/A'}</p>
                        </div>
                        <div className="info-item">
                            <label>Status:</label>
                            <p className={`status ${device.status}`}>{device.status}</p>
                        </div>
                        <button
                            className="btn-change-device"
                            onClick={() => setSelectedDeviceId(null)}
                        >
                            🔄 Change Device
                        </button>
                    </div>

                    <div className="control-panel">
                        <h3>⚙️ ROI Settings</h3>

                        <div className="control-group">
                            <label>ROI Type</label>
                            <select
                                value={canvasState.roiType}
                                onChange={(e) =>
                                    setCanvasState((prev) => ({
                                        ...prev,
                                        roiType: e.target.value as any,
                                    }))
                                }
                            >
                                <option value="intrusion">🚨 Intrusion Detection</option>
                                <option value="tripwire">📏 Tripwire Line</option>
                                <option value="density">🔥 Density Monitoring</option>
                                <option value="zoom">🔍 Zoom Region</option>
                            </select>
                        </div>

                        <div className="control-group">
                            <label>Drawing Tools</label>
                            <div className="tool-buttons">
                                <button className="tool-btn undo-btn" onClick={handleUndo}>
                                    ↶ Undo
                                </button>
                                <button className="tool-btn clear-btn" onClick={handleCanvasClear}>
                                    🗑️ Clear
                                </button>
                            </div>
                        </div>

                        <div className="control-group">
                            <label>Points: {canvasState.points.length}</label>
                            {canvasState.points.length > 0 && (
                                <div className="points-list">
                                    {canvasState.points.map((point, idx) => (
                                        <div key={idx} className="point-item">
                                            P{idx + 1}: ({Math.round(point.x)}, {Math.round(point.y)})
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="action-panel">
                        <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? '💾 Saving...' : '✅ Save Configuration'}
                        </button>
                        <button className="btn-cancel" onClick={() => navigate('/mroi')}>
                            ✕ Cancel
                        </button>
                    </div>
                </div>

                <div className="canvas-container">
                    {snapshotError && (
                        <div className="snapshot-error">
                            ⚠️ {snapshotError}
                        </div>
                    )}
                    {snapshotUrl ? (
                        <div className="canvas-wrapper">
                            <img
                                src={snapshotUrl}
                                alt="Camera Snapshot"
                                className="snapshot-image"
                                style={{ display: 'none' }}
                            />
                            <canvas
                                ref={canvasRef}
                                className="drawing-canvas"
                                onClick={handleCanvasClick}
                            />
                            <div className="canvas-hint">
                                📌 Click on the image to add points. Draw the region you want to monitor.
                            </div>
                        </div>
                    ) : (
                        <div className="canvas-loading">
                            📸 Loading camera snapshot... Please wait
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoiEditor;
