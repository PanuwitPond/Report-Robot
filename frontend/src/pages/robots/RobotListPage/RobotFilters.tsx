/**
 * RobotFilters Component
 * Handles filter UI for robot list
 */

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ROBOT_STATUS_FILTERS } from '../constants/robot.constants';

interface RobotFiltersProps {
    searchText: string;
    activeStatus: 'all' | 'active' | 'inactive';
    onSearchChange: (text: string) => void;
    onStatusChange: (status: 'all' | 'active' | 'inactive') => void;
    onAddClick: () => void;
}

export const RobotFilters = ({
    searchText,
    activeStatus,
    onSearchChange,
    onStatusChange,
    onAddClick
}: RobotFiltersProps) => {
    return (
        <div className="controls-bar">
            <div className="filter-group">
                <Input
                    placeholder="Search VIN, Name, Site..."
                    value={searchText}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{ width: '400px' }}
                />
                <Select
                    value={activeStatus}
                    onChange={(e) => onStatusChange(e.target.value as 'all' | 'active' | 'inactive')}
                    className="status-badge"
                >
                    <option value={ROBOT_STATUS_FILTERS.ALL}>All Status</option>
                    <option value={ROBOT_STATUS_FILTERS.ACTIVE}>Active Only</option>
                    <option value={ROBOT_STATUS_FILTERS.INACTIVE}>Inactive Only</option>
                </Select>
            </div>

            <Button variant="primary" onClick={onAddClick}>
                + Add New Robot
            </Button>
        </div>
    );
};
