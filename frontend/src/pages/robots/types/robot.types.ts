/**
 * Robot Data Types
 * Centralized type definitions for Robot-related entities
 */

export interface RobotData {
    vin: string;
    name: string;
    display_name?: string;
    site: string;
    active: boolean;
    workspace_id?: string;
}

export interface RobotFormState {
    [vin: string]: Partial<RobotData>;
}

export interface RobotFilters {
    searchText: string;
    activeStatus: 'all' | 'active' | 'inactive';
}

export interface RobotListState {
    robots: RobotData[];
    loading: boolean;
    error: string | null;
}
