import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import './UserMenu.css';

export const UserMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/signin';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleManageRoles = () => {
        setIsOpen(false);
        navigate('/admin/manage-roles');
    };

    const isAdmin = user?.roles?.includes('ADMIN');

    return (
        <div className="user-menu">
            <button className="user-menu-button" onClick={() => setIsOpen(!isOpen)}>
                <div className="user-avatar">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
            </button>

            {isOpen && (
                <div className="user-menu-dropdown">
                    <div className="user-info">
                        <p className="user-name">{user?.username || 'User'}</p>
                        <p className="user-email">{user?.email || ''}</p>
                    </div>
                    <div className="user-menu-divider"></div>
                    {isAdmin && (
                        <>
                            <button className="user-menu-item" onClick={handleManageRoles}>
                                <span className="menu-icon">👥</span>
                                Manage Roles
                            </button>
                            <div className="user-menu-divider"></div>
                        </>
                    )}
                    <button className="user-menu-item logout-item" onClick={handleLogout}>
                        <span className="menu-icon">🚪</span>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};
