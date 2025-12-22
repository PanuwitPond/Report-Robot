/**
 * usePagination Hook
 * Generic pagination for any list of items
 */

import { useState, useMemo, useCallback } from 'react';

export interface PaginationConfig {
    pageSize: number;
    currentPage: number;
}

export const usePagination = <T,>(
    items: T[],
    pageSize: number = 10
) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate total pages
    const totalPages = useMemo(() => {
        return Math.ceil(items.length / pageSize);
    }, [items.length, pageSize]);

    // Get paginated items
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return items.slice(startIndex, endIndex);
    }, [items, currentPage, pageSize]);

    // Go to specific page
    const goToPage = useCallback((page: number) => {
        const validPage = Math.max(1, Math.min(page, totalPages || 1));
        setCurrentPage(validPage);
    }, [totalPages]);

    // Go to next page
    const nextPage = useCallback(() => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    }, [totalPages]);

    // Go to previous page
    const prevPage = useCallback(() => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    }, []);

    // Check if can go to next page
    const canGoNext = useCallback(() => {
        return currentPage < totalPages;
    }, [currentPage, totalPages]);

    // Check if can go to previous page
    const canGoPrev = useCallback(() => {
        return currentPage > 1;
    }, [currentPage]);

    // Reset to first page
    const reset = useCallback(() => {
        setCurrentPage(1);
    }, []);

    // Get page info
    const pageInfo = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize + 1;
        const endIndex = Math.min(currentPage * pageSize, items.length);
        return {
            startIndex,
            endIndex,
            currentPage,
            totalPages,
            totalItems: items.length,
            pageSize,
            itemsOnPage: paginatedItems.length
        };
    }, [currentPage, pageSize, items.length, paginatedItems.length, totalPages]);

    return {
        paginatedItems,
        currentPage,
        totalPages,
        pageInfo,
        goToPage,
        nextPage,
        prevPage,
        canGoNext,
        canGoPrev,
        reset
    };
};
