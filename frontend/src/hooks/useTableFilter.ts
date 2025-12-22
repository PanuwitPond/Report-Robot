/**
 * useTableFilter Hook
 * Generic table filtering for any list of items
 */

import { useState, useMemo, useCallback } from 'react';

export interface FilterConfig<T> {
    searchFields?: (keyof T)[];
    searchText: string;
    [key: string]: any;
}

type FilterFn<T> = (item: T, config: FilterConfig<T>) => boolean;

export const useTableFilter = <T,>(
    items: T[],
    filterFn?: FilterFn<T>,
    defaultFilters: Partial<FilterConfig<T>> = {}
) => {
    const [filters, setFilters] = useState<FilterConfig<T>>({
        searchText: '',
        ...defaultFilters
    } as FilterConfig<T>);

    // Apply filters
    const filteredItems = useMemo(() => {
        if (!filterFn) return items;
        return items.filter(item => filterFn(item, filters));
    }, [items, filters, filterFn]);

    // Update filter
    const setFilter = useCallback((key: keyof FilterConfig<T>, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    // Update search text
    const setSearchText = useCallback((text: string) => {
        setFilters(prev => ({ ...prev, searchText: text }));
    }, []);

    // Update multiple filters
    const setFilters_ = useCallback((updates: Partial<FilterConfig<T>>) => {
        setFilters(prev => ({ ...prev, ...updates }));
    }, []);

    // Reset filters
    const resetFilters = useCallback(() => {
        setFilters({ searchText: '', ...defaultFilters } as FilterConfig<T>);
    }, [defaultFilters]);

    // Check if filters are active
    const hasActiveFilters = useCallback(() => {
        return Object.values(filters).some(v => v !== '');
    }, [filters]);

    return {
        filters,
        filteredItems,
        setFilter,
        setSearchText,
        setFilters: setFilters_,
        resetFilters,
        hasActiveFilters,
        itemCount: filteredItems.length
    };
};
