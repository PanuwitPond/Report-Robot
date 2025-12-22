/**
 * useFormData Hook
 * Generic form state management for any form
 */

import { useState, useCallback } from 'react';

export const useFormData = <T extends Record<string, any>>(initialData: T) => {
    const [formData, setFormData] = useState<T>(initialData);

    // Update single field
    const updateField = useCallback((field: keyof T, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Update multiple fields at once
    const updateFields = useCallback((updates: Partial<T>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    }, []);

    // Reset to initial state
    const reset = useCallback(() => {
        setFormData(initialData);
    }, [initialData]);

    // Get field value
    const getField = useCallback((field: keyof T) => {
        return formData[field];
    }, [formData]);

    // Check if field has value
    const hasField = useCallback((field: keyof T) => {
        return !!formData[field];
    }, [formData]);

    // Check if form is dirty (has changes)
    const isDirty = useCallback(() => {
        return JSON.stringify(formData) !== JSON.stringify(initialData);
    }, [formData, initialData]);

    return {
        formData,
        setFormData,
        updateField,
        updateFields,
        reset,
        getField,
        hasField,
        isDirty
    };
};
