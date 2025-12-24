import { useEffect, useState } from 'react';
import { reportService } from '@/services/report.service';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import './RobotReportPage.css'; // Import CSS

export const RobotReportPage = () => {
    const [sites, setSites] = useState<string[]>([]);
    const [form, setForm] = useState({ site: '', month: '', year: new Date().getFullYear().toString() });
    const [format, setFormat] = useState('Excel');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        reportService.getRobotSites().then(setSites).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const blob = await reportService.downloadRobotCleaningReport(form.site, form.month, form.year, format);
            
            // Trigger Download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const ext = format === 'PDF' ? 'pdf' : 'xlsx';
            a.download = `report_${form.site}_${form.year}_${form.month}.${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert('Failed to download report. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const months = Array.from({length: 12}, (_, i) => i + 1);
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1];

    return (
        <div className="report-page-container">
            <div className="report-header">
                <h1 className="report-title">Robot Cleaning Report</h1>
                <p className="report-subtitle">Generate and download cleaning performance reports</p>
            </div>

            <form onSubmit={handleSubmit} className="report-form">
                
                <div className="form-group">
                    <label className="form-label">Select Site</label>
                    <Select 
                        required
                        value={form.site} 
                        onChange={e => setForm({...form, site: e.target.value})}
                    >
                        <option value="">-- Choose Site --</option>
                        {sites.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </div>
                
                <div className="form-row">
                    <div className="form-col form-group">
                        <label className="form-label">Month</label>
                        <Select 
                            required
                            value={form.month}
                            onChange={e => setForm({...form, month: e.target.value})}
                        >
                            <option value="">-- Month --</option>
                            {months.map(m => (
                                <option key={m} value={m}>{new Date(0, m-1).toLocaleString('en-US', {month: 'long'})}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="form-col form-group">
                        <label className="form-label">Year</label>
                        <Select 
                            value={form.year}
                            onChange={e => setForm({...form, year: e.target.value})}
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </Select>
                    </div>
                </div>

                <div className="format-selector">
                    <label className="radio-label">
                        <input 
                            type="radio" 
                            className="radio-input"
                            checked={format === 'Excel'} 
                            onChange={() => setFormat('Excel')} 
                        />
                        Excel Report
                    </label>
                    <label className="radio-label">
                        <input 
                            type="radio" 
                            className="radio-input"
                            checked={format === 'PDF'} 
                            onChange={() => setFormat('PDF')} 
                        />
                        PDF Document
                    </label>
                </div>

                <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={isLoading}
                    style={{ marginTop: '1rem', height: '48px', fontSize: '1rem' }}
                >
                    {isLoading ? 'Generating...' : 'Download Report'}
                </Button>
            </form>
        </div>
    );
};