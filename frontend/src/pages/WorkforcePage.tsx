import { useState } from 'react';
import { reportService } from '@/services/report.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import './WorkforcePage.css'; // Import CSS

export const WorkforcePage = () => {
    const [search, setSearch] = useState('');
    const [type, setType] = useState('name');
    const [depts, setDepts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!search.trim()) return;
        
        setLoading(true);
        setHasSearched(true);
        try {
            const empCode = type === 'empCode' ? search : '';
            const nameSearch = type === 'name' ? search : '';
            const data = await reportService.getWorkforceDepartments(nameSearch, empCode);
            setDepts(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Workforce Departments</h1>
                <p className="page-subtitle">Search and view department information and manpower</p>
            </div>

            <form onSubmit={handleSearch} className="controls-bar">
                <div className="filter-group">
                    <Select 
                        value={type} 
                        onChange={e => setType(e.target.value)}
                        style={{ width: '180px' }}
                    >
                        <option value="name">Department Name</option>
                        <option value="empCode">Employee Code</option>
                    </Select>
                    
                    <Input 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder={type === 'empCode' ? "Enter employee code..." : "Search departments..."}
                        style={{ flex: 1, maxWidth: '400px' }}
                    />
                    
                    <Button type="submit" variant="primary" disabled={loading} style={{ height: '42px' }}>
                        {loading ? 'Searching...' : 'Search'}
                    </Button>
                </div>
            </form>

            <div className="workforce-grid">
                {hasSearched && depts.length === 0 && !loading && (
                    <div className="no-results">No departments found matching your criteria.</div>
                )}

                {depts.map((d, i) => (
                    <div key={`${d.depart_id}-${i}`} className="workforce-card">
                        <div className="card-header">
                            <div className="dept-name">{d.depart_name}</div>
                            <span className="dept-id">ID: {d.depart_id}</span>
                        </div>
                        
                        <div className="card-row">
                            <span className="row-label">Code</span>
                            <span className="row-value">{d.depart_code || '-'}</span>
                        </div>
                        <div className="card-row">
                            <span className="row-label">Division</span>
                            <span className="row-value">{d.division_name || '-'}</span>
                        </div>
                        <div className="card-row">
                            <span className="row-label">Section</span>
                            <span className="row-value">{d.section_name || '-'}</span>
                        </div>
                        <div className="card-row">
                            <span className="row-label">Job No.</span>
                            <span className="row-value">{d.job_no || '-'}</span>
                        </div>

                        {d.label && (
                            <div className="highlight-info">
                                <strong>Employee:</strong> {d.label}
                            </div>
                        )}

                        <div className="emp-badge">
                            <span>Total Staff</span>
                            <span className="emp-count">{d.emp_amount}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};