/**
 * Robot Constants
 * Centralized constants for Robot management
 */

// Initial Robot State
export const INITIAL_ROBOT_STATE = {
    vin: '',
    name: '',
    display_name: '',
    site: '',
    active: true,
    workspace_id: ''
};

// Filter Options
export const ROBOT_STATUS_FILTERS = {
    ALL: 'all',
    ACTIVE: 'active',
    INACTIVE: 'inactive'
} as const;

// Messages
export const ROBOT_MESSAGES = {
    LOAD_ERROR: 'Failed to load robots',
    UPDATE_SUCCESS: 'Robot updated successfully',
    UPDATE_FAILED: 'Failed to update robot',
    DELETE_CONFIRM: 'Are you sure you want to delete this robot?',
    DELETE_SUCCESS: 'Robot deleted successfully',
    DELETE_FAILED: 'Failed to delete robot',
    ADD_SUCCESS: 'Robot added successfully!',
    ADD_FAILED: 'Failed to add robot. VIN might already exist.',
    VALIDATION_ERROR: 'Please fill in all required fields (VIN, Name, Site)'
};

// Validation
export const ROBOT_REQUIRED_FIELDS = ['vin', 'name', 'site'] as const;
