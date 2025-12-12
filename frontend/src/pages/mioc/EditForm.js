


// import * as React from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useLocation, useNavigate } from "react-router-dom";

const base_api = window._env_.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const token = localStorage.getItem("jwt_token");

dayjs.extend(utc);
dayjs.extend(timezone);


function time_conv(str) {
    if (str != null) {
        let time_part = str.split("+")[0]
        time_part = time_part.split(":");
        // console.log(time_part)
        return dayjs().set('hour', time_part[0]).set('minute', time_part[1]).set('second', 0);
    }
    return null
}

// const data = {
//     "id": "93f031d2-a2d0-420a-8bdd-a85066156330",
//     "incident_id": "061886b8-025a-416f-b1ad-a433fe616f2e",
//     "incident_no": "TEST03",
//     "description_of_incident": null,
//     "event_time": null,
//     "mioc_contract_time": null,
//     "officer_check_time": null,
//     "arrest_flag": null,
//     "arrest_time": null,
//     "last_seen_time": null,
//     "mioc_staff_name": null,
//     "mioc_staff_phone": null,
//     "suspect": null,
//     "security_name": null,
//     "security_phone": null,
//     "conclusion": null,
//     "additional_note": null,
//     "created_at": null,
//     "updated_at": null,
//     "deleted_at": null
// }


function EditForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const defaultData = {
        id: null,
        incident_id: null,
        incident_no: "",
        description_of_incident: "",
        event_time: "",
        mioc_contract_time: "",
        officer_check_time: "",
        arrest_flag: false,
        arrest_time: null,
        last_seen_time: "",
        mioc_staff_name: "",
        mioc_staff_phone: "",
        security_name: "",
        security_phone: "",
        conclusion: "",
        additional_note: "",
        created_at: null,
        updated_at: null,
        deleted_at: null,
    };

    const data = { ...defaultData, ...(location.state || {}) };
    //console.log(data.id, data.incident_id, data.incident_no);

    const [eventTime, setEventTime] = useState(time_conv(data.event_time))
    const [miocContractTime, setMiocContractTime] = useState(time_conv(data.mioc_contract_time))
    // const [miocContractTime, setMiocContractTime] = useState(time_conv(null))
    const [officerCheckTime, setOfficerCheckTime] = useState(time_conv(data.officer_check_time))
    const [arrestTime, setArrestTime] = useState(time_conv(data.arrest_time))
    const [lastSeenTime, setLastSeenTime] = useState(time_conv(data.last_seen_time))


    const [formValues, setFormValues] = useState({
        mioc_staff_name: data.mioc_staff_name,
        security_name: data.security_name,
        conclusion: data.conclusion,
        arrest_flag: data.arrest_flag,
        suspect: data.suspect,
        desc_inp: data.description_of_incident,
        add_note: data.additional_note,
        security_phone: data.security_phone,
        mioc_staff_phone: data.mioc_staff_phone,
        arrest_flag: data.arrest_flag
    });
    const handleChange = (event) => {
        const { name, type, checked, value } = event.target;
        setFormValues({
            ...formValues,
            [name]: type === 'checkbox' ? checked : value,
        });
        //console.log(event.target.value)
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const textarea = e.target;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;

            // ตรวจสอบว่ากำลังอยู่ในบรรทัดที่มี bullet หรือไม่
            const currentLineStart = value.lastIndexOf('\n', start - 1) + 1;
            const currentLine = value.substring(currentLineStart, start);

            // ถ้าบรรทัดปัจจุบันเริ่มด้วย bullet
            if (currentLine.trim().startsWith('• ') || currentLine.trim().startsWith('- ')) {
                const newValue = value.substring(0, start) + '\n• ' + value.substring(end);
                textarea.value = newValue;

                // ย้าย cursor ไปหลัง bullet ใหม่
                const newCursorPos = start + 3;
                textarea.setSelectionRange(newCursorPos, newCursorPos);
            } else {
                // เพิ่ม bullet ใหม่
                const newValue = value.substring(0, start) + '\n• ' + value.substring(end);
                textarea.value = newValue;

                // ย้าย cursor ไปหลัง bullet ใหม่
                const newCursorPos = start + 3;
                textarea.setSelectionRange(newCursorPos, newCursorPos);
            }

            // Trigger onChange event
            handleChange(e);
        }
    };

    const row_margin_bottom = 15


    const handleSubmit = (event) => {
        event.preventDefault();
        const dataToUpdate = {
            "id": data.id,
            "description_of_incident": formValues.desc_inp,
            "event_time": eventTime == null ? eventTime : dayjs(eventTime).tz('Asia/Bangkok').format('HH:mm:ss Z'),
            "mioc_contract_time": miocContractTime == null ? miocContractTime : dayjs(miocContractTime).tz('Asia/Bangkok').format('HH:mm:ss Z'),
            "officer_check_time": officerCheckTime == null ? officerCheckTime : dayjs(officerCheckTime).tz('Asia/Bangkok').format('HH:mm:ss Z'),
            "arrest_time": arrestTime == null ? arrestTime : dayjs(arrestTime).tz('Asia/Bangkok').format('HH:mm:ss Z'),
            "mioc_staff_name": formValues.mioc_staff_name,
            "security_name": formValues.security_name,
            "last_seen_time": lastSeenTime == null ? lastSeenTime : dayjs(lastSeenTime).tz('Asia/Bangkok').format('HH:mm:ss Z'),
            "mioc_staff_phone": formValues.mioc_staff_phone,
            "security_phone": formValues.security_phone,
            "conclusion": formValues.conclusion,
            "additional_note": formValues.add_note,
            "suspect": formValues.suspect,
            "arrest_flag": formValues.arrest_flag

        }
        //console.log(dataToUpdate)
        // console.log("Form submitted with values:", formValues);
        // ทำงานที่ต้องการเมื่อ submit เช่น ส่งข้อมูลไปยัง API

        try {
            const response = fetch(`${base_api}/updateIncident`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(dataToUpdate)
            });
            //console.log(response)
            navigate(-1);
        } catch (err) {
            console.error(err.message)
        }
    };


    return (
        <div className="App container-fluid d-flex justify-content-center align-items-center " style={{
            minHeight: '50vh',
            overflowY: 'auto', // เพิ่มการเลื่อนในแนวตั้ง
            padding: '10px' // เพิ่ม padding เพื่อไม่ให้ฟอร์มชนขอบหน้าจอ
        }}>
            <div className="card" style={{ width: '70rem', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', padding: 20, marginTop: 50, }}>
                <form onSubmit={handleSubmit}>
                    <div className="row" style={{ marginBottom: row_margin_bottom }}>
                        <div className="col">
                            <label htmlFor="incident_id" className="text-start d-block">Incident ID :</label>
                            <input type="text" readOnly className="form-control-plaintext disabled-input" id="incident_id" value={data.incident_id} style={{ color: "gray", userSelect: "none", pointerEvents: "none" }} />
                        </div>
                        <div className="col">
                            <label htmlFor="incident_no" className="text-start d-block">Incident NO. :</label>
                            <input type="text" readOnly className="form-control-plaintext disabled-input" id="incident_no" value={data.incident_no} style={{ color: "gray", userSelect: "none", pointerEvents: "none" }} />
                        </div>
                        <div className="col">
                            <label htmlFor="created_at" className="text-start d-block">สร้างเมื่อ :</label>
                            <input type="text" readOnly className="form-control-plaintext disabled-input" id="created_at" value={data.created_at ? new Date(data.created_at).toLocaleString('th-TH', {
                                timeZone: 'Asia/Bangkok',
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                            }) : '-'} style={{ color: "gray", userSelect: "none", pointerEvents: "none" }} />
                        </div>
                    </div>
                    <div className="row" style={{ marginBottom: row_margin_bottom }}>
                        <div className="col">
                            <label htmlFor="event_time" className="text-start d-block">เวลาเกิดเหตุ :</label>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                    timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                                    defaultValue={eventTime}
                                    onChange={(newValue) => setEventTime(newValue)}
                                    ampm={false}
                                    onClear={() => setEventTime(null)} 
                                    clearable
                                    sx={{ '& .MuiInputBase-root': { height: 37, width: "58vh" } }} />
                            </LocalizationProvider>
                        </div>
                        <div className="col">
                            <label htmlFor="created_at" className="text-start d-block">เวลาที่ MIOC ติดต่อเจ้าหน้าที่ :</label>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                    timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                                    defaultValue={miocContractTime}
                                    onChange={(newValue) => setMiocContractTime(newValue)}
                                    ampm={false}
                                    sx={{ '& .MuiInputBase-root': { height: 37, width: "58vh" } }} />
                            </LocalizationProvider>
                        </div>
                        <div className="col">
                            <label htmlFor="created_at" className="text-start d-block">เวลาที่เจ้าหน้าที่เข้าตรวจสอบ :</label>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                    timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                                    defaultValue={miocContractTime}
                                    onChange={(newValue) => setOfficerCheckTime(newValue)}
                                    ampm={false}
                                    sx={{ '& .MuiInputBase-root': { height: 37, width: "58vh" } }} />
                            </LocalizationProvider>
                        </div>
                    </div>
                    <div className="row" style={{ marginBottom: row_margin_bottom }}>
                        <div className="col">
                            <label htmlFor="officer_check_time" className="text-start d-block">เวลาที่เจ้าหน้าที่เข้าควบคุม :</label>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                    timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                                    defaultValue={arrestTime}
                                    onChange={(newValue) => setArrestTime(newValue)} // อัปเดตค่าเมื่อมีการเปลี่ยนแปลง
                                    ampm={false}
                                    sx={{ '& .MuiInputBase-root': { height: 37, width: '58vh' } }}
                                />
                            </LocalizationProvider>
                        </div>
                        <div className="col">
                            <label htmlFor="mioc_staff_name" className="text-start d-block">ชื่อเจ้าหน้าที่ MIOC :</label>
                            <input type="text" className="form-control " id="mioc_staff_name" name="mioc_staff_name" onChange={handleChange} defaultValue={formValues.mioc_staff_name} />
                        </div>
                        <div className="col">
                            <label htmlFor="security_name" className="text-start d-block">ชื่อเจ้าหน้าที่รักษาความปลอดภัย :</label>
                            <input type="text" className="form-control " id="security_name" name='security_name' defaultValue={formValues.security_name} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="row" style={{ marginBottom: row_margin_bottom }}>
                        <div className="col">
                            <label htmlFor="last_seen_time" className="text-start d-block">เวลาที่เห็นครั้งสุดท้าย :</label>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                    defaultValue={lastSeenTime}
                                    timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                                    onChange={(newValue) => setLastSeenTime(newValue)} // อัปเดตค่าเมื่อมีการเปลี่ยนแปลง
                                    ampm={false}
                                    sx={{ '& .MuiInputBase-root': { height: 37, width: '58vh' } }}
                                />
                            </LocalizationProvider>
                        </div>
                        <div className="col">
                            <label htmlFor="mioc_staff_phone" className="text-start d-block">เบอร์ติดต่อเจ้าหน้าที่ MIOC :</label>
                            <input type="text" className="form-control " id="mioc_staff_phone" name='mioc_staff_phone' onChange={handleChange} defaultValue={formValues.mioc_staff_phone} />
                        </div>
                        <div className="col">
                            <label htmlFor="security_phone" className="text-start d-block">เบอร์ติดต่อเจ้าหน้าที่รักษาความปลอดภัย :</label>
                            <input type="text" className="form-control " id="security_phone" name='security_phone' onChange={handleChange} defaultValue={formValues.security_phone} />
                        </div>
                    </div>
                    <div className='row' style={{ marginBottom: row_margin_bottom }}>
                        <div className="col">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="arrest_flag" name='arrest_flag' onChange={handleChange} defaultChecked={formValues.arrest_flag} />
                                <label className="form-check-label text-start d-block" htmlFor="gridCheck">
                                    ควบคุมได้
                                </label>
                            </div>
                        </div>
                        <div className='col'>
                            <label className="mr-sm-2" htmlFor="inlineFormCustomSelect" style={{ marginRight: 10 }}>น่าสงสัย</label>
                            <select className="custom-select mr-sm-2" id="suspect" name='suspect' onChange={handleChange} defaultValue={formValues.suspect}>
                                <option selected>Choose...</option>
                                <option value="N">N</option>
                                <option value="A">A</option>
                                <option value="N/A">N/A</option>
                            </select>
                        </div>
                        <div className='col'>
                        </div>
                        <div className='col'>
                        </div>
                    </div>
                    <div className="row" style={{ marginBottom: row_margin_bottom }}>
                        <div className="col">
                            <label htmlFor="description_of_incident" className="text-start d-block" name="desc_inp">คำอธิบายเหตุการณ์ :</label>
                            <textarea className="form-control" id="description_of_incident" name="desc_inp" defaultValue={formValues.desc_inp|| "• "} onChange={handleChange} onKeyDown={handleKeyDown} rows="5"></textarea>
                        </div>
                        <div className="col">
                            <label htmlFor="conclusion" className="text-start d-block">สรุป :</label>
                            <textarea className="form-control" id="conclusion" name='conclusion' onChange={handleChange} defaultValue={formValues.conclusion || "• "} onKeyDown={handleKeyDown} rows="5"></textarea>
                        </div>
                    </div>
                    <div className="row" style={{ marginBottom: row_margin_bottom }}>
                        <div className="col">
                            <label htmlFor="additional_note" className="text-start d-block" name="add_note">เพิ่มเติม :</label>
                            <textarea className="form-control" id="conclusion" defaultValue={formValues.add_note} name='add_note' onChange={handleChange} rows="5"></textarea>
                        </div>
                    </div>
                    <button type="submit" className="btn" style={{ backgroundColor: "#6532a4", color: "#FFFFFF" }}>Submit</button>
                </form>
            </div>
        </div>
    );
}

export default EditForm


