import React, { useState, useEffect } from 'react';
import { 
    Grid, TextField, Button, DialogActions, Typography,
    FormControlLabel, Checkbox, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

interface EditFormProps {
    data?: any;
    onClose?: () => void;
    onSaveSuccess?: () => void;
}

const API_BASE_URL = 'http://localhost:3001/api';

const EditForm: React.FC<EditFormProps> = ({ data = {}, onClose, onSaveSuccess }) => {
    const [loading, setLoading] = useState(false);
    
    // ✅ ฟังก์ชันช่วยแปลงค่าให้เป็นเวลา (HH:mm) สำหรับ input type="time"
    const formatTimeForInput = (val: string) => {
        if (!val) return '';
        try {
            // กรณี 1: ข้อมูลมาเป็น ISO String (เช่น 2025-12-25T14:30:00)
            if (val.includes('T')) {
                return val.split('T')[1].substring(0, 5); 
            }
            // กรณี 2: ข้อมูลมาเป็น Time String (เช่น 14:30:00)
            if (val.includes(':')) {
                return val.substring(0, 5);
            }
            return '';
        } catch (e) {
            return '';
        }
    };

    const [formData, setFormData] = useState({
        incident_no: '',
        event_time: '',
        mioc_contract_time: '',
        officer_check_time: '',
        arrest_time: '',
        last_seen_time: '',
        mioc_staff_name: '',
        mioc_staff_phone: '',
        security_name: '',
        security_phone: '',
        additional_note: '',
        description_of_incident: '',
        conclusion: '',
        arrest_flag: false,
        suspect: '',
    });

    useEffect(() => {
        if (data) {
            setFormData({
                incident_no: data.incident_no || '',
                // ✅ ใช้ formatTimeForInput ดึงเฉพาะเวลามาแสดง
                event_time: formatTimeForInput(data.event_time),
                mioc_contract_time: formatTimeForInput(data.mioc_contract_time),
                officer_check_time: formatTimeForInput(data.officer_check_time),
                arrest_time: formatTimeForInput(data.arrest_time),
                last_seen_time: formatTimeForInput(data.last_seen_time),
                mioc_staff_name: data.mioc_staff_name || '',
                mioc_staff_phone: data.mioc_staff_phone || '',
                security_name: data.security_name || '',
                security_phone: data.security_phone || '',
                additional_note: data.additional_note || '',
                description_of_incident: data.description_of_incident || '',
                conclusion: data.conclusion || '',
                arrest_flag: data.arrest_flag || false,
                suspect: data.suspect || '',
            });
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleSelectChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            const endpoint = data?.id 
                ? `${API_BASE_URL}/incidents/${data.id}/update`
                : `${API_BASE_URL}/incidents/create`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save');
            
            if (onSaveSuccess) onSaveSuccess();
            if (onClose) onClose();
        } catch (error) {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: '10px 0' }}>
            <Grid container spacing={2}>
                {/* 1. Incident NO. */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Incident NO."
                        name="incident_no"
                        value={formData.incident_no}
                        disabled
                        variant="filled"
                        size="small"
                    />
                </Grid>

                {/* ✨ เพิ่ม: Checkbox "ควบคุมได้" */}
                <Grid item xs={6}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="arrest_flag"
                                checked={formData.arrest_flag}
                                onChange={handleCheckboxChange}
                            />
                        }
                        label="ควบคุมได้"
                    />
                </Grid>

                {/* ✨ เพิ่ม: Dropdown "น่าสงสัย" */}
                <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                        <InputLabel>น่าสงสัย</InputLabel>
                        <Select
                            name="suspect"
                            value={formData.suspect}
                            onChange={handleSelectChange}
                            label="น่าสงสัย"
                        >
                            <MenuItem value="">ไม่ระบุ</MenuItem>
                            <MenuItem value="N">N</MenuItem>
                            <MenuItem value="A">A</MenuItem>
                            <MenuItem value="N/A">N/A</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        type="time"  
                        label="เวลาเกิดเหตุ"
                        name="event_time"
                        value={formData.event_time}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                    />
                </Grid>

                {/* 3. เวลาติดต่อเจ้าหน้าที่ */}
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        type="time"
                        label="เวลาติดต่อเจ้าหน้าที่"
                        name="mioc_contract_time"
                        value={formData.mioc_contract_time}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                    />
                </Grid>

                {/* 4. เวลาที่เข้าตรวจสอบ */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        type="time"
                        label="เวลาที่เข้าตรวจสอบ"
                        name="officer_check_time"
                        value={formData.officer_check_time}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                    />
                </Grid>

                {/* 5. arrest_time */}
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        type="time"
                        label="arrest_time"
                        name="arrest_time"
                        value={formData.arrest_time}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                    />
                </Grid>

                {/* 6. last_seen_time */}
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        type="time"
                        label="last_seen_time"
                        name="last_seen_time"
                        value={formData.last_seen_time}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                    />
                </Grid>

                {/* --- ส่วนอื่นๆ คงเดิม --- */}
                <Grid item xs={6}>
                    <TextField
                        fullWidth label="mioc_staff_name" name="mioc_staff_name"
                        value={formData.mioc_staff_name} onChange={handleChange} size="small"
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth label="mioc_staff_phone" name="mioc_staff_phone"
                        value={formData.mioc_staff_phone} onChange={handleChange} size="small"
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth label="security_name" name="security_name"
                        value={formData.security_name} onChange={handleChange} size="small"
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth label="security_phone" name="security_phone"
                        value={formData.security_phone} onChange={handleChange} size="small"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth multiline rows={2} label="additional_note" name="additional_note"
                        value={formData.additional_note} onChange={handleChange} size="small"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth multiline rows={3} label="คำอธิบาย" name="description_of_incident"
                        value={formData.description_of_incident} onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth multiline rows={3} label="สรุป (ใส่ข้อมูลเพื่อจบงาน)" name="conclusion"
                        value={formData.conclusion} onChange={handleChange}
                        placeholder="หากระบุข้อมูลในช่องนี้ ระบบจะถือว่าจบงาน (Complete)"
                        color="primary" focused
                    />
                </Grid>
            </Grid>

            <DialogActions sx={{ mt: 3, px: 0 }}>
                <Button onClick={onClose} color="inherit" disabled={loading}>
                    ยกเลิก
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ minWidth: 100 }}>
                    {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
            </DialogActions>
        </form>
    );
};

export default EditForm;