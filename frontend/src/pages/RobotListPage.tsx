import { useEffect, useState } from 'react';
import { robotsService } from '@/services/robots.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal'; // Import Modal
import './RobotListPage.css';

// Interface สำหรับข้อมูล Robot
interface RobotData {
    vin: string;
    name: string;
    display_name?: string;
    site: string;
    active: boolean;
    workspace_id?: string;
}

const initialRobotState: RobotData = {
    vin: '',
    name: '',
    display_name: '',
    site: '',
    active: true,
    workspace_id: ''
};

export const RobotListPage = () => {
    // --- State ---
    const [robots, setRobots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [edits, setEdits] = useState<Record<string, any>>({});
    const [filterText, setFilterText] = useState('');
    const [filterActive, setFilterActive] = useState('all');

    // State สำหรับ Modal เพิ่มหุ่นยนต์
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newRobot, setNewRobot] = useState<RobotData>(initialRobotState);
    const [isSaving, setIsSaving] = useState(false);

    // --- Effects ---
    useEffect(() => {
        loadRobots();
    }, []);

    // --- Data Loading ---
    const loadRobots = async () => {
        try {
            const data = await robotsService.getAll();
            setRobots(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers: List Actions ---
    const handleChange = (vin: string, field: string, value: any) => {
        setEdits(prev => ({
            ...prev,
            [vin]: { ...prev[vin], [field]: value }
        }));
    };

    const hasChanges = (robot: any) => {
        const edit = edits[robot.vin];
        if (!edit) return false;
        return Object.keys(edit).some(key => edit[key] !== robot[key]);
    };

    const handleSave = async (robot: any) => {
        const edit = edits[robot.vin];
        if (!edit) return;
        try {
            const updated = { ...robot, ...edit };
            await robotsService.update(robot.vin, updated);
            
            setRobots(prev => prev.map(r => r.vin === robot.vin ? updated : r));
            const newEdits = { ...edits };
            delete newEdits[robot.vin];
            setEdits(newEdits);
            alert('Updated successfully');
        } catch (err) {
            alert('Update failed');
        }
    };

    const handleDelete = async (vin: string) => {
        if (!confirm('Are you sure you want to delete this robot?')) return;
        try {
            await robotsService.delete(vin);
            setRobots(prev => prev.filter(r => r.vin !== vin));
        } catch (err) {
            alert('Delete failed');
        }
    };

    // --- Handlers: Add Robot ---
    const handleAddClick = () => {
        setNewRobot(initialRobotState); // Reset form
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (!newRobot.vin || !newRobot.name || !newRobot.site) {
            alert('Please fill in all required fields (VIN, Name, Site)');
            return;
        }

        setIsSaving(true);
        try {
            const createdRobot = await robotsService.create(newRobot);
            setRobots(prev => [...prev, createdRobot]); // Add to list
            setIsAddModalOpen(false); // Close modal
            alert('Robot added successfully!');
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to add robot. VIN might already exist.');
        } finally {
            setIsSaving(false);
        }
    };

    // --- Filter Logic ---
    const filteredRobots = robots.filter(r => {
        const matchText = (r.vin?.toLowerCase().includes(filterText.toLowerCase()) || 
                           r.name?.toLowerCase().includes(filterText.toLowerCase()) ||
                           r.site?.toLowerCase().includes(filterText.toLowerCase()));
        let matchActive = true;
        if (filterActive === 'active') matchActive = r.active;
        if (filterActive === 'inactive') matchActive = !r.active;
        return matchText && matchActive;
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Robot Fleet Management</h1>
                <p className="page-subtitle">Manage your robot fleet status and configuration</p>
            </div>
            
            <div className="controls-bar">
                <div className="filter-group">
                    <Input 
                        placeholder="Search VIN, Name, Site..." 
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        style={{ width: '400px' }}
                    />
                    <Select 
                        value={filterActive} 
                        onChange={(e) => setFilterActive(e.target.value)}
                        className="status-badge"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </Select>
                </div>
                
                {/* ปุ่ม Add Robot */}
                <Button variant="primary" onClick={handleAddClick}>
                    + Add New Robot
                </Button>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>VIN</th>
                            <th>Name</th>
                            <th>Display Name</th>
                            <th>Site</th>
                            <th className="text-center">Active</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRobots.map(r => {
                            const edit = edits[r.vin] || {};
                            const isActive = edit.active !== undefined ? edit.active : r.active;
                            const isEditing = edits[r.vin];

                            return (
                                <tr key={r.vin} className={isEditing ? 'row-editing' : ''}>
                                    <td className="font-medium">{r.vin}</td>
                                    <td>
                                        <Input 
                                            value={edit.name !== undefined ? edit.name : r.name}
                                            onChange={(e) => handleChange(r.vin, 'name', e.target.value)}
                                            placeholder="Name"
                                            className="h-8 text-sm"
                                        />
                                    </td>
                                    <td>
                                        <Input 
                                            value={edit.display_name !== undefined ? edit.display_name : r.display_name || ''}
                                            onChange={(e) => handleChange(r.vin, 'display_name', e.target.value)}
                                            placeholder="Display Name"
                                            className="h-8 text-sm"
                                        />
                                    </td>
                                    <td>
                                        <Input 
                                            value={edit.site !== undefined ? edit.site : r.site}
                                            onChange={(e) => handleChange(r.vin, 'site', e.target.value)}
                                            placeholder="Site"
                                            className="h-8 text-sm"
                                        />
                                    </td>
                                    <td className="text-center">
                                        <input 
                                            type="checkbox"
                                            className="toggle-checkbox"
                                            checked={isActive}
                                            onChange={(e) => handleChange(r.vin, 'active', e.target.checked)}
                                        />
                                    </td>
                                    <td className="text-center">
                                        <div className="action-buttons">
                                            {/* ปรับปรุงปุ่ม Save */}
                                            <Button 
                                                size="small" 
                                                className="btn-save" // เรียกใช้ Class ที่เพิ่งสร้าง
                                                onClick={() => handleSave(r)}
                                                disabled={!hasChanges(r)} // ถ้าไม่มีการแก้ไข ให้ Disable
                                            >
                                                Save
                                            </Button>

                                            <Button size="small" variant="danger" onClick={() => handleDelete(r.vin)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredRobots.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-500">
                                    No robots found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Add Robot Modal --- */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Robot"
            >
                <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 min-w-[400px]">
                    <Input
                        label="VIN (Required)"
                        value={newRobot.vin}
                        onChange={(e) => setNewRobot({ ...newRobot, vin: e.target.value })}
                        placeholder="e.g. R001"
                        required
                    />
                    
                    <Input
                        label="Name (Required)"
                        value={newRobot.name}
                        onChange={(e) => setNewRobot({ ...newRobot, name: e.target.value })}
                        placeholder="e.g. Cleaner Alpha"
                        required
                    />

                    <Input
                        label="Display Name"
                        value={newRobot.display_name}
                        onChange={(e) => setNewRobot({ ...newRobot, display_name: e.target.value })}
                        placeholder="e.g. Robot 1 - Lobby"
                    />

                    <Input
                        label="Site (Required)"
                        value={newRobot.site}
                        onChange={(e) => setNewRobot({ ...newRobot, site: e.target.value })}
                        placeholder="e.g. Site A"
                        required
                    />

                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            id="active-check"
                            className="w-4 h-4"
                            checked={newRobot.active}
                            onChange={(e) => setNewRobot({ ...newRobot, active: e.target.checked })}
                        />
                        <label htmlFor="active-check" className="font-medium cursor-pointer select-none">
                            Active Status
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => setIsAddModalOpen(false)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="primary"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Creating...' : 'Create Robot'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};