import React, { useState, useEffect } from "react";
// import { DataGrid } from '@mui/x-data-grid'; // ไม่ได้ใช้ใน JSX ขอ comment ไว้ก่อน
// import Paper from '@mui/material/Paper'; // ไม่ได้ใช้ใน JSX
// import ConstructionIcon from '@mui/icons-material/Construction'; // ไม่ได้ใช้
// import DeleteIcon from '@mui/icons-material/Delete'; // ไม่ได้ใช้
// import SummarizeIcon from '@mui/icons-material/Summarize'; // ไม่ได้ใช้
// import Popup from './components/Popup'; // ไม่ได้ใช้ใน JSX
import Select, { SingleValue } from "react-select";
import { useNavigate, useLocation } from "react-router-dom";
// import './App.css'; // ตรวจสอบว่าไฟล์ CSS นี้มีอยู่ในโปรเจกต์ใหม่หรือไม่ ถ้าไม่มีให้ comment ออก หรือย้ายไฟล์มา

// กำหนด Interface สำหรับ Option ของ Select
interface OptionType {
    value: string | number;
    label: string;
}

// จัดการตัวแปร Environment จาก Window (เพื่อให้รองรับ config แบบเก่า)
const REACT_APP_API_BASE_URL = (window as any)._env_?.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = 'http://localhost:3001/api';
const PageReport: React.FC = () => {
    // กำหนด Type ให้ State
    const [options, setOptions] = useState<OptionType[]>([]);
    const [site, setSite] = useState<string | null>(null);
    const [year, setYear] = useState<string | number>(new Date().getFullYear());
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1); // +1 เพราะ getMonth() เริ่มที่ 0 แต่ Option เริ่มที่ 1
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();
    const location = useLocation();
    // const { username } = location.state || {}; // ไม่ได้ใช้งาน username ในหน้านี้ แต่เก็บไว้ได้

    const get_cam_owner = async (): Promise<string[]> => {
        const token = localStorage.getItem("access_token");
        try {
            const response = await fetch(`${API_BASE_URL}/reports/cam-owners`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            if (!response.ok) {
                navigate("/"); // ถ้า Token หมดอายุหรือ Error ให้ดีดกลับหน้าแรก
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    const handleGbbutClick = async () => {
        if (!site) {
            alert("กรุณาเลือก Site ก่อน");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_BASE_URL}/reports/jasper/gbbut?site=${site}&month=${month}&year=${year}`,{
                method: "GET",
                headers: { "Content-Type": "application/pdf", "Authorization": `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Network response was not ok');
            
            const blob = await response.blob();
            downloadBlob(blob, `report_gbb-ut_${site}_${month}_${year}.pdf`);
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFecRec = async () => {
        if (!site) {
            alert("กรุณาเลือก Site ก่อน");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_BASE_URL}/reports/jasper/face-rec?site=${site}&month=${month}&year=${year}`, {
                method: "GET",
                headers: { "Content-Type": "application/pdf", "Authorization": `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            downloadBlob(blob, `report_face_rec_${site}_${month}_${year}.pdf`);
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReport = async () => {
        if (!site) {
            alert("กรุณาเลือก Site ก่อน");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_BASE_URL}/reports/jasper/general?site=${site}&month=${month}&year=${year}`, {
                method: "GET",
                headers: { "Content-Type": "application/pdf", "Authorization": `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            downloadBlob(blob, `report_${site}_${month}_${year}.pdf`);
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันช่วยดาวน์โหลด (เพื่อลดโค้ดซ้ำ)
    const downloadBlob = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    useEffect(() => {
        async function loadData() {
            const cam_owner = await get_cam_owner();
            if (cam_owner && Array.isArray(cam_owner)) {
                const opts: OptionType[] = cam_owner.map((owner: string) => ({
                    value: owner,
                    label: owner
                }));
                setOptions(opts);
            }
        }
        loadData();
    }, []);

    const month_option: OptionType[] = [
        { value: 1, label: "มกราคม" },
        { value: 2, label: "กุมภาพันธ์" },
        { value: 3, label: "มีนาคม" },
        { value: 4, label: "เมษายน" },
        { value: 5, label: "พฤษภาคม" },
        { value: 6, label: "มิถุนายน" },
        { value: 7, label: "กรกฎาคม" },
        { value: 8, label: "สิงหาคม" },
        { value: 9, label: "กันยายน" },
        { value: 10, label: "ตุลาคม" },
        { value: 11, label: "พฤศจิกายน" },
        { value: 12, label: "ธันวาคม" }
    ];

   const currentYear = new Date().getFullYear();
const year_option = Array.from({ length: 10 }, (_, i) => ({
    value: currentYear - i,
    label: `${currentYear - i}`
}));
    return (
        // แก้ไข class -> className ทั้งหมด
        <div className="PageReport" style={{ height: 'auto', minHeight: '89vh', padding: '20px' }}>
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="card" style={{ width: '24rem', color: '#333' }}> 
                    {/* เพิ่ม color: #333 เพราะโปรเจกต์ใหม่อาจพื้นหลังเข้ม ตัวหนังสือต้องเข้มตามการ์ด */}
                    <div className="card-body">
                        <label className="form-label">Site</label>
                        <Select 
                            options={options} 
                            onChange={(newValue) => {
                                const selected = newValue as SingleValue<OptionType>;
                                setSite(selected ? (selected.value as string) : null);
                            }}
                            placeholder="Select Site..."
                        />
                        
                        <div className="mt-2"></div>
                        
                        <label className="form-label">Month</label>
                        <Select 
                            options={month_option} 
                            onChange={(newValue) => {
                                const selected = newValue as SingleValue<OptionType>;
                                setMonth(selected ? (selected.value as number) : 1);
                            }}
                            defaultValue={month_option[new Date().getMonth()]} // เลือกเดือนปัจจุบันเป็นค่าเริ่มต้น
                        />

                        <div className="mb-3 mt-2">
                            <label className="form-label">Year</label>
                            <Select 
                                className="form-control" // ถ้าเป็น react-select อาจจะต้องลบ class นี้ออก หรือใช้ classPrefix แทน
                                id="exampleFormControlInput1"
                                placeholder={currentYear.toString()}
                                
                                // --- ส่วนที่แก้ไข ---
                                options={year_option} 
                                
                                // กรณีใช้ Library (เช่น React-Select) value มักต้องใส่เป็น Object ที่ตรงกับ options
                                value={year_option.find(option => option.value === year)}
                                
                                // เวลาเลือกค่า Library ส่วนใหญ่จะส่งคืนเป็น Object {value, label} ไม่ใช่ event (e)
                                onChange={(selectedOption) => {
                                    if (selectedOption) {
                                        setYear(selectedOption.value);
                                    } else {
                                        setYear(null); // หรือใส่ค่า default ที่ต้องการเมื่อ user ล้างค่า
                                    }
                                }}
                                // ------------------
                            />
                        </div>

                        <div className="d-grid gap-2">
                            <button className="btn btn-primary" onClick={handleGbbutClick}>
                                ออกรีพอร์ตสำหรับ GBB-UT
                            </button>
                            <button className="btn btn-primary" onClick={handleReport}>
                                ออกรีพอร์ตสำหรับ Site อื่นๆ
                            </button>
                            <button className="btn btn-primary" onClick={handleFecRec}>
                                ออกรีพอร์ตสำหรับ Face Recognition
                            </button>
                        </div>

                        {loading && (
                            <div className="d-flex align-items-center justify-content-center mt-3">
                                <div className="spinner-border ms-auto me-2" role="status" aria-hidden="true"></div>
                                <strong>Loading Report ...</strong>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PageReport;