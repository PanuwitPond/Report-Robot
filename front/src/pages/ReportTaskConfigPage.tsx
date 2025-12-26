import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDomain } from '@/contexts';
import { taskService } from '@/services';
import { Button, Input } from '@/components/ui';
import type { CreateTaskDTO } from '@/types';

export const ReportTaskConfigPage = () => {
    const navigate = useNavigate();
    const { currentDomain } = useDomain();
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateTaskDTO>();

    const createTaskMutation = useMutation({
        mutationFn: (data: CreateTaskDTO) => taskService.create(data, currentDomain),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', currentDomain] });
            alert('Task created successfully!');
            reset();
            navigate('/task-editor');
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

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Report Task Config</h1>
                <p>Create a new task with image upload</p>
            </div>

            <div style={{ maxWidth: '600px' }}>
                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                        <Button type="button" variant="secondary" onClick={() => navigate('/task-editor')}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
