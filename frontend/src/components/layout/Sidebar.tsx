import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import poleImage from '../../image/pole.svg';
import botImage from '../../image/bot.svg';
// อย่าลืมนำไฟล์รูปภาพ MIOC มาใส่ในโฟลเดอร์ image และเปลี่ยนชื่อไฟล์ตรงนี้ให้ถูกต้อง
import miocImage from '../../image/Logo.svg'; // ตัวอย่าง: ใช้ Logo.svg หรือเปลี่ยนเป็นไฟล์ของคุณเอง
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