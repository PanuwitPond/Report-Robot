import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { 
    Paper, Button, Dialog, DialogTitle, DialogContent, 
    IconButton, Typography, Box, Tooltip 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditForm from './EditForm';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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
    controllable?: boolean;
    suspect?: string;
    [key: string]: any;
}

const PageTrueAlarm: React.FC = () => {
    const [rows, setRows] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [openEdit, setOpenEdit] = useState(false);
    const [editData, setEditData] = useState<Incident | null>(null);

    // Fetch Completed Incidents
    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/incidents/complete`, {
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

    // Handle Download Report
    const handleDownloadReport = async (incident: Incident) => {
        try {
            Swal.fire({
                title: 'กำลังสร้างรายงาน PDF...',
                html: 'กรุณารอสักครู่ ระบบกำลังดึงข้อมูลจาก Jasper Server',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/incidents/${incident.id}/report`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to download');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${incident.incident_no}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            Swal.close();
            Swal.fire({
                icon: 'success',
                title: 'ดาวน์โหลดเสร็จสิ้น',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({ icon: 'error', title: 'ดาวน์โหลดไม่สำเร็จ', text: 'กรุณาตรวจสอบการเชื่อมต่อกับ Jasper Server' });
        }
    };

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
            title: 'บันทึกข้อมูลเรียบร้อย',
            timer: 1500,
            showConfirmButton: false
        });
        fetchData();
    };

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

    // ✅ เพิ่มฟังก์ชัน formatDate ที่รองรับทั้ง "เวลาอย่างเดียว" และ "วันที่+เวลา"
    const formatDate = (value: any): string => {
        if (!value) return '-';
        
        // กรณี: ค่ามาเป็นเวลาอย่างเดียว (เช่น "20:08:00" หรือ "08:30")
        if (typeof value === 'string' && value.includes(':') && !value.includes('T') && value.length < 15) {
            // ตัดเอาแค่ 5 ตัวแรก (HH:mm)
            return value.substring(0, 5); 
        }

        // กรณี: ค่ามาเป็น Date Time เต็มรูปแบบ (เช่น "2025-12-25T14:30:00...")
        try {
            const date = new Date(value);
            // เช็คว่าเป็นวันที่ที่ถูกต้องหรือไม่
            if (isNaN(date.getTime())) return value.toString(); // ถ้าแปลงไม่ได้ ให้โชว์ค่าเดิม

            return date.toLocaleString('th-TH', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            return '-';
        }
    };

    // ✅ แก้ไข Columns ให้ใช้ valueFormatter: (value) => formatDate(value)
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
        { field: 'conclusion', headerName: 'สรุป', width: 250 },
        { 
            field: 'actions', headerName: 'action', width: 150, sortable: false, align: 'center', headerAlign: 'center',
            pinned: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Download PDF">
                        <IconButton color="primary" onClick={() => handleDownloadReport(params.row)} size="small">
                            <DownloadIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton color="warning" onClick={() => handleEditClick(params.row)} size="small">
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
                <Typography variant="h5" component="h2" style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    ✅ งานที่เสร็จสิ้น (True Alarm)
                </Typography>
                <Button variant="outlined" onClick={fetchData} size="small" startIcon={<DownloadIcon />}>
                    Refresh Data
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
                            backgroundColor: '#e8f5e9',
                            color: '#1b5e20',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: '#f1f8e9',
                        }
                    }}
                />
            </Paper>

            <Dialog 
                open={openEdit} 
                onClose={handleCloseEdit} 
                maxWidth="md" 
                fullWidth
                scroll="paper"
            >
                <DialogTitle sx={{ bgcolor: '#2e7d32', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>📝 รายละเอียด: {editData?.incident_no}</span>
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

export default PageTrueAlarm;