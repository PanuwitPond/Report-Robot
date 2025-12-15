import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
                {/* ปุ่ม Pole */}
                <button
                    className={`sidebar-tab-btn ${activeTab === 'pole' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'pole' ? null : 'pole')}
                    title="Pole"
                >
                    <img src={poleImage} alt="Pole" className="sidebar-tab-icon" />
                </button>

                {/* ปุ่ม Bot */}
                <button
                    className={`sidebar-tab-btn ${activeTab === 'bot' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'bot' ? null : 'bot')}
                    title="Bot"
                >
                    <img src={botImage} alt="Bot" className="sidebar-tab-icon" />
                </button>

                {/* ปุ่ม MIOC */}
                <button
                    className={`sidebar-tab-btn ${activeTab === 'mioc' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'mioc' ? null : 'mioc')}
                    title="MIOC"
                >
                    <img src={miocImage} alt="MIOC" className="sidebar-tab-icon" />
                </button>

                {/* ปุ่ม MROI - เพิ่มใหม่ (Menu ที่ 4) */}
                <button
                    className={`sidebar-tab-btn ${activeTab === 'mroi' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'mroi' ? null : 'mroi')}
                    title="MROI"
                >
                    <span className="sidebar-tab-text">🎥</span>
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
                            onClick={() => handleMenuClick('/export-report')}
                        >
                            Export Report
                        </button>
                        <button
                            className="sidebar-menu-link"
                            onClick={() => handleMenuClick('/report-task-config')}
                        >
                            Report Task Config
                        </button>
                        <button
                            className="sidebar-menu-link"
                            onClick={() => handleMenuClick('/report-image-config')}
                        >
                            Report Image Config
                        </button>
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

                {/* เมนูของ MROI - เพิ่มใหม่ (Menu ที่ 4) */}
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