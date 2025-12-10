import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDomain } from '@/contexts';
import { imageService } from '@/services';
import { Button, Input, Select } from '@/components/ui';
import type { UploadImageDTO } from '@/types';

export const AddImagePage = () => {
    const { currentDomain } = useDomain();
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<UploadImageDTO>();

    const uploadImageMutation = useMutation({
        mutationFn: (data: UploadImageDTO) => imageService.upload(data, currentDomain),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images', currentDomain] });
            alert('Image uploaded successfully!');
            reset();
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to upload image');
        },
    });

    const onSubmit = (data: UploadImageDTO) => {
        const formData = {
            ...data,
            image: data.image[0] as any,
        };
        uploadImageMutation.mutate(formData);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Add Image</h1>
                <p>Upload robot images to the system</p>
            </div>

            <div style={{ maxWidth: '600px' }}>
                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Select
                        label="Site"
                        {...register('site', { required: 'Site is required' })}
                        error={errors.site?.message}
                    >
                        <option value="">Select site...</option>
                        <option value="Site A">Site A</option>
                        <option value="Site B">Site B</option>
                        <option value="Site C">Site C</option>
                    </Select>

                    <Select
                        label="Image Type"
                        {...register('imageType', { required: 'Image type is required' })}
                        error={errors.imageType?.message}
                    >
                        <option value="">Select image type...</option>
                        <option value="Front View">Front View</option>
                        <option value="Side View">Side View</option>
                        <option value="Top View">Top View</option>
                        <option value="Detail">Detail</option>
                    </Select>

                    <Input
                        label="Image File"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        {...register('image', { required: 'Image is required' })}
                        error={errors.image?.message as string}
                    />

                    <Button type="submit" disabled={uploadImageMutation.isPending}>
                        {uploadImageMutation.isPending ? 'Uploading...' : 'Upload Image'}
                    </Button>
                </form>
            </div>
        </div>
    );
};
