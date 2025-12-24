import { ReactNode } from 'react';
import { createPortal } from 'react-dom'; // 1. เพิ่ม import createPortal
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    if (!isOpen) return null;

    // 2. ใช้ createPortal เพื่อย้าย Modal ไป render ที่ body
    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    {title && <h2 className="modal-title">{title}</h2>}
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>,
        document.body // ระบุปลายทางเป็น body
    );
};