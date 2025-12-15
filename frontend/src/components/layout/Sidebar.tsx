import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor } from 'lucide-react';
import poleImage from '../../image/pole.svg';
import botImage from '../../image/bot.svg';
import miocImage from '../../image/Logo.svg'; 
import './Sidebar.css';

export const Sidebar = () => {
    // เพิ่ม 'mioc' และ 'mroi' เข้าไปใน type ของ state
    const [activeTab, setActiveTab] = useState<'pole' | 'bot' | 'mioc' | 'mroi' | null>(null);
    const navigate = useNavigate();

    const handleMenuClick = (path: string) => {
        navigate(path);
        setActiveTab(null);
    };

    return (
        <aside className={`sidebar ${activeTab ? 'expanded' : ''}`}>
            <div className="sidebar-tabs">
                {/* ปุ่ม METTPOLE (1) */}
                <button
                    className={`sidebar-tab-btn ${activeTab === 'pole' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'pole' ? null : 'pole')}
                    title="METTPOLE"
                >
                    <div className="sidebar-tab-content">
                        <img src={poleImage} alt="METTPOLE" className="sidebar-tab-icon" />
                        <span className="sidebar-tab-label">METTPOLE</span>
                    </div>
                </button>

                {/* ปุ่ม METTBOT (2) */}
                <button
                    className={`sidebar-tab-btn ${activeTab === 'bot' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'bot' ? null : 'bot')}
                    title="METTBOT"
                >
                    <div className="sidebar-tab-content">
                        <img src={botImage} alt="METTBOT" className="sidebar-tab-icon" />
                        <span className="sidebar-tab-label">METTBOT</span>
                    </div>
                </button>

                {/* ปุ่ม MIOC (3) */}
                <button
                    className={`sidebar-tab-btn ${activeTab === 'mioc' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'mioc' ? null : 'mioc')}
                    title="MIOC"
                >
                    <div className="sidebar-tab-content">
                        <Monitor className="sidebar-tab-icon" size={24} />
                        <span className="sidebar-tab-label">MIOC</span>
                    </div>
                </button>

                {/* ปุ่ม MROI (4) */}
                <button
                    className={`sidebar-tab-btn ${activeTab === 'mroi' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'mroi' ? null : 'mroi')}
                    title="MROI"
                >
                    <div className="sidebar-tab-content">
                        <span className="sidebar-tab-icon-emoji">🎥</span>
                        <span className="sidebar-tab-label">MROI</span>
                    </div>
                </button>
            </div>

            <nav className={`sidebar-menu ${activeTab ? 'visible' : ''}`}>
                {/* เมนูของ Pole */}
                {activeTab === 'pole' && (
                    <>
                        <button
                            className="sidebar-menu-link"
                            onClick={() => handleMenuClick('/download-report')}
                        >
                            📂 Download Reports (Storage)
                        </button>
                    </>
                )}

                {/* เมนูของ Bot */}
                {activeTab === 'bot' && (
                    <>

                        <button
                            className="sidebar-menu-link"
                            onClick={() => handleMenuClick('/robot-cleaning-report')}
                        >
                            🧹 Robot Cleaning Report
                        </button>

                        <button
                            className="sidebar-menu-link"
                            onClick={() => handleMenuClick('/robots')}
                        >
                            🤖 Robot Management
                        </button>

                        <button
                            className="sidebar-menu-link"
                            onClick={() => handleMenuClick('/workforce')}
                        >
                            👥 Workforce Departments
                        </button>

                        <div className="sidebar-section-divider"></div>

                    </>
                )}

                {/* เมนูของ MIOC */}
                {activeTab === 'mioc' && (
                    <>
                        <button
                            className="sidebar-menu-link"
                            onClick={() => handleMenuClick('/mioc-dashboard')}
                        >
                            MIOC Dashboard
                        </button>
                    </>
                )}

                {/* เมนูของ MROI (Menu ที่ 4) */}
                {activeTab === 'mroi' && (
                    <>
                        <button
                            className="sidebar-menu-link"
                            onClick={() => handleMenuClick('/mroi')}
                        >
                            🎥 MROI Dashboard
                        </button>
                        <button
                            className="sidebar-menu-link"
                            onClick={() => handleMenuClick('/mroi/devices')}
                        >
                            📹 Manage Devices
                        </button>
                    </>
                )}
            </nav>
        </aside>
    );
};