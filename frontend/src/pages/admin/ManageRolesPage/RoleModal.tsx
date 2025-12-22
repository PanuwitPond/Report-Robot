/**
 * RoleModal Component
 * Modal for assigning roles to users
 */

import { UserWithRoles } from '../types/admin.types';

interface RoleModalProps {
    isOpen: boolean;
    selectedUser: UserWithRoles | null;
    availableRoles: string[];
    onAssignRole: (userId: string, roleName: string) => void;
    onClose: () => void;
}

export const RoleModal = ({
    isOpen,
    selectedUser,
    availableRoles,
    onAssignRole,
    onClose
}: RoleModalProps) => {
    if (!isOpen || !selectedUser) return null;

    const unassignedRoles = availableRoles.filter(role => !selectedUser.roles.includes(role));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Add Role to {selectedUser.username}</h2>
                <div className="role-options">
                    {unassignedRoles.length > 0 ? (
                        unassignedRoles.map(role => (
                            <button
                                key={role}
                                className={`role-option role-${role}`}
                                onClick={() => onAssignRole(selectedUser.id, role)}
                            >
                                {role}
                            </button>
                        ))
                    ) : (
                        <p>User already has all available roles</p>
                    )}
                </div>
                <button className="btn-cancel" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
};
