import React, { useState } from 'react';
import { Rule, RuleListProps, ROI_TYPE_COLORS } from '../types/mroi';
import './RuleList.css';

/**
 * 📋 RuleList Component
 * ① Sidebar for displaying and managing multiple rules
 * - Display all rules with type-aware colors
 * - Create new rules (max 6)
 * - Select rule for editing
 * - Toggle ON/OFF status
 * - Delete rules with confirmation
 */
export const RuleList: React.FC<RuleListProps> = ({
    rules,
    selectedRuleId,
    onSelectRule,
    onCreateRule,
    onDeleteRule,
    onToggleStatus,
    maxRules,
}) => {
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [createMenu, setCreateMenu] = useState(false);

    const canCreateRule = rules.length < maxRules;
    const roi_types: Array<Rule['roi_type']> = ['intrusion', 'tripwire', 'density', 'zoom', 'health'];
    const zoomRuleCount = rules.filter(r => r.roi_type === 'zoom').length;
    const canCreateZoom = zoomRuleCount < 1; // Max 1 zoom rule

    const handleCreateRule = (roi_type: Rule['roi_type']) => {
        // Can't create zoom if limit reached
        if (roi_type === 'zoom' && !canCreateZoom) {
            alert('⚠️ Maximum 1 Zoom rule allowed');
            return;
        }
        onCreateRule(roi_type);
        setCreateMenu(false);
    };

    const handleDeleteClick = (e: React.MouseEvent, roi_id: string) => {
        e.stopPropagation();
        setDeleteConfirm(roi_id);
    };

    const handleConfirmDelete = (roi_id: string) => {
        onDeleteRule(roi_id);
        setDeleteConfirm(null);
    };

    const handleToggleStatus = (e: React.MouseEvent, roi_id: string, currentStatus: 'ON' | 'OFF' | undefined) => {
        e.stopPropagation();
        const newStatus = (currentStatus === 'ON' ? 'OFF' : 'ON') as 'ON' | 'OFF';
        onToggleStatus(roi_id, newStatus);
    };

    return (
        <div className="rule-list-container">
            <div className="rule-list-header">
                <h3>📋 Rules ({rules.length}/{maxRules})</h3>
            </div>

            {/* Rules List */}
            <div className="rules-list">
                {rules.length === 0 ? (
                    <div className="no-rules-message">
                        <p>📭 No rules yet</p>
                        <p className="small">Create one to get started</p>
                    </div>
                ) : (
                    rules.map((rule) => (
                        <div
                            key={rule.roi_id}
                            className={`rule-item ${selectedRuleId === rule.roi_id ? 'selected' : ''}`}
                            onClick={() => onSelectRule(rule.roi_id)}
                            style={{
                                borderLeftColor: ROI_TYPE_COLORS[rule.roi_type],
                            }}
                        >
                            {/* Rule content */}
                            <div className="rule-item-content">
                                <div className="rule-name-row">
                                    <span className="rule-type-badge" title={rule.roi_type}>
                                        {getTypeIcon(rule.roi_type)}
                                    </span>
                                    <span className="rule-name">{rule.name}</span>
                                </div>
                                <div className="rule-meta">
                                    <span className="rule-points">
                                        {rule.points.length} points
                                    </span>
                                </div>
                            </div>

                            {/* Status & Controls */}
                            <div className="rule-controls">
                                {/* Status Toggle */}
                                <button
                                    className={`status-btn ${(rule.roi_status || 'OFF') === 'ON' ? 'on' : 'off'}`}
                                    onClick={(e) => handleToggleStatus(e, rule.roi_id, rule.roi_status)}
                                    title={`Turn ${(rule.roi_status || 'OFF') === 'ON' ? 'OFF' : 'ON'}`}
                                >
                                    {(rule.roi_status || 'OFF') === 'ON' ? '✓ ON' : '○ OFF'}
                                </button>

                                {/* Delete button */}
                                {deleteConfirm === rule.roi_id ? (
                                    <div className="delete-confirm">
                                        <button
                                            className="btn-yes"
                                            onClick={() => handleConfirmDelete(rule.roi_id)}
                                        >
                                            ✓ Yes
                                        </button>
                                        <button
                                            className="btn-no"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteConfirm(null);
                                            }}
                                        >
                                            ✕ No
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => handleDeleteClick(e, rule.roi_id)}
                                        title="Delete rule"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Rule Button */}
            <div className="create-rule-section">
                {canCreateRule ? (
                    <div className="create-menu-container">
                        <button
                            className="create-rule-btn"
                            onClick={() => setCreateMenu(!createMenu)}
                        >
                            ➕ Create Rule
                        </button>

                        {createMenu && (
                            <div className="type-menu">
                                {roi_types.map((type) => {
                                    // Disable zoom if max zoom reached
                                    const isDisabled = type === 'zoom' && !canCreateZoom;
                                    return (
                                        <button
                                            key={type}
                                            className={`type-option ${isDisabled ? 'disabled' : ''}`}
                                            onClick={() => !isDisabled && handleCreateRule(type)}
                                            disabled={isDisabled}
                                            title={isDisabled ? 'Max 1 Zoom rule' : `Create ${type} rule`}
                                        >
                                            <span className="type-icon">{getTypeIcon(type as Rule['roi_type'])}</span>
                                            <span className="type-name">{type}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-rules-message">
                        <p>⚠️ Max {maxRules} rules reached</p>
                    </div>
                )}
            </div>

            {/* Statistics */}
            <div className="rule-stats">
                <div className="stat">
                    <span>Zoom Rules: {zoomRuleCount}/1</span>
                </div>
                <div className="stat">
                    <span>Total Points: {rules.reduce((sum, r) => sum + r.points.length, 0)}</span>
                </div>
            </div>
        </div>
    );
};

/**
 * Helper function to get icon for rule type
 */
function getTypeIcon(type: Rule['roi_type']): string {
    const icons: Record<Rule['roi_type'], string> = {
        intrusion: '🚨',
        tripwire: '📏',
        density: '👥',
        zoom: '🔍',
        health: '❤️',
    };
    return icons[type] || '?';
}
