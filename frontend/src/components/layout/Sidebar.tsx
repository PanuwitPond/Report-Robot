import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import poleImage from '../../image/pole.svg';
import botImage from '../../image/bot.svg';
import './Sidebar.css';

export const Sidebar = () => {
    const [activeTab, setActiveTab] = useState<'pole' | 'bot' | null>(null);
    const navigate = useNavigate();

    const handleMenuClick = (path: string) => {
        navigate(path);
        setActiveTab(null);
    };

    return (
        <aside className={`sidebar ${activeTab ? 'expanded' : ''}`}>
            <div className="sidebar-tabs">
                <button
                    className={`sidebar-tab-btn ${activeTab === 'pole' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'pole' ? null : 'pole')}
                    title="Pole"
                >
                    <img src={poleImage} alt="Pole" className="sidebar-tab-icon" />
                </button>
                <button
                    className={`sidebar-tab-btn ${activeTab === 'bot' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'bot' ? null : 'bot')}
                    title="Bot"
                >
                    <img src={botImage} alt="Bot" className="sidebar-tab-icon" />
                </button>
            </div>
            <nav className={`sidebar-menu ${activeTab ? 'visible' : ''}`}>
                {activeTab === 'pole' && (
                    <>
                        <button
                            className="sidebar-menu-link"
                            onClick={() => handleMenuClick('/download-report')}
                        >
                            📂 Download Reports (Storage)
                        </button>
                        
                        {/* คุณสามารถย้ายเมนูอื่นๆ มาใส่เงื่อนไขนี้ได้ถ้าต้องการให้มันแยกกันชัดเจน */}
                    </>
                )}
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
            </nav>
        </aside>
    );
};
