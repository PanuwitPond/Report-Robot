import React from 'react';
import { Schedule, ScheduleControlsProps } from '../types/mroi';
import './ScheduleControls.css';

/**
 * ⏱️ ScheduleControls Component
 * Schedule configuration UI for non-zoom rules
 * - Start/End time pickers
 * - Confidence thresholds
 * - Direction selector
 * - AI Type selector
 * - Duration threshold
 */
export const ScheduleControls: React.FC<ScheduleControlsProps> = ({
    schedule,
    onChangeSchedule,
    disabledTimeRanges,
}) => {
    if (!schedule) {
        return <div className="schedule-controls empty">No schedule available</div>;
    }

    const handleTimeChange = (field: 'start_time' | 'end_time', value: string) => {
        // Validate time format HH:mm:ss
        if (!isValidTime(value)) {
            console.warn('Invalid time format:', value);
            return;
        }

        onChangeSchedule({
            ...schedule,
            [field]: value,
        });
    };

    const handleNumberChange = (
        field: 'confidence_threshold' | 'confidence_zoom' | 'duration_threshold_seconds',
        value: string
    ) => {
        const num = parseFloat(value);
        if (isNaN(num)) return;

        // Validate ranges
        if (field.includes('confidence')) {
            if (num < 0 || num > 1) return;
        } else if (num < 0) {
            return;
        }

        onChangeSchedule({
            ...schedule,
            [field]: num,
        });
    };

    const handleSelectChange = (field: 'direction' | 'ai_type', value: string) => {
        onChangeSchedule({
            ...schedule,
            [field]: value,
        });
    };

    return (
        <div className="schedule-controls">
            <div className="schedule-section">
                <h4>⏰ Time Configuration</h4>

                {/* Start Time */}
                <div className="control-group">
                    <label htmlFor="start-time">Start Time</label>
                    <input
                        id="start-time"
                        type="time"
                        value={schedule.start_time.substring(0, 5)} // Convert HH:mm:ss to HH:mm
                        onChange={(e) => handleTimeChange('start_time', e.target.value + ':00')}
                        className="time-input"
                    />
                    <small>{schedule.start_time}</small>
                </div>

                {/* End Time */}
                <div className="control-group">
                    <label htmlFor="end-time">End Time</label>
                    <input
                        id="end-time"
                        type="time"
                        value={schedule.end_time.substring(0, 5)}
                        onChange={(e) => handleTimeChange('end_time', e.target.value + ':00')}
                        className="time-input"
                    />
                    <small>{schedule.end_time}</small>
                </div>
            </div>

            {/* Confidence Settings */}
            <div className="schedule-section">
                <h4>📊 Confidence Thresholds</h4>

                <div className="control-group">
                    <label htmlFor="confidence-threshold">
                        Confidence Threshold ({schedule.confidence_threshold.toFixed(2)})
                    </label>
                    <input
                        id="confidence-threshold"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={schedule.confidence_threshold}
                        onChange={(e) => handleNumberChange('confidence_threshold', e.target.value)}
                        className="slider"
                    />
                    <div className="slider-labels">
                        <span>0.0</span>
                        <span>0.5</span>
                        <span>1.0</span>
                    </div>
                </div>

                <div className="control-group">
                    <label htmlFor="confidence-zoom">
                        Confidence Zoom ({schedule.confidence_zoom.toFixed(2)})
                    </label>
                    <input
                        id="confidence-zoom"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={schedule.confidence_zoom}
                        onChange={(e) => handleNumberChange('confidence_zoom', e.target.value)}
                        className="slider"
                    />
                    <div className="slider-labels">
                        <span>0.0</span>
                        <span>0.5</span>
                        <span>1.0</span>
                    </div>
                </div>
            </div>

            {/* Direction & AI Type */}
            <div className="schedule-section">
                <h4>🎯 Detection Settings</h4>

                <div className="control-group">
                    <label htmlFor="direction">Direction</label>
                    <select
                        id="direction"
                        value={schedule.direction}
                        onChange={(e) => handleSelectChange('direction', e.target.value)}
                        className="select-input"
                    >
                        <option value="Both">Both</option>
                        <option value="A to B">A to B</option>
                        <option value="B to A">B to A</option>
                    </select>
                </div>

                <div className="control-group">
                    <label htmlFor="ai-type">AI Type</label>
                    <select
                        id="ai-type"
                        value={schedule.ai_type}
                        onChange={(e) => handleSelectChange('ai_type', e.target.value)}
                        className="select-input"
                    >
                        <option value="motion">Motion</option>
                        <option value="person">Person</option>
                        <option value="vehicle">Vehicle</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>

                <div className="control-group">
                    <label htmlFor="duration-threshold">Duration Threshold (seconds)</label>
                    <input
                        id="duration-threshold"
                        type="number"
                        min="0"
                        value={schedule.duration_threshold_seconds}
                        onChange={(e) => handleNumberChange('duration_threshold_seconds', e.target.value)}
                        className="number-input"
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * Validate time format HH:mm:ss
 */
function isValidTime(time: string): boolean {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/;
    return regex.test(time);
}
