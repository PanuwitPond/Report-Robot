import { ReactNode } from 'react';
import './DataTable.css';

export interface Column<T> {
    key: keyof T | string;
    header: string;
    cell?: (row: T) => ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (row: T) => void;
    isLoading?: boolean;
    emptyMessage?: string;
}

export function DataTable<T>({
    columns,
    data,
    onRowClick,
    isLoading = false,
    emptyMessage = 'No data available',
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="data-table-loading">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="data-table-empty">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="data-table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={String(col.key)} className={col.sortable ? 'sortable' : ''}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr
                            key={idx}
                            onClick={() => onRowClick?.(row)}
                            className={onRowClick ? 'clickable' : ''}
                        >
                            {columns.map((col) => (
                                <td key={String(col.key)}>
                                    {col.cell ? col.cell(row) : String(row[col.key as keyof T] ?? '')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
