/**
 * useAddUserForm Hook
 * Handles multi-step add user form logic
 */

import { useState, useCallback } from 'react';
import { AddUserFormData, AddUserStep } from '../types/admin.types';
import {
    INITIAL_ADD_USER_FORM,
    ADMIN_MESSAGES,
    PASSWORD_MIN_LENGTH
} from '../constants/admin.constants';

export const useAddUserForm = () => {
    const [formData, setFormData] = useState<AddUserFormData>(INITIAL_ADD_USER_FORM);
    const [currentStep, setCurrentStep] = useState<AddUserStep>(1);
    const [emailVerified, setEmailVerified] = useState(false);

    // Validate step 1 (basic info)
    const validateStep1 = useCallback(() => {
        if (!formData.username || !formData.email) {
            return { valid: false, message: ADMIN_MESSAGES.VALIDATION_USERNAME_REQUIRED };
        }
        if (!emailVerified) {
            return { valid: false, message: ADMIN_MESSAGES.VALIDATION_EMAIL_REQUIRED };
        }
        return { valid: true };
    }, [formData.username, formData.email, emailVerified]);

    // Validate step 2 (password)
    const validateStep2 = useCallback(() => {
        if (!formData.password || !formData.confirmPassword) {
            return { valid: false, message: ADMIN_MESSAGES.VALIDATION_PASSWORD_REQUIRED };
        }
        if (formData.password !== formData.confirmPassword) {
            return { valid: false, message: ADMIN_MESSAGES.VALIDATION_PASSWORD_MISMATCH };
        }
        if (formData.password.length < PASSWORD_MIN_LENGTH) {
            return { valid: false, message: ADMIN_MESSAGES.VALIDATION_PASSWORD_MIN };
        }
        return { valid: true };
    }, [formData.password, formData.confirmPassword]);

    // Move to next step or submit
    const handleNext = useCallback(async (onSubmit: () => Promise<void>) => {
        if (currentStep === 1) {
            const validation = validateStep1();
            if (!validation.valid) {
                return { success: false, message: validation.message };
            }
            setCurrentStep(2);
            return { success: true };
        } else {
            const validation = validateStep2();
            if (!validation.valid) {
                return { success: false, message: validation.message };
            }
            try {
                await onSubmit();
                return { success: true };
            } catch (err: any) {
                return { success: false, message: err.message };
            }
        }
    }, [currentStep, validateStep1, validateStep2]);

    // Go back to previous step
    const handleBack = useCallback(() => {
        if (currentStep === 2) {
            setCurrentStep(1);
        }
    }, [currentStep]);

    // Update form field
    const updateField = useCallback((field: keyof AddUserFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Reset form
    const reset = useCallback(() => {
        setFormData(INITIAL_ADD_USER_FORM);
        setCurrentStep(1);
        setEmailVerified(false);
    }, []);

    // Toggle email verification
    const toggleEmailVerification = useCallback(() => {
        setEmailVerified(prev => !prev);
    }, []);

    // Check if step 1 is complete
    const isStep1Complete = useCallback(() => {
        return !!formData.username && !!formData.email && emailVerified;
    }, [formData.username, formData.email, emailVerified]);

    // Check if step 2 is complete
    const isStep2Complete = useCallback(() => {
        return (
            !!formData.password &&
            !!formData.confirmPassword &&
            formData.password === formData.confirmPassword &&
            formData.password.length >= PASSWORD_MIN_LENGTH
        );
    }, [formData.password, formData.confirmPassword]);

    return {
        // State
        formData,
        currentStep,
        emailVerified,

        // Methods
        updateField,
        toggleEmailVerification,
        handleNext,
        handleBack,
        reset,

        // Validation
        validateStep1,
        validateStep2,
        isStep1Complete,
        isStep2Complete
    };
};
