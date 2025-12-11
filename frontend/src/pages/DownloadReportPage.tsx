import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storageService, type StorageObject } from '@/services';
import { Button } from '@/components/ui';
import { DataTable, Column } from '@/components/data-table';

export const DownloadReportPage = () => {
    const [currentFolder, setCurrentFolder] = useState('mettpole');
    const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['mettpole']);

    const { data: objects = [], isLoading, error } = useQuery({
        queryKey: ['storage-objects', currentFolder],
        queryFn: () => storageService.listObjects(currentFolder),
    });

    // Separate folders and files
    const folders = objects.filter((obj) => obj.isDir).sort((a, b) => a.name.localeCompare(b.name));
    const files = objects.filter((obj) => !obj.isDir).sort((a, b) => a.name.localeCompare(b.name));

    const handleFolderClick = (folderPath: string) => {
        // folderPath comes as 'mettpole/dad/' so we remove trailing slash
        const cleanPath = folderPath.replace(/\/$/, '');
        setCurrentFolder(cleanPath);
        setBreadcrumbs(cleanPath.split('/'));
    };

    const handleBreadcrumbClick = (index: number) => {
        const newPath = breadcrumbs.slice(0, index + 1).join('/');
        setCurrentFolder(newPath);
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    };

    const handleDownload = (objectName: string) => {
        const fullPath = currentFolder.endsWith('/') ? currentFolder + objectName : currentFolder + '/' + objectName;
        storageService.downloadFile(fullPath);
    };

    const columns: Column<StorageObject>[] = [
        {
            key: 'name',
            header: 'Name',
            cell: (row) => {
                const displayName = row.name.replace(/\/$/, '').split('/').pop() || row.name;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {row.isDir ? (
                            <>
                                <span>📁</span>
                                <button
                                    onClick={() => handleFolderClick(row.name)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#0066cc',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        fontSize: 'inherit',
                                        padding: 0,
                                    }}
                                >
                                    {displayName}
                                </button>
                            </>
                        ) : (
                            <>
                                <span>📄</span>
                                <span>{displayName}</span>
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'size',
            header: 'Size',
            cell: (row) => {
                if (row.isDir) return '-';
                const sizeInMB = (row.size / (1024 * 1024)).toFixed(2);
                return `${sizeInMB} MB`;
            },
        },
        {
            key: 'lastModified',
            header: 'Last Modified',
            cell: (row) => new Date(row.lastModified).toLocaleString('th-TH'),
        },
        {
            key: 'name',
            header: 'Actions',
            cell: (row) =>
                !row.isDir ? (
                    <Button
                        size="small"
                        onClick={() => handleDownload(row.name)}
                    >
                        Download
                    </Button>
                ) : null,
        },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Download Report</h1>
                <p>Browse and download reports from MinIO storage</p>
            </div>

            {error && (
                <div style={{ padding: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem' }}>
                    Error loading objects: {(error as any)?.message}
                </div>
            )}

            {/* Breadcrumb Navigation */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {breadcrumbs.map((crumb, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                            onClick={() => handleBreadcrumbClick(index)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: index === breadcrumbs.length - 1 ? '#333' : '#0066cc',
                                cursor: index === breadcrumbs.length - 1 ? 'default' : 'pointer',
                                textDecoration: index === breadcrumbs.length - 1 ? 'none' : 'underline',
                                fontSize: '0.95rem',
                                fontWeight: index === breadcrumbs.length - 1 ? 'bold' : 'normal',
                            }}
                        >
                            {crumb}
                        </button>
                        {index < breadcrumbs.length - 1 && <span>/</span>}
                    </div>
                ))}
            </div>

            {/* File/Folder Table */}
            <DataTable
                columns={columns}
                data={[...folders, ...files]}
                isLoading={isLoading}
                emptyMessage={`No files or folders found in ${currentFolder}`}
            />
        </div>
    );
};
