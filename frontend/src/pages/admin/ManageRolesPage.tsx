/**
 * ManageRolesPage
 * Main page for managing users and their roles
 * Uses extracted components and custom hooks for clean architecture
 */

import { useEffect, useState } from 'react';
import { useUserManagement, useAddUserForm } from './hooks';
import { UserTable } from './ManageRolesPage/UserTable';
import { RoleModal } from './ManageRolesPage/RoleModal';
import { AddUserModal } from './ManageRolesPage/AddUserModal';
import { UserWithRoles } from './types/admin.types';
import { ADMIN_MESSAGES } from './constants/admin.constants';
import './ManageRolesPage.css';

export const ManageRolesPage = () => {
    // Custom hooks
    const {
        users,
        availableRoles,
        isLoading,
        error,
        loadUsers,
        loadAvailableRoles,
        assignRole,
        removeRole,
        createUser
    } = useUserManagement();

    const {
        formData,
        currentStep,
        emailVerified,
        updateField,
        toggleEmailVerification,
        handleNext,
        handleBack,
        reset,
        isStep1Complete,
        isStep2Complete
    } = useAddUserForm();

    // Modal states
    const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);

    // Load data on mount
    useEffect(() => {
        loadUsers();
        loadAvailableRoles();
    }, [loadUsers, loadAvailableRoles]);

    // Handle role assignment
    const handleAssignRole = async (userId: string, roleName: string) => {
        const result = await assignRole(userId, roleName);
        if (result.success) {
            setShowRoleModal(false);
            setSelectedUser(null);
        } else {
            alert(result.message);
        }
    };

    // Handle role removal
    const handleRemoveRole = async (userId: string, roleName: string) => {
        const result = await removeRole(userId, roleName);
        if (!result.success) {
            alert(result.message);
            return;
        }
        if (!confirm(ADMIN_MESSAGES.REMOVE_CONFIRM(roleName))) {
            return;
        }
    };

    // Handle add user submission
    const handleAddUserSubmit = async () => {
        const result = await createUser(
            formData.username,
            formData.email,
            formData.firstName,
            formData.lastName,
            formData.password,
            emailVerified
        );

        if (result.success) {
            alert(result.message);
            reset();
            setShowAddUserModal(false);
        } else {
            alert(result.message);
        }
    };

    // Handle add user modal flow
    const handleAddUserNext = async () => {
        const result = await handleNext(handleAddUserSubmit);
        if (!result.success) {
            alert(result.message);
        }
    };

    // Handle role modal open
    const handleOpenRoleModal = (user: UserWithRoles) => {
        setSelectedUser(user);
        setShowRoleModal(true);
    };

    // Handle add user modal close
    const handleCloseAddUserModal = () => {
        reset();
        setShowAddUserModal(false);
    };

    // Loading state
    if (isLoading) {
        return <div className="manage-roles-loading">Loading...</div>;
    }

    // Error state
    if (error) {
        return (
            <div className="manage-roles-error">
                <p>Error: {error}</p>
                <button onClick={loadUsers}>Retry</button>
            </div>
        );
    }

    // Main render
    return (
        <div className="manage-roles-page">
            <div className="manage-roles-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Manage User Roles</h1>
                        <p>Manage roles and permissions for all users</p>
                    </div>
                    <button
                        className="btn-add-user"
                        onClick={() => setShowAddUserModal(true)}
                    >
                        + Add User
                    </button>
                </div>
            </div>

            <UserTable
                users={users}
                onAddRoleClick={handleOpenRoleModal}
                onRemoveRole={handleRemoveRole}
            />

            <RoleModal
                isOpen={showRoleModal}
                selectedUser={selectedUser}
                availableRoles={availableRoles}
                onAssignRole={handleAssignRole}
                onClose={() => setShowRoleModal(false)}
            />

            <AddUserModal
                isOpen={showAddUserModal}
                currentStep={currentStep}
                formData={formData}
                emailVerified={emailVerified}
                isStep1Complete={isStep1Complete()}
                isStep2Complete={isStep2Complete()}
                onFieldChange={(field: string, value: string) => updateField(field as any, value)}
                onToggleEmailVerify={toggleEmailVerification}
                onNext={handleAddUserNext}
                onBack={handleBack}
                onClose={handleCloseAddUserModal}
            />
        </div>
    );
};
