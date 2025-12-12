import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import poleImage from '../../image/pole.svg';
import botImage from '../../image/bot.svg';
// สมมติว่าคุณมี icon สำหรับ mroi หรือใช้ icon เดิมชั่วคราว
// import mroiImage from '../../image/mroi.svg'; 
import './Sidebar.css';

export const Sidebar = () => {
    // 1. เพิ่ม 'mroi' เข้าไปใน state
    const [activeTab, setActiveTab] = useState<'pole' | 'bot' | 'mroi' | null>(null);
    const navigate = useNavigate();

    const handleMenuClick = (path: string) => {
        navigate(path);
        // ถ้าต้องการให้ Sidebar หุบหลังจากกดเลือกเมนู ให้ uncomment บรรทัดล่าง
        // setActiveTab(null); 
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
                
                {/* 2. เพิ่มปุ่ม MROI ต่อจาก Bot */}
                <button
                    className={`sidebar-tab-btn ${activeTab === 'mroi' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'mroi' ? null : 'mroi')}
                    title="MROI"
                >
                    {/* ใช้ icon mroiImage หรือตัวอักษร M แทนไปก่อน */}
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>M</div> 
                </button>
            </div>

            {/* 3. จัดการแสดงผลเมนูตาม Tab ที่เลือก */}
            <nav className={`sidebar-menu ${activeTab ? 'visible' : ''}`}>
                {activeTab === 'mroi' ? (
                    // เมนูสำหรับ MROI
                    <>
                        <button
                            className="sidebar-menu-link"
                            onClick={() => handleMenuClick('/mroi/devices')}
                        >
                            All Devices
                        </button>
                        {/* เพิ่มเมนูอื่นๆ ของ MROI ถ้ามี */}
                    </>
                ) : (
                    // เมนูเดิมสำหรับ Pole และ Bot (Report Web)
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