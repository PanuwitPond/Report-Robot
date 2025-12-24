import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form'; // [เพิ่ม]
import { useDomain } from '@/contexts';
import { taskService } from '@/services';
import { DataTable, Column } from '@/components/data-table';
import { Button, Modal, Input } from '@/components/ui'; // [เพิ่ม] Modal, Input
import type { Task, CreateTaskDTO } from '@/types'; // [เพิ่ม] CreateTaskDTO

export const TaskEditorPage = () => {
    // ไม่ต้องใช้ navigate แล้ว
    const { currentDomain } = useDomain();
    const queryClient = useQueryClient();
    
    // State สำหรับควบคุม Modal เพิ่ม Task
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // React Hook Form สำหรับ Add Task
    const { 
        register, 
        handleSubmit, 
        formState: { errors }, 
        reset 
    } = useForm<CreateTaskDTO>();

    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ['tasks', currentDomain],
        queryFn: () => taskService.getAll(currentDomain),
    });

    // Mutation สำหรับสร้าง Task
    const createTaskMutation = useMutation({
        mutationFn: (data: CreateTaskDTO) => taskService.create(data, currentDomain),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', currentDomain] });
            alert('Task created successfully!');
            setIsAddModalOpen(false); // ปิด Modal
            reset(); // ล้างค่าในฟอร์ม
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to create task');
        },
    });

    const onSubmit = (data: CreateTaskDTO) => {
        const formData = {
            ...data,
            image: data.image?.[0] as any,
        };
        createTaskMutation.mutate(formData);
    };

    const columns: Column<Task>[] = [
       { key: 'task_id', header: 'Task ID' },      // เดิม taskId
        { key: 'task_name', header: 'Task Name' },  // เดิม taskName
        { key: 'map_name', header: 'Map Name' },    // เดิม mapName
        { key: 'mode', header: 'Mode' },
        { key: 'purpose', header: 'Purpose' },
        { key: 'siteName', header: 'Site Name' },
        {
            key: 'imageUrl',
            header: 'Task Image',
            cell: (row) => {
                const getImgSrc = (path: string) => {
                    if (!path) return '';
                    if (path.startsWith('http')) return path;
                    if (path.startsWith('/api')) return path;
                    return `/api/storage/url?path=${path}`;
                };

                return row.imageUrl ? (
                    <img
                        src={getImgSrc(row.imageUrl)}
                        alt="Task"
                        style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/img/default-bot.png';
                        }}
                    />
                ) : 'No Image';
            },
        },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Task Editor</h1>
                <p>Manage robot tasks</p>
            </div>

            <div className="page-actions">
                {/* เปลี่ยน onClick เป็นเปิด Modal */}
                <Button onClick={() => setIsAddModalOpen(true)}>
                    Add New Task
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={tasks}
                isLoading={isLoading}
                emptyMessage="No tasks found. Click 'Add New Task' to create one."
            />

            {/* Modal สำหรับเพิ่ม Task */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Create New Task"
            >
                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '400px' }}>
                    <Input
                        label="Task ID"
                        {...register('taskId', { required: 'Task ID is required' })}
                        error={errors.taskId?.message}
                    />

                    <Input
                        label="Task Name"
                        {...register('taskName', { required: 'Task name is required' })}
                        error={errors.taskName?.message}
                    />

                    <Input
                        label="Map Name"
                        {...register('mapName', { required: 'Map name is required' })}
                        error={errors.mapName?.message}
                    />

                    <Input
                        label="Mode"
                        {...register('mode', { required: 'Mode is required' })}
                        error={errors.mode?.message}
                    />

                    <Input
                        label="Purpose"
                        {...register('purpose', { required: 'Purpose is required' })}
                        error={errors.purpose?.message}
                    />

                    <Input
                        label="Site Name"
                        {...register('siteName', { required: 'Site name is required' })}
                        error={errors.siteName?.message}
                    />

                    <Input
                        label="Task Image"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        {...register('image')}
                    />

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <Button type="submit" disabled={createTaskMutation.isPending}>
                            {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};