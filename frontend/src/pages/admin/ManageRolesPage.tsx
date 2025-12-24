import { useState, useEffect } from 'react';
import { usersService, type UserWithRoles } from '@/services';
import './ManageRolesPage.css';

export const ManageRolesPage = () => {
    const [users, setUsers] = useState<UserWithRoles[]>([]);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [addUserStep, setAddUserStep] = useState(1); // 1: basic info, 2: password
    const [emailVerified, setEmailVerified] = useState(false);
    const [newUserFormData, setNewUserFormData] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
    });

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
        setSelectedRole(null);
        setShowRoleModal(true);
    };

    const handleAddUser = async () => {
        try {
            if (addUserStep === 1) {
                // Step 1: Validate basic info
                if (!newUserFormData.username || !newUserFormData.email) {
                    alert('Username and email are required');
                    return;
                }
                if (!emailVerified) {
                    alert('Please verify email before proceeding');
                    return;
                }
                // Move to step 2
                setAddUserStep(2);
            } else if (addUserStep === 2) {
                // Step 2: Validate and create user with password
                if (!newUserFormData.password || !newUserFormData.confirmPassword) {
                    alert('Password fields are required');
                    return;
                }
                if (newUserFormData.password !== newUserFormData.confirmPassword) {
                    alert('Passwords do not match');
                    return;
                }
                if (newUserFormData.password.length < 8) {
                    alert('Password must be at least 8 characters');
                    return;
                }

                // Create user with custom password
                await usersService.addUser(
                    newUserFormData.username,
                    newUserFormData.email,
                    newUserFormData.firstName,
                    newUserFormData.lastName,
                    newUserFormData.password,
                    emailVerified
                );
                alert('User created successfully!');
                setNewUserFormData({ 
                    username: '', 
                    email: '', 
                    firstName: '', 
                    lastName: '',
                    password: '',
                    confirmPassword: '',
                });
                setEmailVerified(false);
                setAddUserStep(1);
                setShowAddUserModal(false);
                await loadUsers();
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to create user');
        }
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
        ///Add User Roles Page
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
                                    className={`role-option role-${role} ${selectedRole === role ? 'selected' : ''}`}
                                    onClick={() => setSelectedRole(role)}
                                >
                                    {role}
                                </button>
                            ))}
                            {availableRoles.every((role: string) => selectedUser.roles.includes(role)) && (
                                <p>User already has all available roles</p>
                            )}
                        </div>
                        <div className="modal-buttons">
                            <button 
                                className="btn-primary" 
                                disabled={!selectedRole}
                                onClick={() => {
                                    if (selectedRole) {
                                        handleAssignRole(selectedUser.id, selectedRole);
                                        setShowRoleModal(false);
                                    }
                                }}
                            >
                                Confirm
                            </button>
                            <button className="btn-cancel" onClick={() => setShowRoleModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddUserModal && (
                <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        {addUserStep === 1 ? (
                            <>
                                <h2>Add New User - Step 1: Basic Info</h2>
                                <div className="form-group">
                                    <label htmlFor="username">Username *</label>
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="Enter username"
                                        value={newUserFormData.username}
                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, username: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="Enter email"
                                            value={newUserFormData.email}
                                            onChange={(e) => setNewUserFormData({ ...newUserFormData, email: e.target.value })}
                                            className="form-input"
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            className={`btn-verify ${emailVerified ? 'btn-verify-checked' : ''}`}
                                            onClick={() => setEmailVerified(!emailVerified)}
                                            title={emailVerified ? 'Email verified' : 'Click to verify email'}
                                        >
                                            {emailVerified ? '✓ Verified' : 'Verify'}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name</label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        placeholder="Enter first name"
                                        value={newUserFormData.firstName}
                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, firstName: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        placeholder="Enter last name"
                                        value={newUserFormData.lastName}
                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, lastName: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div className="modal-buttons">
                                    <button 
                                        className="btn-primary" 
                                        onClick={handleAddUser}
                                        disabled={!newUserFormData.username || !newUserFormData.email || !emailVerified}
                                    >
                                        Next: Set Password
                                    </button>
                                    <button className="btn-cancel" onClick={() => {
                                        setShowAddUserModal(false);
                                        setAddUserStep(1);
                                        setEmailVerified(false);
                                    }}>
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2>Add New User - Step 2: Set Password</h2>
                                <div className="form-group">
                                    <label>User Info</label>
                                    <div className="user-info-display">
                                        <p><strong>Username:</strong> {newUserFormData.username}</p>
                                        <p><strong>Email:</strong> {newUserFormData.email}</p>
                                        {newUserFormData.firstName && <p><strong>First Name:</strong> {newUserFormData.firstName}</p>}
                                        {newUserFormData.lastName && <p><strong>Last Name:</strong> {newUserFormData.lastName}</p>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Password *</label>
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="Enter password (min 8 characters)"
                                        value={newUserFormData.password}
                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, password: e.target.value })}
                                        className="form-input"
                                    />
                                    <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
                                        Password must be at least 8 characters long
                                    </small>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm Password *</label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm password"
                                        value={newUserFormData.confirmPassword}
                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, confirmPassword: e.target.value })}
                                        className="form-input"
                                    />
                                    {newUserFormData.password && newUserFormData.confirmPassword && 
                                     newUserFormData.password !== newUserFormData.confirmPassword && (
                                        <small style={{ color: '#c00', marginTop: '0.25rem', display: 'block' }}>
                                            Passwords do not match
                                        </small>
                                    )}
                                </div>
                                <div className="modal-buttons">
                                    <button 
                                        className="btn-primary" 
                                        onClick={handleAddUser}
                                        disabled={!newUserFormData.password || !newUserFormData.confirmPassword || newUserFormData.password !== newUserFormData.confirmPassword || newUserFormData.password.length < 8}
                                    >
                                        Create User
                                    </button>
                                    <button className="btn-cancel" onClick={() => setAddUserStep(1)}>
                                        Back
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
