import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import EditForm from './EditForm';
import Popup from '@/components/ui/Popup';

const API_BASE_URL = 'http://localhost:3001/api';

interface Incident {
    id: string;
    incident_no: string;
    event_time: string;
    mioc_contract_time: string;
    status: string;
}

const PageTrueAlarm: React.FC = () => {
    const [rows, setRows] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [editData, setEditData] = useState<Incident | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedRow, setSelectedRow] = useState<Incident | null>(null);

    // Fetch completed incidents
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
                if (response.status === 401) {
                    window.location.href = '/signin';
                }
                throw new Error('Failed to fetch');
            }

            const data = await response.json();
            setRows(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Error:', error);
            alert('ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle download report
    const handleDownloadReport = async (incident: Incident) => {
        try {
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
        } catch (error) {
            console.error('Error:', error);
            alert('ไม่สามารถดาวน์โหลดรายงานได้');
        }
    };

    // Handle edit
    const handleEdit = (incident: Incident) => {
        setEditData(incident);
    };

    // Handle delete
    const handleDelete = (incident: Incident) => {
        setSelectedRow(incident);
        setShowPopup(true);
    };

    const confirmDelete = async () => {
        if (!selectedRow) return;

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/incidents/${selectedRow.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete');

            alert('ลบข้อมูลสำเร็จ');
            setShowPopup(false);
            setSelectedRow(null);
            fetchData();
        } catch (error) {
            console.error('Error:', error);
            alert('ไม่สามารถลบข้อมูลได้');
        }
    };

    // Helper function to safely format dates
    const formatDate = (value: any): string => {
        if (value === null || value === undefined || value === '') return '-';
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleString('th-TH', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (e) {
            return '-';
        }
    };

    const columns: GridColDef[] = [
        { field: 'incident_no', headerName: 'Incident NO.', width: 120 },
        {
            field: 'event_time',
            headerName: 'เวลาเกิดเหตุ',
            width: 180,
            valueFormatter: (params) => formatDate(params)
        },
        {
            field: 'mioc_contract_time',
            headerName: 'เวลาติดต่อเจ้าหน้าที่',
            width: 180,
            valueFormatter: (params) => formatDate(params)
        },
        {
            field: 'actions',
            headerName: 'การดำเนินการ',
            width: 300,
            sortable: false,
            renderCell: (params) => (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => handleDownloadReport(params.row)}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        📥 Download
                    </button>
                    <button
                        onClick={() => handleEdit(params.row)}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        ✏️ Edit
                    </button>
                    <button
                        onClick={() => handleDelete(params.row)}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🗑️ Delete
                    </button>
                </div>
            )
        }
    ];

    if (editData) {
        return (
            <div>
                <button
                    onClick={() => setEditData(null)}
                    style={{
                        padding: '10px 20px',
                        marginBottom: '20px',
                        backgroundColor: '#ccc',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    ← กลับไป
                </button>
                <EditForm data={editData} onClose={() => { setEditData(null); fetchData(); }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>📊 True Alarm (Completed Incidents)</h2>
            
            {loading ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
            ) : (
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSizeOptions={[5, 10, 25]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } }
                        }}
                    />
                </Paper>
            )}

            {/* Delete Confirmation Popup */}
            <Popup trigger={showPopup} onClose={() => setShowPopup(false)}>
                <h3>ยืนยันการลบข้อมูล</h3>
                <p>คุณแน่ใจหรือว่าต้องการลบ Incident: <strong>{selectedRow?.incident_no}</strong></p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button
                        onClick={() => setShowPopup(false)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#ccc',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={confirmDelete}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        ลบ
                    </button>
                </div>
            </Popup>
        </div>
    );
};

export default PageTrueAlarm;
