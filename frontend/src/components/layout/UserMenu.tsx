import { useState } from 'react';
import { useAuth } from '@/contexts';
import './UserMenu.css';

export const UserMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/signin';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

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
                    <button className="user-menu-item" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};
