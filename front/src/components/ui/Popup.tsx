import React from 'react';

interface PopupProps {
    trigger: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ trigger, onClose, children }) => {
    if (!trigger) return null;

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
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex' as const,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        zIndex: 1000,
    },
    popup: {
        position: 'relative' as const,
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        width: '400px',
        maxWidth: '90%',
        maxHeight: '80vh',
        overflow: 'auto' as const,
    },
    closeButton: {
        position: 'absolute' as const,
        top: '10px',
        right: '10px',
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
    },
};

export default Popup;
