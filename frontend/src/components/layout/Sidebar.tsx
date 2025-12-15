import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import poleImage from '../../image/pole.svg';
import botImage from '../../image/bot.svg';
import miocImage from '../../image/Logo.svg'; 
import './Sidebar.css';

export const Sidebar = () => {
    // เพิ่ม 'mioc' เข้าไปใน type ของ state
    const [activeTab, setActiveTab] = useState<'pole' | 'bot' | 'mioc' | null>(null);
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

                {/* --- ส่วนที่เพิ่มใหม่: ปุ่ม MIOC --- */}
                <button
                    className={`sidebar-tab-btn ${activeTab === 'mioc' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'mioc' ? null : 'mioc')}
                    title="MIOC"
                >
                    <img src={miocImage} alt="MIOC" className="sidebar-tab-icon" />
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

                {/* --- ส่วนที่เพิ่มใหม่: เมนูของ MIOC --- */}
                {activeTab === 'mioc' && (
                    <>
                        <button
                            className="sidebar-menu-link"
                            onClick={() => handleMenuClick('/mioc-dashboard')}
                        >
                            MIOC Dashboard
                        </button>
                        {/* คุณสามารถเพิ่มปุ่มเมนูอื่นๆ ของ MIOC ต่อท้ายตรงนี้ได้ */}
                    </>
                )}
            </nav>
        </aside>
    );
};