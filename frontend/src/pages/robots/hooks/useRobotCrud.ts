/**
 * useRobotCrud Hook
 * Handles all CRUD operations and state management for robots
 */

import { useState, useCallback } from 'react';
import { robotsService } from '@/services/robots.service';
import { RobotData, RobotListState, RobotFormState } from '../types/robot.types';
import { ROBOT_MESSAGES } from '../constants/robot.constants';

export const useRobotCrud = () => {
    const [state, setState] = useState<RobotListState>({
        robots: [],
        loading: true,
        error: null
    });

    const [edits, setEdits] = useState<RobotFormState>({});
    const [isSaving, setIsSaving] = useState(false);

    // Load all robots
    const loadRobots = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, error: null, loading: true }));
            const data = await robotsService.getAll();
            setState(prev => ({ ...prev, robots: data || [], loading: false }));
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : ROBOT_MESSAGES.LOAD_ERROR;
            setState(prev => ({ ...prev, error: errorMsg, loading: false }));
            console.error(err);
        }
    }, []);

    // Update a single robot
    const handleUpdateRobot = useCallback(async (robot: RobotData) => {
        const edit = edits[robot.vin];
        if (!edit) return;

        try {
            const updated = { ...robot, ...edit };
            await robotsService.update(robot.vin, updated);
            
            setState(prev => ({
                ...prev,
                robots: prev.robots.map(r => r.vin === robot.vin ? updated : r)
            }));
            
            setEdits(prev => {
                const newEdits = { ...prev };
                delete newEdits[robot.vin];
                return newEdits;
            });

            return { success: true, message: ROBOT_MESSAGES.UPDATE_SUCCESS };
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : ROBOT_MESSAGES.UPDATE_FAILED;
            return { success: false, message: errorMsg };
        }
    }, [edits]);

    // Delete a robot
    const handleDeleteRobot = useCallback(async (vin: string) => {
        try {
            await robotsService.delete(vin);
            setState(prev => ({
                ...prev,
                robots: prev.robots.filter(r => r.vin !== vin)
            }));
            return { success: true, message: ROBOT_MESSAGES.DELETE_SUCCESS };
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : ROBOT_MESSAGES.DELETE_FAILED;
            return { success: false, message: errorMsg };
        }
    }, []);

    // Create a new robot
    const handleCreateRobot = useCallback(async (newRobot: RobotData) => {
        setIsSaving(true);
        try {
            const createdRobot = await robotsService.create(newRobot);
            setState(prev => ({
                ...prev,
                robots: [...prev.robots, createdRobot]
            }));
            return { success: true, message: ROBOT_MESSAGES.ADD_SUCCESS };
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || ROBOT_MESSAGES.ADD_FAILED;
            return { success: false, message: errorMsg };
        } finally {
            setIsSaving(false);
        }
    }, []);

    // Handle field change in edit mode
    const handleFieldChange = useCallback((vin: string, field: string, value: any) => {
        setEdits(prev => ({
            ...prev,
            [vin]: { ...prev[vin], [field]: value }
        }));
    }, []);

    // Check if a robot has changes
    const hasChanges = useCallback((robot: RobotData) => {
        const edit = edits[robot.vin];
        if (!edit) return false;
        return Object.keys(edit).some(key => {
            const editKey = key as keyof RobotData;
            return (edit as any)[editKey] !== robot[editKey];
        });
    }, [edits]);

    return {
        // State
        robots: state.robots,
        loading: state.loading,
        error: state.error,
        edits,
        isSaving,

        // Methods
        loadRobots,
        handleUpdateRobot,
        handleDeleteRobot,
        handleCreateRobot,
        handleFieldChange,
        hasChanges
    };
};
