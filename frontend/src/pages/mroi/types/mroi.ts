/**
 * 📋 MROI Editor Type Definitions
 * Comprehensive type definitions for Multiple Rules support
 * Created: 18 December 2025
 */

/**
 * 📍 Point: Single coordinate on canvas
 * Used during drawing process (editor perspective)
 */
export interface Point {
    x: number;
    y: number;
}

/**
 * 📊 PointArray: Tuple format for backend compatibility
 * Format: [x, y] - stored in database
 * Example: [100, 200]
 */
export type PointArray = [number, number];

/**
 * ⏰ Schedule: Configuration for AI monitoring
 * Applies to non-zoom rules (Intrusion, Tripwire, Density, Health)
 */
export interface Schedule {
    surveillance_id: string;
    ai_type: string;
    start_time: string;                    // Format: "HH:mm:ss"
    end_time: string;                      // Format: "HH:mm:ss"
    direction: string;                     // e.g., "Both", "A to B", "B to A"
    confidence_threshold: number;          // Range: 0.0 - 1.0
    confidence_zoom: number;               // Range: 0.0 - 1.0
    duration_threshold_seconds: number;    // Seconds
}

/**
 * 🎯 Rule: Single ROI rule configuration
 * Represents one region of interest on the canvas
 */
export interface Rule {
    // 🔑 Unique identifier
    roi_id: string;

    // 📝 Basic info
    name: string;
    roi_type: 'intrusion' | 'tripwire' | 'density' | 'zoom' | 'health';

    // 🎨 Canvas data
    points: PointArray[];                  // [[x,y], [x,y], ...] format

    // 🔄 Status
    roi_status?: 'ON' | 'OFF';

    // 📅 Metadata (Audit Trail) - IMMUTABLE after creation
    created_date: string;                  // Format: "DD/MM/YYYY"
    created_by: string;                    // e.g., "METTHIER", "Admin"
    updated_at?: string;                   // Format: "DD/MM/YYYY HH:mm:ss"

    // ⚙️ Optional: Schedule and surveillance
    schedule?: Schedule[];                 // For non-zoom rules
    surveillance_id?: string;              // For zoom rules only
}

/**
 * 🏗️ RegionAIConfig: Complete configuration container
 * Backend format - wraps all rules
 */
export interface RegionAIConfig {
    rule: Rule[];                          // Max 6 rules
}

/**
 * 🖼️ CanvasState: Current drawing session state
 * Transient state for UI interactions
 */
export interface CanvasState {
    enableDrawMode: boolean;               // User in drawing mode?
    currentPoints: Point[];                // Points being drawn ({x,y} format)
}

/**
 * 📊 RuleListProps: Props for RuleList component
 * ① Sidebar component for listing all rules
 */
export interface RuleListProps {
    rules: Rule[];
    selectedRuleId: string | null;
    onSelectRule: (ruleId: string) => void;
    onCreateRule: (roi_type: string) => void;
    onDeleteRule: (roi_id: string) => void;
    onToggleStatus: (roi_id: string, status: 'ON' | 'OFF') => void;
    maxRules: number;                      // Usually 6
}

/**
 * 📝 SetupEditorProps: Props for SetupEditor component
 * ③ Details panel component
 */
export interface SetupEditorProps {
    selectedRule: Rule | null;
    onSaveRule: (rule: Rule) => void;      // Save to state
    onDeleteRule: (roi_id: string) => void;
}

/**
 * ⏱️ ScheduleControlsProps: Props for ScheduleControls component
 * Schedule UI component (nested in SetupEditor)
 */
export interface ScheduleControlsProps {
    schedule: Schedule | null;
    onChangeSchedule: (schedule: Schedule) => void;
}

/**
 * 🎨 DrawingCanvasProps: Props for DrawingCanvas component
 * ② Canvas area component
 */
export interface DrawingCanvasProps {
    snapshotUrl: string | null;
    snapshotError?: string | null; // ✅ NEW: Error message from snapshot loading
    rules: Rule[];
    currentRule: Rule | null;
    currentPoints: Point[];
    enableDrawMode: boolean;
    onCanvasClick: (point: Point) => void;
    onClearPoints: () => void;
    onFinishDrawing: () => void;  // ✅ NEW: Save currentPoints to rule
}

/**
 * 🎨 Type-aware colors for different ROI types
 */
export const ROI_TYPE_COLORS: Record<Rule['roi_type'], string> = {
    intrusion: '#ff4444',                 // Red
    tripwire: '#00ffff',                  // Cyan
    density: '#1E39C3',                   // Blue
    zoom: '#FFD700',                      // Gold
    health: '#23F770',                    // Green
};

/**
 * ✅ Minimum points required for each ROI type
 */
export const MIN_POINTS_FOR_TYPE: Record<Rule['roi_type'], number> = {
    intrusion: 3,
    tripwire: 2,
    density: 3,
    zoom: 1,
    health: 3,
};

/**
 * ⚙️ Constants
 */
export const MROI_CONSTANTS = {
    MAX_RULES: 6,
    MAX_ZOOM_RULES: 1,
    DATE_FORMAT_DISPLAY: 'DD/MM/YYYY',              // For display
    DATE_FORMAT_AUDIT: 'DD/MM/YYYY HH:mm:ss',      // For audit trail
    DEFAULT_CONFIDENCE: 0.7,
    DEFAULT_DURATION_SECONDS: 5,
} as const;

/**
 * 🆔 Default values for new rules
 */
export const DEFAULT_RULE: Omit<Rule, 'roi_id' | 'created_date' | 'created_by'> = {
    name: 'New Rule',
    roi_type: 'intrusion',
    points: [],
    roi_status: 'OFF',
    schedule: [
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
    ],
};

/**
 * 🔍 Type Guards
 */

export const isPoint = (obj: unknown): obj is Point => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'x' in obj &&
        'y' in obj &&
        typeof (obj as Point).x === 'number' &&
        typeof (obj as Point).y === 'number'
    );
};

export const isPointArray = (obj: unknown): obj is PointArray => {
    return (
        Array.isArray(obj) &&
        obj.length === 2 &&
        typeof obj[0] === 'number' &&
        typeof obj[1] === 'number'
    );
};

export const isSchedule = (obj: unknown): obj is Schedule => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'start_time' in obj &&
        'end_time' in obj &&
        'confidence_threshold' in obj
    );
};

export const isRule = (obj: unknown): obj is Rule => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'roi_id' in obj &&
        'name' in obj &&
        'roi_type' in obj &&
        'points' in obj &&
        'created_date' in obj &&
        'created_by' in obj &&
        Array.isArray((obj as Rule).points)
    );
};

export const isRegionAIConfig = (obj: unknown): obj is RegionAIConfig => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'rule' in obj &&
        Array.isArray((obj as RegionAIConfig).rule) &&
        (obj as RegionAIConfig).rule.every(isRule)
    );
};
