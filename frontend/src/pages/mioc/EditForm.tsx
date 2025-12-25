import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface EditFormProps {
    data?: any;
    onClose?: () => void;
}

const API_BASE_URL = 'http://localhost:3001/api';

const EditForm: React.FC<EditFormProps> = ({ data = {}, onClose }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        incident_no: data.incident_no || '',
        event_time: data.event_time || '',
        mioc_contract_time: data.mioc_contract_time || '',
        officer_check_time: data.officer_check_time || '',
        arrest_flag: data.arrest_flag || false,
        arrest_time: data.arrest_time || '',
        last_seen_time: data.last_seen_time || '',
        mioc_staff_name: data.mioc_staff_name || '',
        mioc_staff_phone: data.mioc_staff_phone || '',
        security_name: data.security_name || '',
        security_phone: data.security_phone || '',
        conclusion: data.conclusion || '',
        additional_note: data.additional_note || '',
        description_of_incident: data.description_of_incident || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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
            
            alert('บันทึกข้อมูลสำเร็จ');
            if (onClose) onClose();
            else navigate(-1);
        } catch (error) {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>แก้ไขข้อมูล Incident</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Incident No:</label>
                    <input
                        type="text"
                        name="incident_no"
                        value={formData.incident_no}
                        onChange={handleChange}
                        disabled
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Event Time:</label>
                    <input
                        type="datetime-local"
                        name="event_time"
                        value={formData.event_time}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>MIOC Contact Time:</label>
                    <input
                        type="datetime-local"
                        name="mioc_contract_time"
                        value={formData.mioc_contract_time}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Officer Check Time:</label>
                    <input
                        type="datetime-local"
                        name="officer_check_time"
                        value={formData.officer_check_time}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>MIOC Staff Name:</label>
                    <input
                        type="text"
                        name="mioc_staff_name"
                        value={formData.mioc_staff_name}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>MIOC Staff Phone:</label>
                    <input
                        type="tel"
                        name="mioc_staff_phone"
                        value={formData.mioc_staff_phone}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Security Name:</label>
                    <input
                        type="text"
                        name="security_name"
                        value={formData.security_name}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Security Phone:</label>
                    <input
                        type="tel"
                        name="security_phone"
                        value={formData.security_phone}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Description:</label>
                    <textarea
                        name="description_of_incident"
                        value={formData.description_of_incident}
                        onChange={handleChange}
                        rows={3}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Conclusion:</label>
                    <textarea
                        name="conclusion"
                        value={formData.conclusion}
                        onChange={handleChange}
                        rows={3}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Additional Note:</label>
                    <textarea
                        name="additional_note"
                        value={formData.additional_note}
                        onChange={handleChange}
                        rows={3}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>
                        <input
                            type="checkbox"
                            name="arrest_flag"
                            checked={formData.arrest_flag}
                            onChange={handleChange}
                        />
                        {' '}Arrest Flag
                    </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={onClose || (() => navigate(-1))}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#ccc',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                        disabled={loading}
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                        disabled={loading}
                    >
                        {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditForm;
