import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storageService, type MinioFile } from '@/services';
import { Button } from '@/components/ui';
import './DownloadReportPage.css';

// ไอคอน Folder
const FolderIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="#FFC107" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
);

// ไอคอน File
const FileIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="#E0E0E0" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
    </svg>
);

export const DownloadReportPage = () => {
    const [currentPath, setCurrentPath] = useState<string>('mettpole/');

    const { data, isLoading } = useQuery({
        queryKey: ['storage-files'],
        queryFn: () => storageService.listFiles(''),
    });

    const { folders, files } = useMemo(() => {
        if (!data?.files) return { folders: [], files: [] };

        const currentFolders = new Set<string>();
        const currentFiles: MinioFile[] = [];

        data.files.forEach((file) => {
            if (!file.name.startsWith(currentPath)) return;

            const relativeName = file.name.slice(currentPath.length);
            const parts = relativeName.split('/');

            if (parts.length > 1) {
                currentFolders.add(parts[0]);
            } else {
                if (parts[0] !== '') {
                    currentFiles.push(file);
                }
            }
        });

        return {
            folders: Array.from(currentFolders).sort(),
            files: currentFiles.sort((a, b) => b.lastModified.localeCompare(a.lastModified))
        };
    }, [data, currentPath]);

    const handleDownload = async (file: MinioFile) => {
        try {
            const url = await storageService.getFileUrl(file.name);
            window.open(url, '_blank');
        } catch (error) {
            alert('Failed to open file');
        }
    };

    const handleNavigate = (folderName: string) => {
        setCurrentPath((prev) => prev + folderName + '/');
    };

    const handleBreadcrumbClick = (index: number) => {
        const parts = currentPath.split('/').filter(p => p);
        const newPath = parts.slice(0, index + 1).join('/') + '/';
        setCurrentPath(newPath);
    };

    const pathParts = currentPath.split('/').filter(p => p);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Storage Browser (METTPOLE)</h1>
                <p>Browse and download files from MinIO</p>
            </div>

            <div className="breadcrumb">
                {pathParts.map((part, index) => (
                    <span key={index} className="breadcrumb-wrapper">
                        {index > 0 && <span className="breadcrumb-separator">/</span>}
                        
                        <span 
                            className={`breadcrumb-item ${index === pathParts.length - 1 ? 'active' : ''}`}
                            onClick={() => handleBreadcrumbClick(index)}
                        >
                            {index === 0 ? (
                                <span>📂 {part.toUpperCase()}</span>
                            ) : (
                                part
                            )}
                        </span>
                    </span>
                ))}
            </div>

            {isLoading ? (
                <div className="loading">Loading files...</div>
            ) : (
                <div className="file-grid">
                    {folders.map((folder) => (
                        <div 
                            key={folder} 
                            className="grid-item folder-item"
                            onClick={() => handleNavigate(folder)}
                        >
                            <FolderIcon />
                            <span className="item-name">{folder}</span>
                        </div>
                    ))}

                    {files.map((file) => (
                        <div key={file.name} className="grid-item file-item">
                            <div className="file-icon-wrapper">
                                <FileIcon />
                            </div>
                            <div className="file-info">
                                <span className="item-name" title={file.name.split('/').pop()}>
                                    {file.name.split('/').pop()}
                                </span>
                                <span className="item-size">
                                    {(file.size / 1024).toFixed(1)} KB
                                </span>
                                <Button 
                                    size="small" 
                                    className="download-btn"
                                    onClick={() => handleDownload(file)}
                                >
                                    Download
                                </Button>
                            </div>
                        </div>
                    ))}

                    {folders.length === 0 && files.length === 0 && (
                        <div className="empty-state">This folder is empty</div>
                    )}
                </div>
            )}
        </div>
    );
};
