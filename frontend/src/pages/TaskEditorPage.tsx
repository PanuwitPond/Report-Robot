import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDomain } from '@/contexts';
import { taskService } from '@/services';
import { DataTable, Column } from '@/components/data-table';
import { Button } from '@/components/ui';
import type { Task } from '@/types';

export const TaskEditorPage = () => {
    const navigate = useNavigate();
    const { currentDomain } = useDomain();

    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ['tasks', currentDomain],
        queryFn: () => taskService.getAll(currentDomain),
    });

    const columns: Column<Task>[] = [
        { key: 'taskId', header: 'Task ID' },
        { key: 'taskName', header: 'Task Name' },
        { key: 'mapName', header: 'Map Name' },
        { key: 'mode', header: 'Mode' },
        { key: 'purpose', header: 'Purpose' },
        { key: 'siteName', header: 'Site Name' },
        {
    key: 'imageUrl',
    header: 'Task Image',
    cell: (row) => row.imageUrl ? (
        <img
            // เรียกผ่าน Storage Proxy ของ Backend
            src={`/api/storage/url?path=${row.imageUrl}`} 
            alt="Task"
            style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
            onError={(e) => {
                // หากโหลดไม่สำเร็จ ให้แสดงภาพ default
                (e.target as HTMLImageElement).src = '/img/default-bot.png';
            }}
        />
    ) : 'No Image',
},
];
    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Task Editor</h1>
                <p>Manage robot tasks</p>
            </div>

            <div className="page-actions">
                <Button onClick={() => navigate('/report-task-config')}>
                    Add New Task
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={tasks}
                isLoading={isLoading}
                emptyMessage="No tasks found. Click 'Add New Task' to create one."
            />
        </div>
    );
};
