/**
 * useAsync Hook
 * Handles async operations with loading and error states
 * Generic hook for any async operation
 */

import { useState, useCallback } from 'react';

export interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

type AsyncFunction<T> = () => Promise<T>;

export const useAsync = <T,>(initialData: T | null = null) => {
    const [state, setState] = useState<AsyncState<T>>({
        data: initialData,
        loading: false,
        error: null
    });

    // Execute async function with loading/error handling
    const execute = useCallback(async (asyncFn: AsyncFunction<T>) => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const result = await asyncFn();
            setState(prev => ({ ...prev, data: result, loading: false }));
            return { success: true, data: result };
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'An error occurred';
            setState(prev => ({ ...prev, error: errorMsg, loading: false }));
            return { success: false, error: errorMsg };
        }
    }, []);

    // Set data manually
    const setData = useCallback((data: T) => {
        setState(prev => ({ ...prev, data }));
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    // Reset state
    const reset = useCallback(() => {
        setState({ data: initialData, loading: false, error: null });
    }, [initialData]);

    return {
        data: state.data,
        loading: state.loading,
        error: state.error,
        execute,
        setData,
        clearError,
        reset
    };
};
