import { useState, useEffect } from 'react';
import { usersService, type UserWithRoles } from '@/services';
import { useAuth } from '@/contexts';
import './ManageRolesPage.css';

export const ManageRolesPage = () => {
    const [users, setUsers] = useState<UserWithRoles[]>([]);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [createdUserId, setCreatedUserId] = useState<string | null>(null);
    const [createForm, setCreateForm] = useState({ username: '', email: '', firstName: '', lastName: '', emailVerified: false });
    const [passwordForm, setPasswordForm] = useState({ password: '', confirm: '', temporary: true });
    const [notification, setNotification] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

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

    const { user: authUser } = useAuth();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; username: string } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleteAdminPassword, setDeleteAdminPassword] = useState('');

    const openDeleteModal = (user: UserWithRoles) => {
        setDeleteTarget({ id: user.id, username: user.username });
        setDeleteConfirm('');
        setDeleteAdminPassword('');
        setShowDeleteModal(true);
    };

    const handleDeleteUser = async () => {
        if (!deleteTarget) return;
        const expectedAdmin = (authUser?.username || authUser?.preferred_username || '').trim().toLowerCase();
        if (deleteConfirm.trim().toLowerCase() !== expectedAdmin) {
            setNotification({ message: 'Confirmation admin username does not match your account', type: 'error' });
            return;
        }
        if (!deleteAdminPassword) {
            setNotification({ message: 'Please enter your admin password', type: 'error' });
            return;
        }
        try {
            await usersService.deleteUser(deleteTarget.id, { confirmUsername: deleteConfirm, adminPassword: deleteAdminPassword });
            setShowDeleteModal(false);
            setDeleteTarget(null);
            setDeleteConfirm('');
            setDeleteAdminPassword('');
            await loadUsers();
            setNotification({ message: 'User disabled successfully', type: 'success' });
        } catch (err: any) {
            setNotification({ message: err.response?.data?.message || err.response?.data || 'Failed to delete user', type: 'error' });
        }
    };

    const openCreateUser = () => {
        setCreateForm({ username: '', email: '', firstName: '', lastName: '', emailVerified: false });
        setShowCreateModal(true);
    };

    const handleCreateUser = async () => {
        if (!createForm.username || createForm.username.trim() === '') {
            setNotification({ message: 'Username is required', type: 'error' });
            return;
        }
        try {
            const res = await usersService.createUser(createForm);
            setCreatedUserId(res.id || res.id);
            setShowCreateModal(false);
            setShowPasswordModal(true);
        } catch (err: any) {
            setNotification({ message: err.response?.data?.message || err.response?.data || 'Failed to create user', type: 'error' });
        }
    };

    const handleSetPassword = async () => {
        if (!passwordForm.password) {
            setNotification({ message: 'Password is required', type: 'error' });
            return;
        }
        if (passwordForm.password !== passwordForm.confirm) {
            setNotification({ message: 'Password and confirmation do not match', type: 'error' });
            return;
        }
        if (!createdUserId) return;
        try {
            await usersService.setPassword(createdUserId, { password: passwordForm.password, temporary: passwordForm.temporary });
            setShowPasswordModal(false);
            setCreatedUserId(null);
            setPasswordForm({ password: '', confirm: '', temporary: true });
            await loadUsers();
            setNotification({ message: 'User created and password set successfully', type: 'success' });
        } catch (err: any) {
            setNotification({ message: err.response?.data?.message || err.response?.data || 'Failed to set password', type: 'error' });
        }
    };

    const closeNotification = () => setNotification(null);

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
        ///Add User Roles Page
    return (
        <div className="manage-roles-page">
            <div className="manage-roles-header">
                <div>
                    <h1>Manage User Roles</h1>
                    <p>Manage roles and permissions for all users</p>
                </div>
                <div className="manage-roles-actions">
                    <button className="btn-primary" onClick={openCreateUser}>Add user</button>
                </div>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Roles</th>
                            <th>Actions</th>
                            <th style={{ width: 50, textAlign: 'center' }}>Delete</th>
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
                                <td style={{ textAlign: 'center' }}>
                                    <button className="btn-delete-icon" onClick={() => openDeleteModal(u)} title="Delete user">🗑</button>
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

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
                            <h2>Create user</h2>
                            <div>
                                <label>Username *</label>
                                <input type="text" value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} />
                            </div>
                            <div>
                                <label>Email</label>
                                <input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
                            </div>
                            <div>
                                <label>First name</label>
                                <input type="text" value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} />
                            </div>
                            <div>
                                <label>Last name</label>
                                <input type="text" value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} />
                            </div>
                            <div>
                                <label>
                                    <input type="checkbox" checked={createForm.emailVerified} onChange={(e) => setCreateForm({ ...createForm, emailVerified: e.target.checked })} /> Email verified
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-primary" onClick={handleCreateUser}>Create</button>
                                <button className="btn-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            </div>
                        </div>
                </div>
            )}

            {showDeleteModal && deleteTarget && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
                        <h2>Delete user</h2>
                        <p>To confirm deletion of <strong>{deleteTarget.username}</strong>, type your admin username below and enter your admin password.</p>
                        <div>
                            <label>Confirm username</label>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input autoFocus placeholder={authUser?.username || authUser?.preferred_username || ''} type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} />
                                <button type="button" className="btn-copy" onClick={() => { const txt = authUser?.username || authUser?.preferred_username || ''; navigator.clipboard?.writeText(txt); setNotification({ message: 'Admin username copied to clipboard', type: 'success' }); }}>Copy</button>
                            </div>
                        </div>
                        <div>
                            <label>Admin password</label>
                            <input type="password" value={deleteAdminPassword} onChange={(e) => setDeleteAdminPassword(e.target.value)} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-primary" onClick={handleDeleteUser}>Delete</button>
                            <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setShowPasswordModal(false)}>×</button>
                            <h2>Set password</h2>
                            <div>
                                <label>Password *</label>
                                <input type="password" value={passwordForm.password} onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })} />
                            </div>
                            <div>
                                <label>Password confirmation *</label>
                                <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
                            </div>
                            <div>
                                <label>
                                    <input type="checkbox" checked={passwordForm.temporary} onChange={(e) => setPasswordForm({ ...passwordForm, temporary: e.target.checked })} /> Temporary
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-primary" onClick={handleSetPassword}>Save</button>
                                <button className="btn-cancel" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                            </div>
                        </div>
                </div>
            )}

                {notification && (
                    <div className={`toast ${notification.type === 'error' ? 'toast-error' : 'toast-success'}`}>
                        <div className="toast-body">{notification.message}</div>
                        <button className="toast-close" onClick={closeNotification}>×</button>
                    </div>
                )}
        </div>
    );
};
