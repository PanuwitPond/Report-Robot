import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDomain } from '@/contexts';
import { reportService } from '@/services';
import { DataTable, Column } from '@/components/data-table';
import { Button, Input } from '@/components/ui';
import type { Report } from '@/types';
import './ExportReportPage.css';

export const ExportReportPage = () => {
    const { currentDomain } = useDomain();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: reports = [], isLoading } = useQuery({
        queryKey: ['reports', currentDomain, searchTerm],
        queryFn: () => reportService.getAll(currentDomain, { searchTerm }),
    });

    const handleDownload = async (report: Report) => {
        try {
            const blob = await reportService.download(report.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = report.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download report');
        }
    };

    const columns: Column<Report>[] = [
        { key: 'name', header: 'Report Name' },
        { key: 'fileType', header: 'File Type' },
        {
            key: 'createdAt',
            header: 'Created At',
            cell: (row) => new Date(row.createdAt).toLocaleString(),
        },
        {
            key: 'id',
            header: 'Actions',
            cell: (row) => (
                <Button size="small" onClick={() => handleDownload(row)}>
                    Download
                </Button>
            ),
        },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Export Report</h1>
                <p>Download reports from MinIO storage</p>
            </div>

            <div className="page-filters">
                <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <DataTable
                columns={columns}
                data={reports}
                isLoading={isLoading}
                emptyMessage="No reports found"
            />
        </div>
    );
};
