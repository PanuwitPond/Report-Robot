import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Rule, SetupEditorProps, ROI_TYPE_COLORS, MROI_CONSTANTS } from '../types/mroi';
import { ScheduleControls } from './ScheduleControls';
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
    onDeleteRule,
}) => {
    const [editingRule, setEditingRule] = useState<Rule | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState<'edit' | 'schedule' | 'audit'>('edit');

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
        // ✅ Fix #2b: Auto-save to sync regionAIConfig immediately
        onSaveRule(updated);    };

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
        
        // ✅ Fix #2a: Auto-save to sync regionAIConfig immediately
        onSaveRule(updated);
    };

    const handleScheduleChange = (schedule: any) => {
        if (editingRule.schedule && editingRule.schedule.length > 0) {
            const updated = {
                ...editingRule,
                schedule: [schedule],
            };
            setEditingRule(updated);
            setHasChanges(true);
        }
    };

    const handleSave = () => {
        if (!hasChanges) {
            alert('⚠️ No changes to save');
            return;
        }

        // Validate
        if (!editingRule.name.trim()) {
            alert('⚠️ Rule name cannot be empty');
            return;
        }

        // Update state with audit timestamp
        const now = dayjs().format(MROI_CONSTANTS.DATE_FORMAT_AUDIT);
        const savedRule: Rule = {
            ...editingRule,
            updated_at: now,
        };

        onSaveRule(savedRule);
        setHasChanges(false);
    };

    const handleDelete = () => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }

        onDeleteRule(editingRule.roi_id);
        setDeleteConfirm(false);
    };

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
                            <div className="info-value">{editingRule.created_by}</div>
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

            {/* Action Buttons */}
            <div className="action-buttons">
                <button
                    className={`save-btn ${hasChanges ? 'active' : 'disabled'}`}
                    onClick={handleSave}
                    disabled={!hasChanges}
                    title={hasChanges ? 'Save changes' : 'No changes to save'}
                >
                    💾 Save
                </button>

                <button
                    className={`delete-btn ${deleteConfirm ? 'confirm' : ''}`}
                    onClick={handleDelete}
                    title="Delete this rule"
                >
                    {deleteConfirm ? '⚠️ Confirm Delete?' : '🗑️ Delete'}
                </button>

                {deleteConfirm && (
                    <button
                        className="cancel-delete-btn"
                        onClick={() => setDeleteConfirm(false)}
                    >
                        ✕ Cancel
                    </button>
                )}
            </div>

            {/* Change Indicator */}
            {hasChanges && <div className="change-indicator">✏️ Unsaved changes</div>}
        </div>
    );
};
