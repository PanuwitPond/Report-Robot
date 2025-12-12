import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useState, useEffect } from 'react';
import ConstructionIcon from '@mui/icons-material/Construction';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress'; // ✅ Import CircularProgress
import Popup from './components/Popup';
import { useLocation, useNavigate } from "react-router-dom";


const REACT_APP_API_BASE_URL = window._env_.REACT_APP_API_BASE_URL || 'http://localhost:5000';



function IncompleteIncident() {
    const navigate = useNavigate();
    const token = localStorage.getItem("jwt_token");
    const getIncompleteList = async () => {
        try {
            const response = await fetch(`${REACT_APP_API_BASE_URL}/allIncomplete`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            });
            if (!response.ok) {
                navigate("/");
                throw new Error('Network response was not ok');
            };
            return response.json();
        } catch (err) {
            console.log(err);
        }
    };

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true); // ✅ State for loading
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const fetchData = async () => {
        setLoading(true); // ✅ Start loading
        try {
            const data = await getIncompleteList();
            setRows(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false); // ✅ Stop loading
        }
    };

    useEffect(() => {
        fetchData();
    }, []);



    const handleEditClick = (rowData) => {
        navigate("/editForm", { state: rowData });
    };

    const handleDeleteClick = (rowData) => {
        setSelectedRow(rowData);
        setPopupVisible(true);
    };

    const closePopup = () => {
        setPopupVisible(false);
        setSelectedRow(null);
    };

    const deleteRow = async () => {
        try {
            const response = await fetch(`${REACT_APP_API_BASE_URL}/deleteIncident`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ id: selectedRow.id })
            });
            if (response.ok) {
                await fetchData();
            } else {
                const errorText = await response.text();
                console.error('Failed to delete:', errorText);
            }
        } catch (err) {
            console.error(err.message);
        }
        closePopup();
    };

    const columns = [
        { field: 'incident_no', headerName: 'Incident NO.', width: 120 },
        {
            field: 'event_time',
            headerName: 'เวลาเกิดเหตุ',
            valueGetter: (params) => params ? params.replace(/\+\d{2}$/, '') : ''
        },
        {
            field: 'mioc_contract_time',
            headerName: 'เวลาติดต่อเจ้าหน้าที่',
            valueGetter: (params) => params ? params.replace(/\+\d{2}$/, '') : ''
        },
        {
            field: 'officer_check_time',
            headerName: 'เวลาที่เข้าตรวจสอบ',
            valueGetter: (params) => params ? params.replace(/\+\d{2}$/, '') : ''
        },
        {
            field: 'arrest_time',
            headerName: 'arrest_time',
            valueGetter: (params) => params ? params.replace(/\+\d{2}$/, '') : ''
        },
        {
            field: 'last_seen_time',
            headerName: 'last_seen_time',
            valueGetter: (params) => params ? params.replace(/\+\d{2}$/, '') : ''
        },
        { field: 'mioc_staff_name', headerName: 'mioc_staff_name' },
        { field: 'mioc_staff_phone', headerName: 'mioc_staff_phone' },
        { field: 'security_name', headerName: 'security_name' },
        { field: 'security_phone', headerName: 'security_phone' },
        { field: 'additional_note', headerName: 'additional_note' },
        {
            field: 'description_of_incident',
            headerName: 'คำอธิบาย',
            width: 260
        },
        {
            field: 'conclusion',
            headerName: 'สรุป',
            width: 260
        },
        {
            field: 'action',
            headerName: 'action',
            width: 150,
            renderCell: (params) => (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: 7 }}>

                    <button
                        onClick={() => handleEditClick(params.row)}
                        style={{
                            backgroundColor: '#F28705',
                            color: '#fff',
                            border: 'none',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <ConstructionIcon style={{ width: '20px', height: '20px' }} />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(params.row)}
                        style={{
                            backgroundColor: '#6532a4',
                            color: '#fff',
                            border: 'none',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <DeleteIcon style={{ width: '20px', height: '20px' }} />
                    </button>
                </div>
            ),
        }
    ];

    const paginationModel = { page: 0, pageSize: 10 };

    return (
        <div className='App' style={{ height: 'auto', minHeight: '89vh' }}>
            {popupVisible && (
                <Popup trigger={true} onClose={closePopup}>
                    <h3>คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?</h3>
                    <p>{selectedRow ? JSON.stringify(selectedRow, null, 2) : ''}</p>
                    <button onClick={deleteRow} style={{
                        padding: '10px 20px',
                        backgroundColor: '#F28705',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}>
                        ยืนยัน
                    </button>
                    <button onClick={closePopup} style={{
                        padding: '8px 20px',
                        backgroundColor: 'transparent',
                        color: '#F28705',
                        border: '2px solid #F28705',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginLeft: 10,
                        height: 44
                    }}>
                        ยกเลิก
                    </button>
                </Popup>
            )}

            <div className='d-flex justify-content-center align-items-start' style={{ paddingTop: '10px', marginTop: 10, marginBottom: '20px' }}>
                <Paper sx={{
                    width: '90%',
                    backgroundColor: '#F5F5F7',
                    height: 'auto',
                    minHeight: '400px',
                    position: 'relative'
                }}>
                    {loading ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '400px'
                        }}>
                            <CircularProgress />
                        </div>
                    ) : (
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            initialState={{ pagination: { paginationModel } }}
                            pageSizeOptions={[10, 15, 20]}
                            sx={{ border: 0 }}
                        />
                    )}
                </Paper>
            </div>
        </div>
    );
}

export default IncompleteIncident;
