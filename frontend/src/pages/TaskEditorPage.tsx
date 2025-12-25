import { useState, useMemo } from 'react'; // [1] เพิ่ม useMemo
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { useDomain } from '@/contexts';
import { taskService } from '@/services';
import { DataTable, Column } from '@/components/data-table';
import { Button, Modal, Input, Select } from '@/components/ui';
import type { Task, CreateTaskDTO } from '@/types';

// Type สำหรับ Sort Config
type SortConfig = {
    key: keyof Task | '';
    direction: 'asc' | 'desc';
};

export const TaskEditorPage = () => {
    const { currentDomain } = useDomain();
    const queryClient = useQueryClient();
    
    // State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // [2] เพิ่ม State สำหรับ Sort
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

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

    // [3] Logic การ Sort + Filter (ใช้ useMemo เพื่อประสิทธิภาพ)
    const processedTasks = useMemo(() => {
        // 1. Filter ก่อน
        let filtered = tasks.filter((task) => {
            const term = searchTerm.toLowerCase();
            // เช็ค type guard เพื่อความปลอดภัย
            const idMatch = String(task.task_id || '').toLowerCase().includes(term);
            const nameMatch = String(task.task_name || '').toLowerCase().includes(term);
            return idMatch || nameMatch;
        });

        // 2. Sort ต่อ
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                // ดึงค่าตาม key ที่เลือก (ใช้ as any ถ้า key dynamic มาก แต่ตรงนี้เรารู้ key อยู่แล้ว)
                const aValue = a[sortConfig.key] as string || '';
                const bValue = b[sortConfig.key] as string || '';

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return filtered;
    }, [tasks, searchTerm, sortConfig]);

    // ฟังก์ชันสำหรับเปลี่ยนการ Sort เมื่อกดหัวตาราง
    const requestSort = (key: keyof Task) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Helper สำหรับแสดงลูกศร Sort
    const getSortIcon = (key: keyof Task) => {
        if (sortConfig.key !== key) return <span style={{ opacity: 0.3, marginLeft: 5 }}>↕</span>;
        return sortConfig.direction === 'asc' ? <span style={{ marginLeft: 5 }}>▲</span> : <span style={{ marginLeft: 5 }}>▼</span>;
    };

    // Mutation: Create
    const createTaskMutation = useMutation({
        mutationFn: (data: CreateTaskDTO) => taskService.create(data, currentDomain),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', currentDomain] });
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

    // Mutation: Delete
    const deleteTaskMutation = useMutation({
        mutationFn: (id: string) => taskService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', currentDomain] });
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Task has been deleted.',
                showConfirmButton: false,
                timer: 1500
            });
        },
        onError: (error: any) => {
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

    // [4] กำหนด Columns พร้อม Header ที่กดได้
    const columns: Column<Task>[] = [
        { key: 'task_id', header: 'Task ID' },     
        { 
            key: 'task_name', 
            // เปลี่ยน header จาก string เป็น JSX เพื่อให้กดได้
            header: (
                <div 
                    onClick={() => requestSort('task_name')} 
                    style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' }}
                >
                    Task Name {getSortIcon('task_name')}
                </div>
            ) as any // cast as any หาก Column type บังคับเป็น string
        }, 
        { key: 'map_name', header: 'Map Name' },   
        { key: 'mode', header: 'Mode' },
        { key: 'purpose', header: 'Purpose' },
        { 
            key: 'siteName', 
            // เปลี่ยน header ให้กด Sort ได้เช่นกัน
            header: (
                <div 
                    onClick={() => requestSort('siteName')} 
                    style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' }}
                >
                    Site Name {getSortIcon('siteName')}
                </div>
            ) as any
        },
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
                    Delete
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

            <div className="page-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
                <Input
                    placeholder="Search by Task ID or Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ maxWidth: '300px' }}
                />
                
                <Button onClick={() => setIsAddModalOpen(true)}>
                    Add New Task
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={processedTasks} // [5] ส่งข้อมูลที่ Sort แล้วไปแสดง
                isLoading={isLoading}
                emptyMessage={searchTerm ? "No tasks match your search." : "No tasks found. Click 'Add New Task' to create one."}
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