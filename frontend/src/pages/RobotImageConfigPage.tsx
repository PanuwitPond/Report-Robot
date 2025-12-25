import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { useDomain } from '@/contexts';
import { imageService } from '@/services';
import { DataTable, Column } from '@/components/data-table';
import { Button, Modal, Select, Input } from '@/components/ui';
import type { RobotImage, UpdateImageDTO, UploadImageDTO } from '@/types';

type SortConfig = {
    key: keyof RobotImage | '';
    direction: 'asc' | 'desc';
};

export const RobotImageConfigPage = () => {
    const { currentDomain } = useDomain();
    const queryClient = useQueryClient();

    // State
    const [editingImage, setEditingImage] = useState<RobotImage | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // State Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

    // Form Hooks
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
    } = useForm<UpdateImageDTO>();

    // Fetch Data
    const { data: images = [], isLoading } = useQuery({
        queryKey: ['images', currentDomain],
        queryFn: () => imageService.getAll(currentDomain),
    });

    const { data: sites = [] } = useQuery({
        queryKey: ['robot-sites'],
        queryFn: () => imageService.getSites(),
    });

    // Options
    const standardImageTypes = [
        'Operation',
        'Equipment Care',
        'Station',
        'Docking',
        'Installation Map'
    ];
    const availableImageTypes = Array.from(new Set(images.map(img => img.imageType))).filter(Boolean);
    const imageTypeOptions = Array.from(new Set([...standardImageTypes, ...availableImageTypes])).sort();

    // Logic: Filter & Sort
    const processedImages = useMemo(() => {
        let result = images.filter((img) => {
            const term = searchTerm.toLowerCase();
            const siteMatch = (img.site || '').toLowerCase().includes(term);
            const nameMatch = (img.imageName || '').toLowerCase().includes(term);
            const searchMatch = siteMatch || nameMatch;
            const typeMatch = selectedType ? img.imageType === selectedType : true;
            return searchMatch && typeMatch;
        });

        if (sortConfig.key) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [images, searchTerm, selectedType, sortConfig]);

    // Helpers
    const requestSort = (key: keyof RobotImage) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof RobotImage) => {
        if (sortConfig.key !== key) return <span style={{ opacity: 0.3, marginLeft: 5 }}>↕</span>;
        return sortConfig.direction === 'asc' ? <span style={{ marginLeft: 5 }}>▲</span> : <span style={{ marginLeft: 5 }}>▼</span>;
    };

    useEffect(() => {
        if (editingImage) {
            resetEdit({
                site: editingImage.site,
                imageType: editingImage.imageType,
            });
        }
    }, [editingImage, resetEdit]);

    // --- Mutations ---
    const uploadImageMutation = useMutation({
        mutationFn: (data: UploadImageDTO) => imageService.upload(data, currentDomain),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images', currentDomain] });
            setIsAddModalOpen(false);
            resetAdd();
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

    const updateMutation = useMutation({
        mutationFn: (data: UpdateImageDTO) => imageService.update(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images', currentDomain] });
            setEditingImage(null);
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
        },
    });

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

    const handleDelete = (row: RobotImage) => {
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
        { 
            key: 'site', 
            header: (
                <div onClick={() => requestSort('site')} style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' }}>
                    Site {getSortIcon('site')}
                </div>
            ) as any
        },
        { 
            key: 'imageName', 
            header: (
                <div onClick={() => requestSort('imageName')} style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' }}>
                    Image Name {getSortIcon('imageName')}
                </div>
            ) as any
        },
        { key: 'imageType', header: 'Image Type' },
        {
            key: 'createdAt',
            header: (
                <div onClick={() => requestSort('createdAt')} style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' }}>
                    Upload Date {getSortIcon('createdAt')}
                </div>
            ) as any,
            cell: (row) => {
                if (!row.createdAt) return '-';
                return new Date(row.createdAt).toLocaleString('en-US', {
                    year: 'numeric', month: 'numeric', day: 'numeric',
                    hour: 'numeric', minute: 'numeric', second: 'numeric',
                    hour12: true
                });
            }
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
                        alt={row.imageName || "Robot Data"}
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
                    {/* <Button size="small" onClick={() => setEditingImage(row)}>Edit</Button> */}
                    <Button size="small" variant="danger" onClick={() => handleDelete(row)} disabled={deleteMutation.isPending}>Delete</Button>
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

            {/* Action Bar */}
            <div className="page-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Input
                        placeholder="Search by Site or Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ maxWidth: '300px' }}
                    />
                    
                    <select 
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        style={{ 
                            padding: '0.5rem', 
                            borderRadius: '4px', 
                            border: '1px solid #ccc',
                            height: '40px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">All Types</option>
                        {imageTypeOptions.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* [แก้ไข] ปุ่ม Add เป็นสี่เหลี่ยมจัตุรัสขนาดเล็ก ชิดขวา */}
                <Button 
                        onClick={() => setIsAddModalOpen(true)}
                        style={{ 
                            width: '120px',        // กำหนดกว้าง 40px
                            height: '40px',       // สูง 40px (เป็นสี่เหลี่ยมจัตุรัส)
                            padding: 0,           // เอา padding ออก
                               // ยกเลิก min-width เดิม
                            flexGrow: 0,          // ห้ามยืด
                            display: 'flex',      // จัด icon ตรงกลาง
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '4px'   // มนมุมนิดหน่อย
                        }}
                        title="Add New Image"
                    >
                        Add New Image
                    </Button>
            </div>

            <DataTable
                columns={columns}
                data={processedImages}
                isLoading={isLoading}
                emptyMessage={searchTerm || selectedType ? "No images match your criteria." : "No images found."}
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