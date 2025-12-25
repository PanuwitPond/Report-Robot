import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form'; // [เพิ่ม]
import { useDomain } from '@/contexts';
import { imageService } from '@/services';
import { DataTable, Column } from '@/components/data-table';
import { Button, Modal, Select, Input } from '@/components/ui';
import type { RobotImage, UpdateImageDTO, UploadImageDTO } from '@/types'; // [เพิ่ม] UploadImageDTO

export const RobotImageConfigPage = () => {
    const { currentDomain } = useDomain();
    const queryClient = useQueryClient();
    
    // State สำหรับ Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // [เพิ่ม] State เปิดปิด Modal Add

    // React Hook Form สำหรับ Add Image
    const { 
        register, 
        handleSubmit, 
        formState: { errors }, 
        reset 
    } = useForm<UploadImageDTO>();

    const { data: images = [], isLoading } = useQuery({
        queryKey: ['images', currentDomain],
        queryFn: () => imageService.getAll(currentDomain),
    });

    // Mutation: Upload Image (Add)
    const uploadImageMutation = useMutation({
        mutationFn: (data: UploadImageDTO) => imageService.upload(data, currentDomain),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images', currentDomain] });
            alert('Image uploaded successfully!');
            setIsAddModalOpen(false);
            reset();
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to upload image');
        },
    });

    const onAddSubmit = (data: UploadImageDTO) => {
        const formData = {
            ...data,
            image: data.image[0] as any,
        };
        uploadImageMutation.mutate(formData);
    };

    // Mutation: Delete Image
    const deleteMutation = useMutation({
        mutationFn: (id: string) => imageService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images', currentDomain] });
            alert('Image deleted successfully!');
        },
    });

    const columns: Column<RobotImage>[] = [
        { key: 'site', header: 'Site' },
        { key: 'imageType', header: 'Image Type' },
        {
            key: 'createdAt',
            header: 'Date',
            cell: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
            key: 'imageUrl',
            header: 'Image',
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
                        alt="Robot Data"
                        style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.dataset.triedProxy && row.imageUrl && row.imageUrl.startsWith('http')) {
                                target.dataset.triedProxy = 'true';
                                const filename = row.imageUrl.split('/').pop();
                                if (filename) {
                                    target.src = `/api/storage/url?path=operation_eqn/${filename}`;
                                }
                            } else {
                                target.src = '/img/default-bot.png';
                            }
                        }}
                    />
                ) : 'No Image';
            },
        },
        {
            key: 'id',
            header: 'Actions',
            cell: (row) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                        size="small"
                        variant="danger"
                        onClick={() => {
                            if (confirm('Are you sure you want to delete this image?')) {
                                deleteMutation.mutate(row.id);
                            }
                        }}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Robot Image Config</h1>
                <p>Manage robot images</p>
            </div>

            <div className="page-actions" style={{ marginBottom: '1rem' }}>
                {/* เปลี่ยน onClick เป็นเปิด Modal */}
                <Button onClick={() => setIsAddModalOpen(true)}>
                    Add New Image
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={images}
                isLoading={isLoading}
                emptyMessage="No images found"
            />

            {/* Modal สำหรับ Add New Image */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Image"
            >
                <form onSubmit={handleSubmit(onAddSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '400px' }}>
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

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <Button type="submit" disabled={uploadImageMutation.isPending}>
                            {uploadImageMutation.isPending ? 'Uploading...' : 'Upload Image'}
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