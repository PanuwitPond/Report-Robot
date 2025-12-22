/**
 * AddUserModal Component
 * Multi-step modal for adding new users
 */

import { AddUserStep } from '../types/admin.types';
import { ADD_USER_MODAL_CONFIG, ADMIN_MESSAGES } from '../constants/admin.constants';

interface AddUserModalProps {
    isOpen: boolean;
    currentStep: AddUserStep;
    formData: any;
    emailVerified: boolean;
    isStep1Complete: boolean;
    isStep2Complete: boolean;
    onFieldChange: (field: string, value: string) => void;
    onToggleEmailVerify: () => void;
    onNext: () => void;
    onBack: () => void;
    onClose: () => void;
}

export const AddUserModal = ({
    isOpen,
    currentStep,
    formData,
    emailVerified,
    isStep1Complete,
    isStep2Complete,
    onFieldChange,
    onToggleEmailVerify,
    onNext,
    onBack,
    onClose
}: AddUserModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {currentStep === 1 ? (
                    // Step 1: Basic Information
                    <>
                        <h2>{ADD_USER_MODAL_CONFIG.STEP_1_TITLE}</h2>
                        
                        <div className="form-group">
                            <label htmlFor="username">Username *</label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Enter username"
                                value={formData.username}
                                onChange={e => onFieldChange('username', e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter email"
                                    value={formData.email}
                                    onChange={e => onFieldChange('email', e.target.value)}
                                    className="form-input"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    className={`btn-verify ${emailVerified ? 'btn-verify-checked' : ''}`}
                                    onClick={onToggleEmailVerify}
                                    title={emailVerified ? 'Email verified' : 'Click to verify email'}
                                >
                                    {emailVerified ? '✓ Verified' : 'Verify'}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                id="firstName"
                                type="text"
                                placeholder="Enter first name"
                                value={formData.firstName}
                                onChange={e => onFieldChange('firstName', e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                id="lastName"
                                type="text"
                                placeholder="Enter last name"
                                value={formData.lastName}
                                onChange={e => onFieldChange('lastName', e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="modal-buttons">
                            <button
                                className="btn-primary"
                                onClick={onNext}
                                disabled={!isStep1Complete}
                            >
                                {ADD_USER_MODAL_CONFIG.NEXT_BUTTON}
                            </button>
                            <button className="btn-cancel" onClick={onClose}>
                                {ADD_USER_MODAL_CONFIG.CANCEL_BUTTON}
                            </button>
                        </div>
                    </>
                ) : (
                    // Step 2: Set Password
                    <>
                        <h2>{ADD_USER_MODAL_CONFIG.STEP_2_TITLE}</h2>

                        <div className="form-group">
                            <label>User Info</label>
                            <div className="user-info-display">
                                <p>
                                    <strong>Username:</strong> {formData.username}
                                </p>
                                <p>
                                    <strong>Email:</strong> {formData.email}
                                </p>
                                {formData.firstName && (
                                    <p>
                                        <strong>First Name:</strong> {formData.firstName}
                                    </p>
                                )}
                                {formData.lastName && (
                                    <p>
                                        <strong>Last Name:</strong> {formData.lastName}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password *</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter password (min 8 characters)"
                                value={formData.password}
                                onChange={e => onFieldChange('password', e.target.value)}
                                className="form-input"
                            />
                            <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
                                {ADD_USER_MODAL_CONFIG.STEP_2_PASSWORD_HINT}
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password *</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={e => onFieldChange('confirmPassword', e.target.value)}
                                className="form-input"
                            />
                            {formData.password &&
                                formData.confirmPassword &&
                                formData.password !== formData.confirmPassword && (
                                    <small style={{ color: '#c00', marginTop: '0.25rem', display: 'block' }}>
                                        {ADMIN_MESSAGES.VALIDATION_PASSWORD_MISMATCH}
                                    </small>
                                )}
                        </div>

                        <div className="modal-buttons">
                            <button
                                className="btn-primary"
                                onClick={onNext}
                                disabled={!isStep2Complete}
                            >
                                {ADD_USER_MODAL_CONFIG.CREATE_BUTTON}
                            </button>
                            <button className="btn-cancel" onClick={onBack}>
                                {ADD_USER_MODAL_CONFIG.BACK_BUTTON}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
