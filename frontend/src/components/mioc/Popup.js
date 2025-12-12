import React from 'react';

const Popup = ({ trigger, onClose, children }) => {
    if (!trigger) return null; // ไม่แสดงผลหาก trigger = false

    return (
        <div style={styles.overlay}>
            <div style={styles.popup}>
                <button style={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <div>{children}</div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // พื้นหลังโปร่งแสง
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, // ให้อยู่ด้านบนสุด
    },
    popup: {
        position: 'relative', // เพื่อจัดการตำแหน่งปุ่มปิด
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        width: '400px',
        maxWidth: '90%',
        maxHeight: '80vh', // จำกัดความสูงของ Popup ไว้ 80% ของหน้าจอ
        overflow: 'auto', // เปิดการเลื่อนเมื่อเนื้อหาเกินความสูง
    },
    closeButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
    },
};


export default Popup;
