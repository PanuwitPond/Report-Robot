import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Rule, SetupEditorProps, ROI_TYPE_COLORS, MROI_CONSTANTS } from '../types/mroi';
import { ScheduleControls } from './ScheduleControls';
import { useAuth } from '@/contexts';
import './SetupEditor.css';

/**
 * 📝 SetupEditor Component
 * ③ Details panel for editing selected rule
 * - Edit rule name
 * - Change rule type (with side effects)
 * - Schedule controls (non-zoom only)
 * - Display audit info (read-only)
 * - Save/Delete buttons
 */
export const SetupEditor: React.FC<SetupEditorProps> = ({
    selectedRule,
    onSaveRule,
    // onDeleteRule,  // ✅ Not used in Option B - delete handled in parent
}) => {
    const { user } = useAuth();
    const [editingRule, setEditingRule] = useState<Rule | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState<'edit' | 'schedule' | 'audit'>('edit');
    
    // ✅ Option B: Save individual rule state
    const [isSavingRule, setIsSavingRule] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

    // Sync with selectedRule
    useEffect(() => {
        setEditingRule(selectedRule);
        setHasChanges(false);
    }, [selectedRule]);

    if (!selectedRule || !editingRule) {
        return (
            <div className="setup-editor empty">
                <p>👈 Select a rule to edit</p>
            </div>
        );
    }

    const handleNameChange = (value: string) => {
        const updated = { ...editingRule, name: value };
        setEditingRule(updated);
        setHasChanges(true);
        // ✅ Fix #2b: Don't auto-save - wait for Apply Changes button
        // Changes will be saved when parent calls handleApplyChanges
    };

    const handleRuleTypeChange = (newType: Rule['roi_type']) => {
        const updated: Rule = {
            ...editingRule,
            roi_type: newType,
            roi_status: newType === 'zoom' ? undefined : (editingRule.roi_status || 'OFF'),
        };

        // Handle schedule based on type change
        if (newType === 'zoom') {
            // Save existing schedule in case user changes back
            delete updated.schedule;
            updated.surveillance_id = updated.surveillance_id || `zoom_${Date.now()}`;
        } else {
            // Non-zoom: ensure schedule exists
            if (!updated.schedule || updated.schedule.length === 0) {
                updated.schedule = [
                    {
                        surveillance_id: '',
                        ai_type: 'motion',
                        start_time: '00:00:00',
                        end_time: '23:59:59',
                        direction: 'Both',
                        confidence_threshold: 0.7,
                        confidence_zoom: 0.7,
                        duration_threshold_seconds: 5,
                    },
                ];
            }
            delete updated.surveillance_id;
        }

        setEditingRule(updated);
        setHasChanges(true);
        // ✅ Fix #2a: Don't auto-save - wait for Apply Changes button
        // Changes will be saved when parent calls handleApplyChanges
    };

    const handleScheduleChange = (schedule: any) => {
        if (editingRule.schedule && editingRule.schedule.length > 0) {
            const updated = {
                ...editingRule,
                schedule: [schedule],
            };
            setEditingRule(updated);
            setHasChanges(true);
            // ✅ Note: Don't call onSaveRule - wait for Apply Changes button
        }
    };

    /**
     * ✅ Option B: Validate rule data before saving
     * Checks for:
     * - Empty rule name
     * - Name length
     * - Valid rule type
     * - Schedule for non-zoom rules
     * - ROI ID exists
     */
    const validateRule = (rule: Rule | null): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];
        
        if (!rule) {
            errors.push('❌ Rule object is null');
            return { valid: false, errors };
        }
        
        // Check 1: Required fields
        if (!rule.name || !rule.name.trim()) {
            errors.push('Rule name cannot be empty');
        }
        
        // Check 2: Name length
        if (rule.name && rule.name.length > 50) {
            errors.push('Rule name too long (max 50 characters)');
        }
        
        // Check 3: Type is valid
        const validTypes = ['intrusion', 'tripwire', 'density', 'zoom', 'health'];
        if (!validTypes.includes(rule.roi_type)) {
            errors.push('Invalid rule type');
        }
        
        // Check 4: Schedule (if not zoom)
        if (rule.roi_type !== 'zoom') {
            if (!rule.schedule || rule.schedule.length === 0) {
                errors.push('Schedule required for non-zoom rules');
            }
        }
        
        // Check 5: ROI ID exists
        if (!rule.roi_id) {
            errors.push('Rule ID missing');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    };

    /**
     * ✅ Option B: Save individual rule to parent
     * Validates data first, then calls onSaveRule callback
     * Shows feedback to user about success/error
     */
    const handleSaveRule = async () => {
        if (!editingRule) {
            setSaveError('No rule selected');
            return;
        }

        // Step 1: Validate
        const validation = validateRule(editingRule);
        if (!validation.valid) {
            const errorMsg = validation.errors.join('\n');
            console.warn('❌ Validation failed:', errorMsg);
            setSaveError(errorMsg);
            return;  // ← Stop here, don't proceed
        }

        // Step 2: Set saving state
        setIsSavingRule(true);
        setSaveError(null);
        
        try {
            // Step 3: Call parent to save to regionAIConfig
            console.group('💾 Save Individual Rule');
            console.log('Rule ID:', editingRule.roi_id);
            console.log('Rule Name:', editingRule.name);
            console.log('Rule Type:', editingRule.roi_type);
            console.log('Timestamp:', new Date().toISOString());
            console.groupEnd();
            
            // Add timestamp before saving
            const now = dayjs().format(MROI_CONSTANTS.DATE_FORMAT_AUDIT);
            const savedRule: Rule = {
                ...editingRule,
                updated_at: now,
            };
            
            onSaveRule(savedRule);  // ← Call parent callback
            
            // Step 4: Success feedback
            console.log('✅ Rule saved successfully');
            setHasChanges(false);
            setSaveError(null);
            setLastSavedTime(new Date());
            
        } catch (error: any) {
            // Step 5: Error handling
            const errorMsg = error.message || 'Unknown error occurred';
            console.error('❌ Failed to save rule:', errorMsg);
            setSaveError(`Save failed: ${errorMsg}`);
            
        } finally {
            setIsSavingRule(false);
        }
    };

    // ✅ Option B: Removed handleSaveOld - using new handleSaveRule

    return (
        <div className="setup-editor">
            {/* Header */}
            <div className="editor-header">
                <h3>📝 Edit Rule</h3>
                <span
                    className="type-badge"
                    style={{ backgroundColor: ROI_TYPE_COLORS[editingRule.roi_type] }}
                >
                    {editingRule.roi_type}
                </span>
            </div>

            {/* Tab Navigation */}
            <div className="editor-tabs">
                <button
                    className={`tab-button ${activeTab === 'edit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('edit')}
                >
                    ✏️ Edit
                </button>
                {editingRule.roi_type !== 'zoom' && (
                    <button
                        className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
                        onClick={() => setActiveTab('schedule')}
                    >
                        ⏱️ Schedule
                    </button>
                )}
                <button
                    className={`tab-button ${activeTab === 'audit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('audit')}
                >
                    📅 Audit
                </button>
            </div>

            {/* Tab Content */}
            <div className="editor-content">
                {/* Error Message Display */}
                {saveError && (
                    <div className="save-error">
                        <strong>❌ Error:</strong> {saveError}
                    </div>
                )}

                {/* Success Indicator */}
                {lastSavedTime && !saveError && !isSavingRule && (
                    <div className="save-indicator">
                        <span>✓ Saved at {lastSavedTime.toLocaleTimeString()}</span>
                    </div>
                )}
                {/* Edit Tab */}
                {activeTab === 'edit' && (
                    <>
                        <div className="edit-section">
                            <h4>ℹ️ Basic Information</h4>

                            {/* Rule Name */}
                            <div className="form-group">
                                <label htmlFor="rule-name">Rule Name</label>
                                <input
                                    id="rule-name"
                                    type="text"
                                    value={editingRule.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    maxLength={50}
                                    placeholder="Enter rule name"
                                    className="text-input"
                                />
                                <small>{editingRule.name.length}/50</small>
                            </div>

                            {/* Rule Type */}
                            <div className="form-group">
                                <label htmlFor="rule-type">Rule Type</label>
                                <select
                                    id="rule-type"
                                    value={editingRule.roi_type}
                                    onChange={(e) => handleRuleTypeChange(e.target.value as Rule['roi_type'])}
                                    className="select-input"
                                >
                                    <option value="intrusion">🚨 Intrusion</option>
                                    <option value="tripwire">📏 Tripwire</option>
                                    <option value="density">👥 Density</option>
                                    <option value="zoom">🔍 Zoom</option>
                                    <option value="health">❤️ Health</option>
                                </select>
                            </div>
                        </div>
                    </>
                )}

                {/* Schedule Tab */}
                {activeTab === 'schedule' && editingRule.roi_type !== 'zoom' && editingRule.schedule && (
                    <div className="schedule-section">
                        <h4>⏱️ Schedule Configuration</h4>
                        <ScheduleControls
                            schedule={editingRule.schedule[0]}
                            onChangeSchedule={handleScheduleChange}
                        />
                    </div>
                )}

                {/* Audit Tab */}
                {activeTab === 'audit' && (
                    <div className="audit-section">
                        <h4>📅 Audit Information</h4>

                        <div className="info-group">
                            <label>Created Date</label>
                            <div className="info-value">{editingRule.created_date}</div>
                        </div>

                        <div className="info-group">
                            <label>Created By</label>
                            <div className="info-value">
                                {editingRule.created_by || user?.username || 'System'}
                            </div>
                        </div>

                        {editingRule.updated_at && (
                            <div className="info-group">
                                <label>Last Modified</label>
                                <div className="info-value">{editingRule.updated_at}</div>
                            </div>
                        )}

                        <div className="info-group">
                            <label>Total Points</label>
                            <div className="info-value">{editingRule.points.length} point(s)</div>
                        </div>

                        {editingRule.roi_status && (
                            <div className="info-group">
                                <label>Status</label>
                                <div className="info-value">
                                    <span className={`status-badge ${editingRule.roi_status === 'ON' ? 'on' : 'off'}`}>
                                        {editingRule.roi_status}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons - Option B: Save Individual Rule */}
            <div className="action-buttons">
                <button
                    className="btn-save-rule"
                    onClick={handleSaveRule}
                    disabled={isSavingRule || !hasChanges}
                    title={!hasChanges ? "No changes to save" : "Save this rule changes"}
                >
                    {isSavingRule ? (
                        <>
                            <span className="saving-spinner">⏳</span>
                            Saving...
                        </>
                    ) : (
                        '✓ Save Rule'
                    )}
                </button>
            </div>
        </div>
    );
};
