/**
 * useRobotFilter Hook
 * Handles robot filtering logic
 */

import { useState, useMemo, useCallback } from 'react';
import { RobotData, RobotFilters } from '../types/robot.types';
import { ROBOT_STATUS_FILTERS } from '../constants/robot.constants';

export const useRobotFilter = (robots: RobotData[]) => {
    const [filters, setFilters] = useState<RobotFilters>({
        searchText: '',
        activeStatus: ROBOT_STATUS_FILTERS.ALL as 'all' | 'active' | 'inactive'
    });

    // Filter robots based on current filters
    const filteredRobots = useMemo(() => {
        return robots.filter(robot => {
            // Text search filter
            const matchText = (
                robot.vin?.toLowerCase().includes(filters.searchText.toLowerCase()) ||
                robot.name?.toLowerCase().includes(filters.searchText.toLowerCase()) ||
                robot.site?.toLowerCase().includes(filters.searchText.toLowerCase())
            );

            // Status filter
            let matchStatus = true;
            if (filters.activeStatus === ROBOT_STATUS_FILTERS.ACTIVE) {
                matchStatus = robot.active;
            } else if (filters.activeStatus === ROBOT_STATUS_FILTERS.INACTIVE) {
                matchStatus = !robot.active;
            }

            return matchText && matchStatus;
        });
    }, [robots, filters]);

    // Update search text
    const setSearchText = useCallback((text: string) => {
        setFilters(prev => ({ ...prev, searchText: text }));
    }, []);

    // Update status filter
    const setStatusFilter = useCallback((status: 'all' | 'active' | 'inactive') => {
        setFilters(prev => ({ ...prev, activeStatus: status }));
    }, []);

    // Reset filters
    const resetFilters = useCallback(() => {
        setFilters({
            searchText: '',
            activeStatus: ROBOT_STATUS_FILTERS.ALL as 'all' | 'active' | 'inactive'
        });
    }, []);

    return {
        filters,
        filteredRobots,
        setSearchText,
        setStatusFilter,
        resetFilters
    };
};
