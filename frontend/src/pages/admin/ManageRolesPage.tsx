import { useState, useEffect } from 'react';
import { usersService, type UserWithRoles } from '@/services';
import './ManageRolesPage.css';

export const ManageRolesPage = () => {
    const [users, setUsers] = useState<UserWithRoles[]>([]);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await usersService.getAllUsers();
            setUsers(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const loadAvailableRoles = async () => {
        try {
            const roles = await usersService.getAvailableRoles();
            setAvailableRoles(roles);
        } catch (err: any) {
            console.error('Failed to load available roles:', err);
            // Fallback to empty array if fails
            setAvailableRoles([]);
        }
    };

    useEffect(() => {
        loadUsers();
        loadAvailableRoles();
    }, []);

    const handleAssignRole = async (userId: string, roleName: string) => {
        try {
            await usersService.assignRole(userId, roleName);
            await loadUsers(); // Reload users
            setShowRoleModal(false);
            setSelectedUser(null);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to assign role');
        }
    };

    const handleRemoveRole = async (userId: string, roleName: string) => {
        console.log('🔴 Remove button clicked!', { userId, roleName });
        const adminCount = users.filter(u => u.roles.includes('admin')).length;

        if (roleName === 'admin' && adminCount <= 1) {
            alert('Cannot remove the last admin user!');
            return;
        }

        console.log('⏳ Showing confirm dialog...');
        if (!confirm(`Remove role "${roleName}" from this user?`)) {
            console.log('❌ User cancelled');
            return;
        }
        console.log('✅ User confirmed, calling API...');

        try {
            await usersService.removeRole(userId, roleName);
            await loadUsers(); // Reload users
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to remove role');
        }
    };

    const openRoleModal = (user: UserWithRoles) => {
        setSelectedUser(user);
        setShowRoleModal(true);
    };

    if (isLoading) {
        return <div className="manage-roles-loading">Loading...</div>;
    }

    if (error) {
        return (
            <div className="manage-roles-error">
                <p>Error: {error}</p>
                <button onClick={loadUsers}>Retry</button>
            </div>
        );
    }

    return (
        <div className="manage-roles-page">
            <div className="manage-roles-header">
                <h1>Manage User Roles</h1>
                <p>Manage roles and permissions for all users</p>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Roles</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.username}</td>
                                <td>{u.email}</td>
                                <td>
                                    <div className="roles-badges">
                                        {u.roles.map((role) => (
                                            <span key={role} className={`role-badge role-${role}`}>
                                                {role}
                                                <button
                                                    className="role-remove-btn"
                                                    onClick={() => handleRemoveRole(u.id, role)}
                                                    title="Remove role"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <button
                                        className="btn-edit"
                                        onClick={() => openRoleModal(u)}
                                    >
                                        Add Role
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showRoleModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Add Role to {selectedUser.username}</h2>
                        <div className="role-options">
                            {availableRoles.filter((role: string) => !selectedUser.roles.includes(role)).map((role: string) => (
                                <button
                                    key={role}
                                    className={`role-option role-${role}`}
                                    onClick={() => handleAssignRole(selectedUser.id, role)}
                                >
                                    {role}
                                </button>
                            ))}
                            {availableRoles.every((role: string) => selectedUser.roles.includes(role)) && (
                                <p>User already has all available roles</p>
                            )}
                        </div>
                        <button className="btn-cancel" onClick={() => setShowRoleModal(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
