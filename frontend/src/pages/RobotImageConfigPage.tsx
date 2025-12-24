import { useState } from 'react';
// [เพิ่ม] import useNavigate
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDomain } from '@/contexts';
import { imageService } from '@/services';
import { DataTable, Column } from '@/components/data-table';
import { Button, Modal, Select, Input } from '@/components/ui';
import type { RobotImage, UpdateImageDTO } from '@/types';

export const RobotImageConfigPage = () => {
    // [เพิ่ม] เรียกใช้ hook navigate
    const navigate = useNavigate();
    const { currentDomain } = useDomain();
    const queryClient = useQueryClient();
    const [editingImage, setEditingImage] = useState<RobotImage | null>(null);
    const [updateData, setUpdateData] = useState<Partial<UpdateImageDTO>>({});

    const { data: images = [], isLoading } = useQuery({
        queryKey: ['images', currentDomain],
        queryFn: () => imageService.getAll(currentDomain),
    });

    const updateMutation = useMutation({
        mutationFn: (data: UpdateImageDTO) => imageService.update(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images', currentDomain] });
            setEditingImage(null);
            setUpdateData({});
            alert('Image updated successfully!');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => imageService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images', currentDomain] });
            alert('Image deleted successfully!');
        },
    });

    const handleUpdate = () => {
        if (editingImage) {
            updateMutation.mutate({
                id: editingImage.id,
                ...updateData,
            });
        }
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
            if (!row.imageUrl) return 'No Image';
            
            // ต่อ Path เข้ากับ Proxy URL ของ Backend
            const fullImageUrl = `/api/storage/url?path=${row.imageUrl}`;
            
            return (
                <img
                    src={fullImageUrl}
                    alt="Robot Data"
                    style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                    // ถ้าโหลดไม่ได้ ไม่ต้องเรียก placeholder ภายนอก ให้แสดงข้อความแทน
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                />
            );
        }  ,
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

            {/* [เพิ่ม] ปุ่ม Add New Image */}
            <div className="page-actions" style={{ marginBottom: '1rem' }}>
                <Button onClick={() => navigate('/add-image')}>
                    Add New Image
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={images}
                isLoading={isLoading}
                emptyMessage="No images found"
            />

            <Modal
                isOpen={!!editingImage}
                onClose={() => setEditingImage(null)}
                title="Edit Image"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '400px' }}>
                    <Select
                        label="Site"
                        value={updateData.site || editingImage?.site || ''}
                        onChange={(e) => setUpdateData({ ...updateData, site: e.target.value })}
                    >
                        <option value="Site A">Site A</option>
                        <option value="Site B">Site B</option>
                        <option value="Site C">Site C</option>
                    </Select>

                    <Select
                        label="Image Type"
                        value={updateData.imageType || editingImage?.imageType || ''}
                        onChange={(e) => setUpdateData({ ...updateData, imageType: e.target.value })}
                    >
                        <option value="Front View">Front View</option>
                        <option value="Side View">Side View</option>
                        <option value="Top View">Top View</option>
                        <option value="Detail">Detail</option>
                    </Select>

                    <Input
                        label="New Image (optional)"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={(e) => setUpdateData({ ...updateData, image: e.target.files?.[0] as any })}
                    />

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? 'Updating...' : 'Update'}
                        </Button>
                        <Button variant="secondary" onClick={() => setEditingImage(null)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};