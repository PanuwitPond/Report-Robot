import React, { useState, useEffect } from "react";
import Select, { SingleValue, StylesConfig } from "react-select";
import { useNavigate } from "react-router-dom";
import './PageReport.css'; // Import CSS

// Interface
interface OptionType {
    value: string | number;
    label: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// --- Custom Styles สำหรับ React-Select ---
const customSelectStyles: StylesConfig<OptionType, false> = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: '#fff',
        borderColor: state.isFocused ? '#2563eb' : '#d1d5db',
        borderRadius: '8px',
        padding: '2px',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(37, 99, 235, 0.1)' : 'none',
        '&:hover': {
            borderColor: '#9ca3af'
        }
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : '#fff',
        color: state.isSelected ? '#fff' : '#374151',
        cursor: 'pointer',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#1f2937',
        fontWeight: 500,
        textAlign: 'left'
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#9ca3af',
        fontSize: '0.95rem'
    })
};

const PageReport: React.FC = () => {
    const [options, setOptions] = useState<OptionType[]>([]);
    const [site, setSite] = useState<string | null>(null);
    const [year, setYear] = useState<string | number>(new Date().getFullYear());
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [loading, setLoading] = useState<boolean>(false);
    const [hoverBtn1, setHoverBtn1] = useState(false);
    const [hoverBtn2, setHoverBtn2] = useState(false);
    const [hoverBtn3, setHoverBtn3] = useState(false);

    const navigate = useNavigate();

    // Debug: Log hover state changes
    console.log('🎨 Button Hover States:', { hoverBtn1, hoverBtn2, hoverBtn3 });

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
                navigate("/");
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    };

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

    const handleDownload = async (endpoint: string, filenamePrefix: string) => {
        if (!site) {
            alert("กรุณาเลือก Site ก่อน");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_BASE_URL}/reports/jasper/${endpoint}?site=${site}&month=${month}&year=${year}`, {
                method: "GET",
                headers: { "Content-Type": "application/pdf", "Authorization": `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            downloadBlob(blob, `report_${filenamePrefix}_${site}_${month}_${year}.pdf`);
        } catch (error) {
            console.error('Error fetching report:', error);
            alert('ไม่สามารถดาวน์โหลดรายงานได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
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
        { value: 1, label: "มกราคม" }, { value: 2, label: "กุมภาพันธ์" }, { value: 3, label: "มีนาคม" },
        { value: 4, label: "เมษายน" }, { value: 5, label: "พฤษภาคม" }, { value: 6, label: "มิถุนายน" },
        { value: 7, label: "กรกฎาคม" }, { value: 8, label: "สิงหาคม" }, { value: 9, label: "กันยายน" },
        { value: 10, label: "ตุลาคม" }, { value: 11, label: "พฤศจิกายน" }, { value: 12, label: "ธันวาคม" }
    ];

    const currentYear = new Date().getFullYear();
    const year_option = Array.from({ length: 10 }, (_, i) => ({
        value: currentYear - i,
        label: `${currentYear - i}`
    }));

    return (
        <div className="page-report-container">
            <div className="report-card">
                <div className="report-header">
                    <h1 className="report-title">Report Generator</h1>
                    <p className="report-subtitle">เลือกข้อมูลเพื่อดาวน์โหลดรายงาน PDF</p>
                </div>

                <div className="card-content">
                    {/* Site Selector */}
                    <div className="form-group">
                        <label className="form-label">Site Name</label>
                        <Select 
                            options={options} 
                            styles={customSelectStyles}
                            onChange={(newValue) => {
                                const selected = newValue as SingleValue<OptionType>;
                                setSite(selected ? (selected.value as string) : null);
                            }}
                            placeholder="-- เลือก Site --"
                        />
                    </div>

                    {/* Month Selector */}
                    <div className="form-group">
                        <label className="form-label">Month</label>
                        <Select 
                            options={month_option} 
                            styles={customSelectStyles}
                            onChange={(newValue) => {
                                const selected = newValue as SingleValue<OptionType>;
                                setMonth(selected ? (selected.value as number) : 1);
                            }}
                            defaultValue={month_option[new Date().getMonth()]}
                            placeholder="-- เลือกเดือน --"
                        />
                    </div>

                    {/* Year Selector */}
                    <div className="form-group">
                        <label className="form-label">Year</label>
                        <Select 
                            options={year_option} 
                            styles={customSelectStyles}
                            value={year_option.find(option => option.value === year)}
                            onChange={(selectedOption) => {
                                if (selectedOption) setYear(selectedOption.value);
                            }}
                            placeholder={currentYear.toString()}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="button-group">
                        <button 
                            className="report-btn"
                            onClick={() => handleDownload('gbbut', 'gbb-ut')}
                        >
                            📄 ออกรีพอร์ตสำหรับ GBB-UT
                        </button>
                        
                        <button 
                            className="report-btn"
                            onClick={() => handleDownload('general', 'general')}
                        >
                            📊 ออกรีพอร์ตสำหรับ Site อื่นๆ
                        </button>
                        
                        <button 
                            className="report-btn"
                            onClick={() => handleDownload('face-rec', 'face_rec')}
                        >
                            👤 ออกรีพอร์ต Face Recognition
                        </button>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="loading-overlay">
                            <div className="spinner"></div>
                            <span>กำลังสร้างรายงาน...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PageReport;