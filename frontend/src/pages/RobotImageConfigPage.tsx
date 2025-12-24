import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useDomain } from '@/contexts';
import { imageService } from '@/services';
import { DataTable, Column } from '@/components/data-table';
import { Button, Modal, Select, Input } from '@/components/ui';
import type { RobotImage, UpdateImageDTO, UploadImageDTO } from '@/types';

export const RobotImageConfigPage = () => {
    const { currentDomain } = useDomain();
    const queryClient = useQueryClient();

    const [editingImage, setEditingImage] = useState<RobotImage | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const {
        register: registerAdd,
        handleSubmit: handleSubmitAdd,
        formState: { errors: errorsAdd },
        reset: resetAdd
    } = useForm<UploadImageDTO>();

    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        reset: resetEdit,
        // formState: { errors: errorsEdit } // ไม่ได้ใช้ ลบออกได้
    } = useForm<UpdateImageDTO>();

    const { data: images = [], isLoading } = useQuery({
        queryKey: ['images', currentDomain],
        queryFn: () => imageService.getAll(currentDomain),
    });

    // 1. สร้างตัวเลือก Site จากข้อมูลจริง (ป้องกัน dropdown ว่าง)
    const availableSites = Array.from(new Set(images.map(img => img.site))).filter(Boolean).sort();
    const siteOptions = Array.from(new Set([...availableSites, 'Site A', 'Site B', 'Site C']));

    // 2. [เพิ่ม] สร้างตัวเลือก Image Type จากข้อมูลจริง (แก้ปัญหา Image Type ไม่ขึ้น)
    const availableImageTypes = Array.from(new Set(images.map(img => img.imageType))).filter(Boolean).sort();
    // รวมกับค่า Default ที่เราต้องการให้มีแน่นอน
    const imageTypeOptions = Array.from(new Set([...availableImageTypes, 'Front View', 'Side View', 'Top View', 'Detail']));

    // Effect: เมื่อกด Edit ให้เอาข้อมูลเก่าไปใส่ใน Form
    useEffect(() => {
        if (editingImage) {
            resetEdit({
                site: editingImage.site,
                imageType: editingImage.imageType,
            });
        }
    }, [editingImage, resetEdit]);

    const uploadImageMutation = useMutation({
        mutationFn: (data: UploadImageDTO) => imageService.upload(data, currentDomain),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images', currentDomain] });
            alert('Image uploaded successfully!');
            setIsAddModalOpen(false);
            resetAdd();
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to upload image');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: UpdateImageDTO) => imageService.update(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images', currentDomain] });
            setEditingImage(null);
            alert('Image updated successfully!');
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to update image');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => imageService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images', currentDomain] });
            alert('Image deleted successfully!');
        },
    });

    const onAddSubmit = (data: UploadImageDTO) => {
        const formData = { ...data, image: data.image[0] as any };
        uploadImageMutation.mutate(formData);
    };

    const onEditSubmit = (data: UpdateImageDTO) => {
        if (!editingImage) return;
        const formData = {
            id: editingImage.id,
            site: data.site,
            imageType: data.imageType,
            image: (data.image && data.image.length > 0) ? data.image[0] : undefined
        };
        updateMutation.mutate(formData as any);
    };

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
                                if (filename) target.src = `/api/storage/url?path=operation_eqn/${filename}`;
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
                    <Button size="small" onClick={() => setEditingImage(row)}>
                        Edit
                    </Button>
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

            {/* Modal ADD */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Image"
            >
                <form onSubmit={handleSubmitAdd(onAddSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '400px' }}>
                    <Select
                        label="Site"
                        {...registerAdd('site', { required: 'Site is required' })}
                        error={errorsAdd.site?.message}
                    >
                        <option value="">Select site...</option>
                        {siteOptions.map(site => (
                            <option key={site} value={site}>{site}</option>
                        ))}
                    </Select>

                    <Select
                        label="Image Type"
                        {...registerAdd('imageType', { required: 'Image type is required' })}
                        error={errorsAdd.imageType?.message}
                    >
                        <option value="">Select image type...</option>
                        {imageTypeOptions.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </Select>

                    <Input
                        label="Image File"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        {...registerAdd('image', { required: 'Image is required' })}
                        error={errorsAdd.image?.message as string}
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

            {/* Modal EDIT */}
            <Modal
                isOpen={!!editingImage}
                onClose={() => setEditingImage(null)}
                title="Edit Image"
            >
                <form onSubmit={handleSubmitEdit(onEditSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '400px' }}>
                    <Select
                        label="Site"
                        {...registerEdit('site')}
                    >
                        {siteOptions.map(site => (
                            <option key={site} value={site}>{site}</option>
                        ))}
                    </Select>

                    <Select
                        label="Image Type"
                        {...registerEdit('imageType')}
                    >
                        {/* [แก้ไข] ใช้ imageTypeOptions แทนการ hardcode เพื่อให้รองรับค่าที่มีอยู่จริงใน DB */}
                        {imageTypeOptions.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </Select>

                    <Input
                        label="New Image (optional)"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        {...registerEdit('image')}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666' }}>
                        *Leave empty to keep current image
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? 'Updating...' : 'Update'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setEditingImage(null)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};