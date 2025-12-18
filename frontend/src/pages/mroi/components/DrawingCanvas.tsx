import React, { useRef, useEffect, useState } from 'react';
import { DrawingCanvasProps, Point, ROI_TYPE_COLORS, Rule } from '../types/mroi';
import './DrawingCanvas.css';

/**
 * 🎨 DrawingCanvas Component
 * ② Canvas area for drawing ROI regions
 * - Display snapshot image
 * - Draw all rules with type-aware colors
 * - Draw current points being added
 * - Handle mouse clicks for adding points
 */
export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
    snapshotUrl,
    rules,
    currentRule,
    currentPoints,
    enableDrawMode,
    onCanvasClick,
    onClearPoints,
    onFinishDrawing,  // ✅ NEW
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    // ✅ Fix #2B: Reset imageRef when snapshotUrl changes to prevent race condition
    useEffect(() => {
        imageRef.current = null;
    }, [snapshotUrl]);

    // Load and measure snapshot image
    useEffect(() => {
        if (!snapshotUrl) {
            setImageLoaded(false);
            return;
        }

        const img = new Image();
        img.onload = () => {
            imageRef.current = img;
            // Set canvas size to match image aspect ratio
            const canvas = canvasRef.current;
            if (canvas) {
                const containerWidth = canvas.parentElement?.clientWidth || 800;
                const scale = containerWidth / img.width;
                const newHeight = img.height * scale;
                setCanvasSize({
                    width: containerWidth,
                    height: Math.max(newHeight, 600),
                });
            }
            // ✅ Fix #1: Trigger redraw when image loads
            setImageLoaded(true);
        };
        img.onerror = () => {
            console.error('Failed to load snapshot image');
            setImageLoaded(false);
        };
        img.src = snapshotUrl;
    }, [snapshotUrl]);

    // Redraw canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageRef.current) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw image
        ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

        // Draw all rules
        rules.forEach((rule) => {
            if (rule.points.length < 2) return; // Need at least 2 points
            drawRulePolygon(ctx, rule, false);
        });

        // Draw current rule points in progress
        if (enableDrawMode && currentRule && currentPoints.length > 0) {
            drawCurrentPoints(ctx, currentPoints);
        }
    }, [snapshotUrl, rules, currentRule, currentPoints, enableDrawMode, imageLoaded]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!enableDrawMode || !currentRule) {
            console.warn('Drawing not enabled or no rule selected');
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        // ✅ Fix #1: Protect against canvas not ready or zero dimensions
        if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
            console.warn('Canvas dimensions not ready for drawing');
            return;
        }

        // ✅ Fix #1: Calculate scale factors to handle canvas CSS size vs resolution
        const scaleX = canvas.width / canvas.offsetWidth;
        const scaleY = canvas.height / canvas.offsetHeight;

        const rect = canvas.getBoundingClientRect();
        const point: Point = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };

        onCanvasClick(point);
    };

    // ✅ NEW: Handle right-click to finish drawing and save points
    const handleCanvasContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
        e.preventDefault(); // Prevent default context menu
        
        if (!enableDrawMode || !currentRule) {
            console.warn('Drawing not enabled or no rule selected');
            return;
        }

        if (currentPoints.length < 2) {
            console.warn(`⚠️ Need at least 2 points. Current: ${currentPoints.length}`);
            return;
        }

        onFinishDrawing();
    };

    return (
        <div className="drawing-canvas-container">
            <div className="canvas-wrapper">
                {snapshotUrl ? (
                    <>
                        <canvas
                            ref={canvasRef}
                            width={canvasSize.width}
                            height={canvasSize.height}
                            onClick={handleCanvasClick}
                            onContextMenu={handleCanvasContextMenu}
                            className={`canvas-element ${enableDrawMode ? 'drawing-mode' : ''}`}
                            title={enableDrawMode ? 'Left-click to add points, Right-click to finish' : 'Enable draw mode to add points'}
                        />

                        {/* Mode Indicator */}
                        <div className={`mode-indicator ${enableDrawMode ? 'active' : 'inactive'}`}>
                            {enableDrawMode ? '🎨 Drawing Mode' : '👁️ View Mode'}
                        </div>

                        {/* Current Points Counter & Right-Click Warning */}
                        {enableDrawMode && (
                            <div className="points-counter">
                                <span>Points: {currentPoints.length}</span>
                                {currentPoints.length > 0 && (
                                    <>
                                        <button onClick={onClearPoints} className="clear-btn">
                                            ✕ Clear
                                        </button>
                                {/* ✅ Right-Click to Finish Warning */}
                                        <span className="right-click-hint">
                                            <span className="hint-icon">👉</span>
                                            Right-click to save
                                        </span>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Legend */}
                        <div className="canvas-legend">
                            <h4>Legend</h4>
                            {rules.length > 0 ? (
                                rules.map((rule) => (
                                    <div key={rule.roi_id} className="legend-item">
                                        <span
                                            className="legend-color"
                                            style={{ backgroundColor: ROI_TYPE_COLORS[rule.roi_type] }}
                                        />
                                        <span className="legend-label">
                                            {rule.name} ({rule.roi_type})
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="no-rules">No rules to display</p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="no-snapshot">
                        <p>📷 Snapshot not available</p>
                        <p className="small">Select a device and camera to load snapshot</p>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Draw a rule polygon on canvas
 */
function drawRulePolygon(ctx: CanvasRenderingContext2D, rule: Rule, highlight: boolean) {
    if (rule.points.length < 2) return;

    const color = ROI_TYPE_COLORS[rule.roi_type];
    const lineWidth = highlight ? 3 : 2;
    const pointRadius = highlight ? 6 : 4;

    // Draw polygon outline
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.fillStyle = color + '20'; // Semi-transparent fill
    ctx.globalAlpha = 0.3;

    ctx.beginPath();
    const [firstX, firstY] = rule.points[0];
    ctx.moveTo(firstX, firstY);

    for (let i = 1; i < rule.points.length; i++) {
        const [x, y] = rule.points[i];
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.stroke();

    // Draw points
    ctx.fillStyle = color;
    rule.points.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
        ctx.fill();

        // Draw point index
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(rule.points.indexOf([x, y]) + 1), x, y);
        ctx.fillStyle = color;
    });

    // ✅ Fix #3: Draw rule name label at centroid
    if (rule.name && rule.name.trim().length > 0 && rule.points.length >= 3) {
        // Calculate centroid
        const centerX = rule.points.reduce((sum, p) => sum + p[0], 0) / rule.points.length;
        const centerY = rule.points.reduce((sum, p) => sum + p[1], 0) / rule.points.length;

        // Prepare display name (truncate if too long)
        const maxLen = 20;
        const displayName = rule.name.length > maxLen 
            ? rule.name.substring(0, maxLen - 1) + '...'
            : rule.name;

        // Draw semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const metrics = ctx.measureText(displayName);
        const padding = 6;
        const boxWidth = metrics.width + padding * 2;
        const boxHeight = 20;
        
        ctx.fillRect(
            centerX - boxWidth / 2,
            centerY - boxHeight / 2,
            boxWidth,
            boxHeight
        );

        // Draw text
        ctx.fillStyle = color;
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayName, centerX, centerY);
    }
}

/**
 * Draw points currently being added
 */
function drawCurrentPoints(ctx: CanvasRenderingContext2D, points: Point[]) {
    const color = '#FFD700'; // Gold
    const pointRadius = 5;

    // Draw line connecting points
    if (points.length > 1) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Dashed line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        // ✅ Fix #2: Add closing line to complete polygon
        ctx.lineTo(points[0].x, points[0].y);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash pattern
    }

    // Draw points
    ctx.fillStyle = color;
    points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
        ctx.fill();

        // Draw outline
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw point index
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(index + 1), point.x, point.y);
    });
}
