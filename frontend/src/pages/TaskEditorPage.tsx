import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2'; // [1] เพิ่ม SweetAlert2
import { useDomain } from '@/contexts';
import { taskService } from '@/services';
import { DataTable, Column } from '@/components/data-table';
import { Button, Modal, Input, Select } from '@/components/ui';
import type { Task, CreateTaskDTO } from '@/types';

export const TaskEditorPage = () => {
    const { currentDomain } = useDomain();
    const queryClient = useQueryClient();
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

    const { data: sites = [] } = useQuery({
        queryKey: ['robot-sites'],
        queryFn: () => taskService.getSites(),
    });

    // Mutation: Create Task
    const createTaskMutation = useMutation({
        mutationFn: (data: CreateTaskDTO) => taskService.create(data, currentDomain),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', currentDomain] });
            
            // [2] แจ้งเตือนสำเร็จสวยๆ
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Task created successfully',
                showConfirmButton: false,
                timer: 1500
            });

            setIsAddModalOpen(false);
            reset();
        },
        onError: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to create task',
            });
        },
    });

    // Mutation: Delete Task
    const deleteTaskMutation = useMutation({
        mutationFn: (id: string) => taskService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', currentDomain] });
            
            // [3] แจ้งเตือนลบสำเร็จ
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Task has been deleted.',
                showConfirmButton: false,
                timer: 1500
            });
        },
        onError: (error: any) => {
            console.error('Delete error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to delete task',
            });
        },
    });

    const onSubmit = (data: CreateTaskDTO) => {
        const formData = {
            ...data,
            image: data.image?.[0] as any,
        };
        createTaskMutation.mutate(formData);
    };

    // ฟังก์ชันสำหรับกดปุ่มลบ (เรียก SweetAlert Confirm)
    const handleDeleteClick = (row: any) => {
        const idToDelete = row.task_id || row.taskId; 
        const nameToDelete = row.task_name || row.taskName;

        if (!idToDelete) {
            Swal.fire('Error', 'Task ID not found', 'error');
            return;
        }

        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete task "${nameToDelete}". This cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteTaskMutation.mutate(idToDelete);
            }
        });
    };

    const columns: Column<Task>[] = [
        { key: 'task_id', header: 'Task ID' },     
        { key: 'task_name', header: 'Task Name' }, 
        { key: 'map_name', header: 'Map Name' },   
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
                            const target = e.target as HTMLImageElement;
                            if (!target.dataset.triedProxy && row.imageUrl && row.imageUrl.startsWith('http')) {
                                target.dataset.triedProxy = 'true';
                                const filename = row.imageUrl.split('/').pop();
                                if (filename) target.src = `/api/storage/url?path=task_image/${filename}`;
                            } else {
                                target.src = '/img/default-bot.png';
                            }
                        }}
                    />
                ) : 'No Image';
            },
        },
        {
            key: 'actions',
            header: 'Actions',
            cell: (row: any) => (
                <Button
                    size="small"
                    variant="danger"
                    onClick={() => handleDeleteClick(row)}
                    disabled={deleteTaskMutation.isPending}
                >
                    {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
            ),
        },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Task Editor</h1>
                <p>Manage robot tasks</p>
            </div>

            <div className="page-actions">
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

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Task / Robot Fleet"
            >
                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '400px' }}>
                    <Input
                        label="Task ID"
                        placeholder="e.g. TASK-101"
                        {...register('taskId', { required: 'Task ID is required' })}
                        error={errors.taskId?.message}
                    />
                    <Input
                        label="Task Name"
                        placeholder="e.g. Patrol Sector A"
                        {...register('taskName', { required: 'Task name is required' })}
                        error={errors.taskName?.message}
                    />
                    <Input
                        label="Map Name"
                        placeholder="e.g. Warehouse_L1"
                        {...register('mapName', { required: 'Map name is required' })}
                        error={errors.mapName?.message}
                    />
                    <Input
                        label="Mode"
                        placeholder="e.g. Patrol"
                        {...register('mode', { required: 'Mode is required' })}
                        error={errors.mode?.message}
                    />
                    <Input
                        label="Purpose"
                        placeholder="e.g. Security check"
                        {...register('purpose', { required: 'Purpose is required' })}
                        error={errors.purpose?.message}
                    />
                    <Select
                        label="Site"
                        {...register('siteName', { required: 'Site is required' })}
                        error={errors.siteName?.message}
                    >
                        <option value="">Select a site...</option>
                        {sites.map(site => (
                            <option key={site} value={site}>{site}</option>
                        ))}
                    </Select>
                    <Input
                        label="Task Image"
                        type="file"
                        accept="image/*"
                        {...register('image')}
                    />
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <Button type="submit" disabled={createTaskMutation.isPending}>
                            {createTaskMutation.isPending ? 'Adding...' : 'Confirm'}
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