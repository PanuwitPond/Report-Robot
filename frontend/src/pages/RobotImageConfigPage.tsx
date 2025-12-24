import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2'; // เรียกใช้ SweetAlert2
import { useDomain } from '@/contexts';
import { imageService } from '@/services';
import { DataTable, Column } from '@/components/data-table';
import { Button, Modal, Select, Input } from '@/components/ui';
import type { RobotImage, UpdateImageDTO, UploadImageDTO } from '@/types';

export const RobotImageConfigPage = () => {
    const { currentDomain } = useDomain();
    const queryClient = useQueryClient();

    // State ควบคุม Modal
    const [editingImage, setEditingImage] = useState<RobotImage | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form Hook สำหรับ ADD
    const {
        register: registerAdd,
        handleSubmit: handleSubmitAdd,
        formState: { errors: errorsAdd },
        reset: resetAdd
    } = useForm<UploadImageDTO>();

    // Form Hook สำหรับ EDIT
    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        reset: resetEdit,
    } = useForm<UpdateImageDTO>();

    // 1. ดึงข้อมูลรูปภาพทั้งหมด
    const { data: images = [], isLoading } = useQuery({
        queryKey: ['images', currentDomain],
        queryFn: () => imageService.getAll(currentDomain),
    });

    // 2. ดึงข้อมูล Sites จาก API (เพื่อให้ Dropdown ตรงกับ Robot Web)
    const { data: sites = [] } = useQuery({
        queryKey: ['robot-sites'],
        queryFn: () => imageService.getSites(),
    });

    // 3. กำหนด Image Type Options (ค่ามาตรฐาน + ค่าที่มีอยู่ใน DB)
    const standardImageTypes = [
        'Operation',
        'Equipment Care',
        'Station',
        'Docking',
        'Installation Map'
    ];
    // รวมกับค่าเก่าที่อาจจะมีใน DB (เผื่อมี Custom Type)
    const availableImageTypes = Array.from(new Set(images.map(img => img.imageType))).filter(Boolean);
    const imageTypeOptions = Array.from(new Set([...standardImageTypes, ...availableImageTypes])).sort();

    // Effect: เมื่อกด Edit ให้เอาข้อมูลเก่าไปใส่ใน Form
    useEffect(() => {
        if (editingImage) {
            resetEdit({
                site: editingImage.site,
                imageType: editingImage.imageType,
                // image: ไม่ต้องใส่ เพราะ input type='file' ใส่ค่าเริ่มต้นไม่ได้
            });
        }
    }, [editingImage, resetEdit]);

    // --- Mutations ---

    // 1. Upload (Add)
    const uploadImageMutation = useMutation({
        mutationFn: (data: UploadImageDTO) => imageService.upload(data, currentDomain),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images', currentDomain] });
            
            // ปิด Modal และ Reset Form
            setIsAddModalOpen(false);
            resetAdd();

            // แสดงแจ้งเตือนสวยๆ (ติ๊กถูก)
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Image uploaded successfully',
                showConfirmButton: false,
                timer: 1500
            });
        },
        onError: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to upload image',
            });
        },
    });

    // 2. Update (Edit)
    const updateMutation = useMutation({
        mutationFn: (data: UpdateImageDTO) => imageService.update(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images', currentDomain] });
            setEditingImage(null); // ปิด Modal Edit

            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'Image updated successfully',
                showConfirmButton: false,
                timer: 1500
            });
        },
        onError: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to update image',
            });
        }
    });

    // 3. Delete
    const deleteMutation = useMutation({
        mutationFn: (id: string) => imageService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images', currentDomain] });
            
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Image has been deleted.',
                showConfirmButton: false,
                timer: 1500
            });
        },
        onError: (error: any) => {
             Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to delete image',
            });
        }
    });

    // Handlers
    const onAddSubmit = (data: UploadImageDTO) => {
        const formData = { 
            ...data, 
            image: data.image[0] as any 
        };
        uploadImageMutation.mutate(formData);
    };

    const onEditSubmit = (data: UpdateImageDTO) => {
        if (!editingImage) return;
        const formData = {
            id: editingImage.id,
            site: data.site,
            imageType: data.imageType,
            // ส่งรูปไปเฉพาะเมื่อมีการเลือกไฟล์ใหม่
            image: (data.image && data.image.length > 0) ? data.image[0] : undefined
        };
        updateMutation.mutate(formData as any);
    };

    const handleDelete = (row: RobotImage) => {
        // ใช้ Swal Confirm แทน window.confirm เดิม
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(row.id);
            }
        });
    };

    // Table Columns
    const columns: Column<RobotImage>[] = [
        { key: 'site', header: 'Site' },
        { key: 'imageName', header: 'Image Name' },
        { key: 'imageType', header: 'Image Type' },
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
                        alt={row.imageName || "Robot Data"}
                        style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Fallback logic for loading failures
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
                    {/* <Button size="small" onClick={() => setEditingImage(row)}>
                        Edit
                    </Button> */}
                    <Button
                        size="small"
                        variant="danger"
                        onClick={() => handleDelete(row)}
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
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
                    
                    <Input
                        label="Image Name"
                        placeholder="e.g. Robot A - Front View"
                        {...registerAdd('imageName', { required: 'Image name is required' })}
                        error={errorsAdd.imageName?.message}
                    />

                    <Select
                        label="Site"
                        {...registerAdd('site', { required: 'Site is required' })}
                        error={errorsAdd.site?.message}
                    >
                        <option value="">Select site...</option>
                        {sites.map(site => (
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
                        accept="image/*"
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
                        {sites.map(site => (
                            <option key={site} value={site}>{site}</option>
                        ))}
                    </Select>

                    <Select
                        label="Image Type"
                        {...registerEdit('imageType')}
                    >
                        {imageTypeOptions.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </Select>

                    <Input
                        label="New Image (optional)"
                        type="file"
                        accept="image/*"
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