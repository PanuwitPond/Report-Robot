/**
 * Admin Management Constants
 */

export const INITIAL_ADD_USER_FORM = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
};

export const ADMIN_MESSAGES = {
    LOAD_ERROR: 'Failed to load users',
    LOAD_ROLES_ERROR: 'Failed to load available roles',
    ASSIGN_ROLE_ERROR: 'Failed to assign role',
    REMOVE_ROLE_ERROR: 'Failed to remove role',
    REMOVE_LAST_ADMIN: 'Cannot remove the last admin user!',
    REMOVE_CONFIRM: (roleName: string) => `Remove role "${roleName}" from this user?`,
    CREATE_USER_ERROR: 'Failed to create user',
    CREATE_USER_SUCCESS: 'User created successfully!',
    VALIDATION_USERNAME_REQUIRED: 'Username and email are required',
    VALIDATION_EMAIL_REQUIRED: 'Please verify email before proceeding',
    VALIDATION_PASSWORD_REQUIRED: 'Password fields are required',
    VALIDATION_PASSWORD_MISMATCH: 'Passwords do not match',
    VALIDATION_PASSWORD_MIN: 'Password must be at least 8 characters'
};

export const PASSWORD_MIN_LENGTH = 8;

export const ROLE_MODAL_CONFIG = {
    TITLE_TEMPLATE: (username: string) => `Add Role to ${username}`,
    EMPTY_MESSAGE: 'User already has all available roles'
};

export const ADD_USER_MODAL_CONFIG = {
    STEP_1_TITLE: 'Add New User - Step 1: Basic Info',
    STEP_2_TITLE: 'Add New User - Step 2: Set Password',
    STEP_2_PASSWORD_HINT: 'Password must be at least 8 characters long',
    NEXT_BUTTON: 'Next: Set Password',
    CREATE_BUTTON: 'Create User',
    BACK_BUTTON: 'Back',
    CANCEL_BUTTON: 'Cancel'
};
