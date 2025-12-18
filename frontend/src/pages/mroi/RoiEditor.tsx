import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { fetchDeviceById, fetchDevices, updateIvRegionConfig, fetchIvRoiData } from '@/services/mroi.service';
import { 
    Rule, 
    RegionAIConfig, 
    CanvasState as MroiCanvasState, 
    Point,
    MROI_CONSTANTS,
    DEFAULT_RULE,
    MIN_POINTS_FOR_TYPE,
} from './types/mroi';
import { RuleList } from './components/RuleList';
import { SetupEditor } from './components/SetupEditor';
import { DrawingCanvas } from './components/DrawingCanvas';
import './RoiEditor.css';

export const RoiEditor: React.FC = () => {
    const { deviceId: routeDeviceId } = useParams();
    const navigate = useNavigate();
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(routeDeviceId || null);
    
    // ✅ NEW: Multiple rules support
    const [regionAIConfig, setRegionAIConfig] = useState<RegionAIConfig>({ rule: [] });
    const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
    const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
    
    // ✅ Canvas state for drawing
    const [canvasState, setCanvasState] = useState<MroiCanvasState>({
        enableDrawMode: false,
        currentPoints: [],
    });
    
    // ✅ UI state
    const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
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
    const generateSnapshot = async () => {
        if (!device?.rtspUrl) return;
        
        try {
            const response = await fetch(`/api/mroi/iv-cameras/snapshot?rtsp=${encodeURIComponent(device.rtspUrl)}`);
            if (response.ok) {
                const blob = await response.blob();
                console.log('✅ Snapshot blob received:', blob.size, 'bytes, type:', blob.type);
                const blobUrl = URL.createObjectURL(blob);
                console.log('✅ Blob URL created:', blobUrl);
                setSnapshotUrl(blobUrl);
            } else {
                // ใช้ error message ที่ user-friendly แทน technical details
                const errorData = await response.json().catch(() => ({}));
                
                let userMessage = 'Cannot load camera snapshot';
                if (response.status === 500) {
                    userMessage = 'Camera stream is temporarily unavailable';
                } else if (response.status === 400) {
                    userMessage = 'Invalid camera configuration';
                } else if (response.status === 504) {
                    userMessage = 'Camera connection timeout';
                }
                
                console.error('Snapshot error details:', errorData, userMessage);
            }
        } catch (err: any) {
            console.error('Snapshot error:', err);
        }
    };

    useEffect(() => {
        if (device?.rtspUrl) {
            generateSnapshot();
        }
    }, [device?.rtspUrl]);

    // ✅ Load saved ROI data when device is selected
    useEffect(() => {
        if (selectedDeviceId) {
            const loadSavedRoi = async () => {
                try {
                    console.log(`📥 Loading saved ROI for device: ${selectedDeviceId}`);
                    const data = await fetchIvRoiData(customer, selectedDeviceId);
                    
                    if (data?.rule && Array.isArray(data.rule)) {
                        console.log(`✅ Loaded ${data.rule.length} rules`);
                        setRegionAIConfig({ rule: data.rule });
                        
                        // Auto-select first rule
                        if (data.rule.length > 0) {
                            setSelectedRuleId(data.rule[0].roi_id);
                            setSelectedRule(data.rule[0]);
                        }
                    } else {
                        console.log('ℹ️ No saved ROI data found');
                        setRegionAIConfig({ rule: [] });
                    }
                } catch (error: any) {
                    console.error('❌ Failed to load ROI:', error);
                    const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
                    console.error(`Failed to load ROI: ${errorMsg}`);
                }
            };
            
            loadSavedRoi();
        }
    }, [selectedDeviceId, customer]);

    // ✅ NEW: Handler - Create new rule
    const handleCreateRule = (roi_type: string) => {
        const roiType = roi_type as Rule['roi_type'];
        if (regionAIConfig.rule.length >= MROI_CONSTANTS.MAX_RULES) {
            alert(`⚠️ Maximum ${MROI_CONSTANTS.MAX_RULES} rules allowed`);
            return;
        }

        const newRule: Rule = {
            roi_id: uuidv4(),
            name: `${roiType.toUpperCase()} Rule ${regionAIConfig.rule.length + 1}`,
            roi_type: roiType,
            points: [],
            roi_status: 'OFF',
            created_date: dayjs().format('DD/MM/YYYY'),
            created_by: 'METTHIER',
            schedule: roiType !== 'zoom' ? [DEFAULT_RULE.schedule![0]] : undefined,
        };

        setRegionAIConfig(prev => ({
            rule: [...prev.rule, newRule],
        }));
        
        setSelectedRuleId(newRule.roi_id);
        setSelectedRule(newRule);
        setCanvasState({ enableDrawMode: true, currentPoints: [] });
    };

    // ✅ NEW: Handler - Select rule
    const handleSelectRule = (roi_id: string) => {
        const rule = regionAIConfig.rule.find(r => r.roi_id === roi_id);
        setSelectedRuleId(roi_id);
        setSelectedRule(rule || null);
        setCanvasState({ enableDrawMode: false, currentPoints: [] });
    };

    // ✅ NEW: Handler - Save rule (to state)
    const handleSaveRule = (rule: Rule) => {
        const now = dayjs().format('DD/MM/YYYY HH:mm:ss');
        setRegionAIConfig(prev => ({
            rule: prev.rule.map(r => 
                r.roi_id === rule.roi_id 
                    ? { ...rule, updated_at: now }
                    : r
            ),
        }));
        setSelectedRule({ ...rule, updated_at: now });
    };

    // ✅ NEW: Handler - Delete rule
    const handleDeleteRule = (roi_id: string) => {
        setRegionAIConfig(prev => ({
            rule: prev.rule.filter(r => r.roi_id !== roi_id),
        }));
        
        if (selectedRuleId === roi_id) {
            setSelectedRuleId(null);
            setSelectedRule(null);
        }
    };

    // ✅ NEW: Handler - Toggle rule status
    const handleToggleStatus = (roi_id: string, status: 'ON' | 'OFF') => {
        setRegionAIConfig(prev => ({
            rule: prev.rule.map(r => 
                r.roi_id === roi_id 
                    ? { ...r, roi_status: status }
                    : r
            ),
        }));
        
        if (selectedRule?.roi_id === roi_id) {
            setSelectedRule({ ...selectedRule, roi_status: status });
        }
    };

    // ✅ NEW: Handler - Canvas click to add point
    const handleCanvasClick = (point: Point) => {
        if (!selectedRule) return;

        setCanvasState(prev => ({
            ...prev,
            currentPoints: [...prev.currentPoints, point],
        }));
    };

    // ✅ NEW: Handler - Clear canvas points
    const handleClearCanvasPoints = () => {
        setCanvasState(prev => ({
            ...prev,
            currentPoints: [],
        }));
    };

    // ✅ NEW: Handler - Apply all changes to database
    const handleApplyChanges = async () => {
        if (regionAIConfig.rule.length === 0) {
            alert('⚠️ Please create at least one rule');
            return;
        }

        if (!selectedDeviceId) {
            alert('⚠️ Please select a device first');
            return;
        }

        setIsSaving(true);
        try {
            // Validate all rules
            const invalidRules = regionAIConfig.rule.filter(rule => {
                const minPoints = MIN_POINTS_FOR_TYPE[rule.roi_type];
                return rule.points.length < minPoints;
            });

            if (invalidRules.length > 0) {
                alert(`⚠️ ${invalidRules.length} rule(s) have insufficient points:\n${
                    invalidRules.map(r => `- ${r.name}: ${r.points.length} points (min: ${MIN_POINTS_FOR_TYPE[r.roi_type]})`).join('\n')
                }`);
                return;
            }

            console.log('💾 Saving all rules:', regionAIConfig.rule.length);
            await updateIvRegionConfig(customer, selectedDeviceId, regionAIConfig.rule);
            
            // ✅ Verify: Fetch data to confirm save was successful
            console.log('🔍 Verifying saved data...');
            const verified = await fetchIvRoiData(customer, selectedDeviceId);
            
            if (verified?.rule?.length === regionAIConfig.rule.length) {
                console.log('✅ All rules verified and saved successfully');
                alert(`✅ All ${regionAIConfig.rule.length} rule(s) saved and verified successfully!`);
                navigate('/mroi');
            } else {
                const savedCount = verified?.rule?.length ?? 0;
                console.warn(`⚠️ Data verification failed: expected ${regionAIConfig.rule.length} rules, got ${savedCount}`);
                alert(`⚠️ Warning: Data saved but verification failed.\nExpected ${regionAIConfig.rule.length} rules, got ${savedCount}.\nPlease check the configuration.`);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
            console.error('❌ Error saving configuration:', error);
            alert(`❌ Error saving configuration: ${errorMsg}`);
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

            <div className="editor-content three-panel-layout">
                {/* ① Left Panel - Rule List */}
                <div className="panel panel-rules">
                    <div className="panel-header">
                        <div className="device-info">
                            <h3>📹 {device.name}</h3>
                            <small>{device.location || 'N/A'}</small>
                        </div>
                        <button
                            className="btn-change-device"
                            title="Change device"
                            onClick={() => setSelectedDeviceId(null)}
                        >
                            🔄
                        </button>
                    </div>
                    <RuleList
                        rules={regionAIConfig.rule}
                        selectedRuleId={selectedRuleId}
                        onSelectRule={handleSelectRule}
                        onCreateRule={handleCreateRule}
                        onDeleteRule={handleDeleteRule}
                        onToggleStatus={handleToggleStatus}
                        maxRules={MROI_CONSTANTS.MAX_RULES}
                    />
                </div>

                {/* ② Center Panel - Drawing Canvas */}
                <div className="panel panel-canvas">
                    <div className="panel-header">
                        <h3>🎨 Drawing Canvas</h3>
                    </div>
                    <DrawingCanvas
                        snapshotUrl={snapshotUrl}
                        rules={regionAIConfig.rule}
                        currentRule={selectedRule}
                        currentPoints={canvasState.currentPoints}
                        enableDrawMode={canvasState.enableDrawMode}
                        onCanvasClick={handleCanvasClick}
                        onClearPoints={handleClearCanvasPoints}
                    />
                </div>

                {/* ③ Right Panel - Details & Editor */}
                <div className="panel panel-editor">
                    <div className="panel-header">
                        <h3>📝 Details</h3>
                    </div>
                    {selectedRule ? (
                        <SetupEditor
                            selectedRule={selectedRule}
                            onSaveRule={handleSaveRule}
                            onDeleteRule={handleDeleteRule}
                        />
                    ) : (
                        <div className="empty-editor">
                            <p>👈 Select or create a rule to edit</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="action-bar">
                <button
                    className="btn-apply"
                    onClick={handleApplyChanges}
                    disabled={isSaving || regionAIConfig.rule.length === 0}
                >
                    {isSaving ? '💾 Saving...' : '✅ Apply Changes'}
                </button>
                <button className="btn-cancel" onClick={() => navigate('/mroi')}>
                    ✕ Cancel
                </button>
            </div>
        </div>
    );
};

export default RoiEditor;
