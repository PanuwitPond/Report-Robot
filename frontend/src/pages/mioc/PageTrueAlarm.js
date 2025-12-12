import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useState, useEffect } from 'react';
import ConstructionIcon from '@mui/icons-material/Construction';
import DeleteIcon from '@mui/icons-material/Delete';
import Popup from './components/Popup';
import SummarizeIcon from '@mui/icons-material/Summarize';
import { Navigate, useNavigate, Link, useLocation } from "react-router-dom";

const REACT_APP_API_BASE_URL = window._env_.REACT_APP_API_BASE_URL || 'http://localhost:5000';
















function TrueAlarm() {
    const navigate = useNavigate();
    const getTrueAlarmList = async () => {
        try {

            const token = localStorage.getItem("jwt_token");
            const response = await fetch(`${REACT_APP_API_BASE_URL}/allComplete`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            })
            // console.log(response.json())
            if (!response.ok) {
                navigate("/");
                throw new Error('Network response was not ok');
            }
            return response.json()
        } catch (err) {
            //console.log(err)
            navigate("/");
        }
    }
    const location = useLocation();
    const { username } = location.state || {};
    //console.log(username)
    const [loading, setLoading] = useState(false);
    const handleReportClick = async (rowData) => {
        setLoading(true);

        try {

    const token = localStorage.getItem("jwt_token");
            const response = await fetch(`${REACT_APP_API_BASE_URL}/get_incident_report/?incident_id=${rowData.incident_no}`, {
                method: "GET",
                headers: { "Content-Type": "application/pdf", "Authorization": `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // สร้าง link element สำหรับดาวน์โหลด
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${rowData.incident_no}.pdf`; // ตั้งชื่อไฟล์

            // เพิ่ม link ไปยัง DOM และคลิก
            document.body.appendChild(a);
            a.click();

            // ล้างทรัพยากร
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error fetching report:', error);
        }
        finally {
            setLoading(false); // โหลดเสร็จ → ซ่อนโปรเกรส
        }
    };
    const handleEditClick = (rowData) => {
        //console.log('Edit row data:', rowData);// Show the popup
        // Here you can open a modal or navigate to an edit page with rowData
        navigate("/editForm", { state: rowData });
    };

    const handleDeleteClick = (rowData) => {
        //console.log('Delete row data:', rowData);
        setSelectedRow(rowData); // Set the row data for the popup
        setPopupVisible(true); // Show the popup
        // Here you can open a modal or navigate to an edit page with rowData
    };


    const fetchData = async () => {
        try {
            const data = await getTrueAlarmList();
            setRows(data || []);
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);
    const closePopup = () => {
        setPopupVisible(false); // Hide the popup
        setSelectedRow(null); // Clear the selected row
    };

    const deleteRow = async () => {
        //console.log(selectedRow.id)
        try {

    const token = localStorage.getItem("jwt_token");
            const response = await fetch(`${REACT_APP_API_BASE_URL}/deleteIncident`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ id: selectedRow.id })
            });
            if (response.ok) {
                //console.log('Delete successful');
                await fetchData(); // Fetch ข้อมูลใหม่หลังจากลบสำเร็จ
            } else {
                const errorText = await response.text(); // ใช้ await ที่นี่
                console.error('Failed to delete:', errorText);
            }
        } catch (err) {
            console.error(err.message)
        }
        setPopupVisible(false); // Hide the popup
        setSelectedRow(null); // Clear the selected row
    }

    const columns = [
        // { field: 'id', headerName: 'ID', width: 70 },
        // { field: 'incident_id', headerName: 'Incident ID', width: 130 },
        { field: 'incident_no', headerName: 'Incident NO.', width: 120 },
        {
            field: 'event_time',
            headerName: 'เวลาเกิดเหตุ',
            valueGetter: (params) => {
                if (params) {
                    return params.replace(/\+\d{2}$/, '');
                }
                return ""
            }
        },
        {
            field: 'mioc_contract_time',
            headerName: 'เวลาติดต่อเจ้าหน้าที่',
            valueGetter: (params) => {
                if (params) {
                    return params.replace(/\+\d{2}$/, '');
                }
                return ""
            }
        },
        {
            field: 'officer_check_time',
            headerName: 'เวลาที่เข้าตรวจสอบ',
            valueGetter: (params) => {
                if (params) {
                    return params.replace(/\+\d{2}$/, '');
                }
                return ""
            }
        },
        {
            field: 'arrest_time',
            headerName: 'arrest_time',
            valueGetter: (params) => {
                if (params) {
                    return params.replace(/\+\d{2}$/, '');
                }
                return ""
            }
        },
        {
            field: 'last_seen_time',
            headerName: 'last_seen_time',
            valueGetter: (params) => {
                if (params) {
                    return params.replace(/\+\d{2}$/, '');
                }
                return ""
            }
        },
        {
            field: 'mioc_staff_name',
            headerName: 'mioc_staff_name'
        },
        {
            field: 'mioc_staff_phone',
            headerName: 'mioc_staff_phone'
        },
        {
            field: 'security_name',
            headerName: 'security_name'
        },
        {
            field: 'security_phone',
            headerName: 'security_phone'
        },
        {
            field: 'additional_note',
            headerName: 'additional_note'
        },
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
                <div
                    style={{
                        display: 'flex', gap: '8px', alignItems: 'center', paddingTop: 7
                    }}
                >
                    <button
                        onClick={() => handleReportClick(params.row)}
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
                        <SummarizeIcon style={{ width: '20px', height: '20px' }} />
                    </button>
                    <button
                        onClick={() => handleEditClick(params.row)}
                        style={{
                            backgroundColor: '#FCDC94',
                            color: '#000',
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
                        <ConstructionIcon style={{ width: '20px', height: '20px' }} /> {/* Set explicit width and height */}
                    </button>
                    <button
                        onClick={() => handleDeleteClick(params.row)}
                        style={{
                            backgroundColor: '#EF9C66',
                            color: '#000',
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
                        <DeleteIcon style={{ width: '20px', height: '20px' }} /> {/* Set explicit width and height */}
                    </button>
                </div>



            ),
        },


    ];

    const [rows, setRows] = useState([]);
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);



    const paginationModel = { page: 0, pageSize: 10 };
    return (<div className="App" style={{ height: 'auto', minHeight: '89vh' }}>
        {popupVisible && (
            <Popup trigger={true} onClose={closePopup}>
                <h3>คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?</h3>
                <p>{selectedRow ? JSON.stringify(selectedRow, null, 2) : ''}</p>
                <button onClick={deleteRow} style={{
                    padding: '10px 20px',
                    backgroundColor: '#EF9C66',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}>
                    ยืนยัน
                </button>
                <button onClick={closePopup} style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent', // ทำให้พื้นหลังโปร่งใส
                    color: '#EF9C66', // สีของข้อความ
                    border: '2px solid #EF9C66', // เพิ่มเส้นขอบ
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginLeft: 10,
                }}>
                    ยกเลิก
                </button>
            </Popup>
        )}

        <div className='d-flex justify-content-center align-items-start' style={{ paddingTop: '10px', marginTop: 10, marginBottom: '20px' }}>
            <Paper sx={{
                width: '90%',
                backgroundColor: '#F5F5F7',
                height: 'auto'
            }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    initialState={{ pagination: { paginationModel } }}
                    pageSizeOptions={[10, 15, 20]}
                    //   checkboxSelection
                    sx={{ border: 0 }}
                />
            </Paper>
        </div>

        {loading && <div class="align-items-center justify-content-center">
            <div class="spinner-border ms-auto me-2" aria-hidden="true"></div>
            <strong role="status">Loading Report ...</strong>
        </div>
        }
    </div>
    )
}
export default TrueAlarm;