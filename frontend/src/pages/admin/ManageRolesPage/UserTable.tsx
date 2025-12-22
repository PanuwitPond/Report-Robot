/**
 * UserTable Component
 * Displays users and their roles with management actions
 */

import { UserWithRoles } from '../types/admin.types';

interface UserTableProps {
    users: UserWithRoles[];
    onAddRoleClick: (user: UserWithRoles) => void;
    onRemoveRole: (userId: string, roleName: string) => void;
}

export const UserTable = ({ users, onAddRoleClick, onRemoveRole }: UserTableProps) => {
    return (
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
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>
                                <div className="roles-badges">
                                    {user.roles.map(role => (
                                        <span key={role} className={`role-badge role-${role}`}>
                                            {role}
                                            <button
                                                className="role-remove-btn"
                                                onClick={() => onRemoveRole(user.id, role)}
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
                                    onClick={() => onAddRoleClick(user)}
                                >
                                    Add Role
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
