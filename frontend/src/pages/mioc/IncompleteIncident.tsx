import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { 
    Paper, Button, Dialog, DialogTitle, DialogContent, 
    IconButton, Typography, Box, Tooltip 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditForm from './EditForm';
import Swal from 'sweetalert2';

const API_BASE_URL = 'http://localhost:3001/api';

interface Incident {
    id: string;
    incident_no: string;
    event_time: string;
    mioc_contract_time: string;
    officer_check_time: string;
    arrest_time: string;
    last_seen_time: string;
    mioc_staff_name: string;
    mioc_staff_phone: string;
    security_name: string;
    security_phone: string;
    additional_note: string;
    description_of_incident: string;
    conclusion: string;
    status: string;
    [key: string]: any;
}

const IncompleteIncident: React.FC = () => {
    const [rows, setRows] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    
    // State สำหรับ Modal แก้ไข
    const [openEdit, setOpenEdit] = useState(false);
    const [editData, setEditData] = useState<Incident | null>(null);

    // Fetch incomplete incidents
    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/incidents/incomplete`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) window.location.href = '/signin';
                throw new Error('Failed to fetch');
            }

            const data = await response.json();
            setRows(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Error:', error);
            const Toast = Swal.mixin({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
            });
            Toast.fire({ icon: 'error', title: 'ไม่สามารถโหลดข้อมูลได้' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Open Edit Modal
    const handleEditClick = (incident: Incident) => {
        setEditData(incident);
        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
        setEditData(null);
    };

    const handleSaveSuccess = () => {
        Swal.fire({
            icon: 'success',
            title: 'บันทึกสำเร็จ',
            text: 'ข้อมูลได้รับการอัปเดตเรียบร้อยแล้ว',
            timer: 1500,
            showConfirmButton: false
        });
        fetchData(); // Refresh Data
    };

    // Handle Delete
    const handleDeleteClick = (incident: Incident) => {
        Swal.fire({
            title: 'ยืนยันการลบ?',
            text: `ต้องการลบรายการ ${incident.incident_no} ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบข้อมูล',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('access_token');
                    await fetch(`${API_BASE_URL}/incidents/${incident.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    Swal.fire('ลบสำเร็จ!', '', 'success');
                    fetchData();
                } catch (error) {
                    Swal.fire('Error', 'ไม่สามารถลบข้อมูลได้', 'error');
                }
            }
        });
    };

    // Formatter
    const formatDate = (value: any): string => {
        if (!value) return '-';
        try {
            return new Date(value).toLocaleString('th-TH', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) { return '-'; }
    };

    // ✅ เพิ่มคอลัมน์ให้ครบตามที่ต้องการ
    const columns: GridColDef[] = [
        { field: 'incident_no', headerName: 'Incident NO.', width: 150 },
        { field: 'event_time', headerName: 'เวลาเกิดเหตุ', width: 170, valueFormatter: (value) => formatDate(value) },
        { field: 'mioc_contract_time', headerName: 'เวลาติดต่อเจ้าหน้าที่', width: 170, valueFormatter: (value) => formatDate(value) },
        { field: 'officer_check_time', headerName: 'เวลาที่เข้าตรวจสอบ', width: 170, valueFormatter: (value) => formatDate(value) },
        { field: 'arrest_time', headerName: 'arrest_time', width: 170, valueFormatter: (value) => formatDate(value) },
        { field: 'last_seen_time', headerName: 'last_seen_time', width: 170, valueFormatter: (value) => formatDate(value) },
        { field: 'mioc_staff_name', headerName: 'mioc_staff_name', width: 150 },
        { field: 'mioc_staff_phone', headerName: 'mioc_staff_phone', width: 150 },
        { field: 'security_name', headerName: 'security_name', width: 150 },
        { field: 'security_phone', headerName: 'security_phone', width: 150 },
        { field: 'additional_note', headerName: 'additional_note', width: 200 },
        { field: 'description_of_incident', headerName: 'คำอธิบาย', width: 250 },
        { field: 'conclusion', headerName: 'สรุป', width: 200 },
        { 
            field: 'actions', headerName: 'action', width: 120, sortable: false, align: 'center', headerAlign: 'center',
            pinned: 'right', 
            renderCell: (params: GridRenderCellParams) => (
                <Box>
                    <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleEditClick(params.row)} size="small">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDeleteClick(params.row)} size="small">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <div style={{ padding: '20px', height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="h2" style={{ fontWeight: 'bold', color: '#333' }}>
                    ⏳ รายการที่รอดำเนินการ (Incomplete Incidents)
                </Typography>
                <Button variant="outlined" onClick={fetchData} size="small">
                    Refresh
                </Button>
            </Box>

            <Paper sx={{ height: 'calc(100vh - 150px)', width: '100%', boxShadow: 3 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                    sx={{
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f5f5f5',
                            fontWeight: 'bold',
                        },
                    }}
                />
            </Paper>

            {/* Dialog สำหรับ Edit Form */}
            <Dialog 
                open={openEdit} 
                onClose={handleCloseEdit} 
                maxWidth="md" 
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>📝 แก้ไขข้อมูล Incident: {editData?.incident_no}</span>
                    <Button onClick={handleCloseEdit} style={{ color: 'white', minWidth: 'auto' }}>X</Button>
                </DialogTitle>
                <DialogContent dividers>
                    {editData && (
                        <EditForm 
                            data={editData} 
                            onClose={handleCloseEdit} 
                            onSaveSuccess={handleSaveSuccess} 
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default IncompleteIncident;