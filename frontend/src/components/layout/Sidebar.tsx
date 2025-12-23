import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor } from 'lucide-react';
import poleImage from '../../image/pole.svg';
import botImage from '../../image/bot.svg';
import './Sidebar.css';
import { useAuth } from '../../contexts/AuthContext';
import { canAccessMenu } from '../../config/roleMenuMap';

export const Sidebar = () => {
    // เพิ่ม 'mioc' และ 'mroi' เข้าไปใน type ของ state
    const [activeTab, setActiveTab] = useState<'pole' | 'bot' | 'mioc' | 'mroi' | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Get the user's business role (filter out Keycloak technical roles like 'offline_access')
    const userRole = user?.roles?.find(role => ['admin', 'mioc', 'service'].includes(role)) || null;

    // Debug logging
    if (!user) {
        console.warn('[Sidebar] User not loaded yet');
    } else {
        console.log('[Sidebar] User loaded:', { username: user.username, roles: user.roles, userRole });
    }

    // Determine which top-level tabs to show based on user role
    // Use role-based access control with safe fallback
    const showPole = userRole ? canAccessMenu(userRole, 'pole') : true;   // Show if admin (safe default)
    const showBot = userRole ? canAccessMenu(userRole, 'bot') : true;     // Show if admin (safe default)
    const showMioc = userRole ? canAccessMenu(userRole, 'mioc') : true;   // Show if admin (safe default)
    const showMroi = userRole ? canAccessMenu(userRole, 'mroi') : true;   // Show if admin (safe default)

    // Debug menu visibility
    if (user) {
        console.log('[Sidebar] Menu visibility:', { showPole, showBot, showMioc, showMroi, userRole });
    }

    // Reset activeTab if it becomes invisible due to permission change
    useEffect(() => {
        if (activeTab === 'pole' && !showPole) setActiveTab(null);
        if (activeTab === 'bot' && !showBot) setActiveTab(null);
        if (activeTab === 'mioc' && !showMioc) setActiveTab(null);
        if (activeTab === 'mroi' && !showMroi) setActiveTab(null);
    }, [showPole, showBot, showMioc, showMroi]);

    const handleMenuClick = (path: string) => {
        navigate(path);
        setActiveTab(null);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-tabs">
                
                {/* --- กลุ่ม METTPOLE --- */}
                {showPole && (
                    <div className="sidebar-group">
                        <button
                            className={`sidebar-tab-btn ${activeTab === 'pole' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'pole' ? null : 'pole')}
                        >
                            <div className="sidebar-tab-content">
                                <img src={poleImage} alt="METTPOLE" className="sidebar-tab-icon" />
                                <span className="sidebar-tab-label">METTPOLE</span>
                            </div>
                        </button>
                        {/* เมนูย่อยของ Pole */}
                        <div className={`sidebar-submenu ${activeTab === 'pole' ? 'open' : ''}`}>
                            <button className="sidebar-menu-link" onClick={() => handleMenuClick('/download-report')}>
                                📂 Download Reports
                            </button>
                        </div>
                    </div>
                )}

                {/* --- กลุ่ม METTBOT --- */}
                {showBot && (
                    <div className="sidebar-group">
                        <button
                            className={`sidebar-tab-btn ${activeTab === 'bot' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'bot' ? null : 'bot')}
                        >
                            <div className="sidebar-tab-content">
                                <img src={botImage} alt="METTBOT" className="sidebar-tab-icon" />
                                <span className="sidebar-tab-label">METTBOT</span>
                            </div>
                        </button>
                        {/* เมนูย่อยของ Bot */}
                        <div className={`sidebar-submenu ${activeTab === 'bot' ? 'open' : ''}`}>
                            <button className="sidebar-menu-link" onClick={() => handleMenuClick('/robot-cleaning-report')}>
                                🧹 Cleaning Report
                            </button>
                            <button className="sidebar-menu-link" onClick={() => handleMenuClick('/robots')}>
                                🤖 Robot Management
                            </button>
                            <button className="sidebar-menu-link" onClick={() => handleMenuClick('/workforce')}>
                                👥 Workforce
                            </button>
                        </div>
                    </div>
                )}

                {/* --- ทำแบบเดียวกันกับ MIOC และ MROI --- */}
                {showMioc && (
                    <div className="sidebar-group">
                        <button
                            className={`sidebar-tab-btn ${activeTab === 'mioc' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'mioc' ? null : 'mioc')}
                        >
                            <div className="sidebar-tab-content">
                                <Monitor className="sidebar-tab-icon" size={24} />
                                <span className="sidebar-tab-label">MIOC</span>
                            </div>
                        </button>
                        <div className={`sidebar-submenu ${activeTab === 'mioc' ? 'open' : ''}`}>
                            <button className="sidebar-menu-link" onClick={() => handleMenuClick('/mioc-dashboard')}>
                                📊 MIOC Generator
                            </button>
                        </div>
                    </div>
                )}

                {showMroi && (
                    <div className="sidebar-group">
                        <button
                            className={`sidebar-tab-btn ${activeTab === 'mroi' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'mroi' ? null : 'mroi')}
                        >
                            <div className="sidebar-tab-content">
                                <span className="sidebar-tab-icon-emoji">🎥</span>
                                <span className="sidebar-tab-label">MROI</span>
                            </div>
                        </button>
                        <div className={`sidebar-submenu ${activeTab === 'mroi' ? 'open' : ''}`}>
                            <button className="sidebar-menu-link" onClick={() => {
                                setActiveTab(null);
                                window.location.href = 'http://10.2.113.35:4173/mroi';
                            }}>
                                🎥 MROI Dashboard
                            </button>
                        </div>
                    </div>
                )}

            </div>
            {/* Fallback message if no menu items are visible */}
            {!showPole && !showBot && !showMioc && !showMroi && (
                <div style={{ color: '#999', fontSize: '0.75rem', textAlign: 'center', padding: '1rem', marginTop: 'auto' }}>
                    No menu access
                </div>
            )}
        </aside>
    );
};