/**
 * RobotTable Component
 * Renders table of robots with inline editing
 */

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RobotData, RobotFormState } from '../types/robot.types';

interface RobotTableProps {
    robots: RobotData[];
    edits: RobotFormState;
    onFieldChange: (vin: string, field: string, value: any) => void;
    onSave: (robot: RobotData) => void;
    onDelete: (vin: string) => void;
    hasChanges: (robot: RobotData) => boolean;
}

export const RobotTable = ({
    robots,
    edits,
    onFieldChange,
    onSave,
    onDelete,
    hasChanges
}: RobotTableProps) => {
    if (robots.length === 0) {
        return (
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
                        <tr>
                            <td colSpan={6} className="text-center py-8 text-gray-500">
                                No robots found matching your criteria.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    return (
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
                    {robots.map(robot => {
                        const edit = edits[robot.vin] || {};
                        const isActive = edit.active !== undefined ? edit.active : robot.active;
                        const isEditing = edits[robot.vin];

                        return (
                            <tr key={robot.vin} className={isEditing ? 'row-editing' : ''}>
                                <td className="font-medium">{robot.vin}</td>
                                <td>
                                    <Input
                                        value={edit.name !== undefined ? edit.name : robot.name}
                                        onChange={(e) =>
                                            onFieldChange(robot.vin, 'name', e.target.value)
                                        }
                                        placeholder="Name"
                                        className="h-8 text-sm"
                                    />
                                </td>
                                <td>
                                    <Input
                                        value={
                                            edit.display_name !== undefined
                                                ? edit.display_name
                                                : robot.display_name || ''
                                        }
                                        onChange={(e) =>
                                            onFieldChange(robot.vin, 'display_name', e.target.value)
                                        }
                                        placeholder="Display Name"
                                        className="h-8 text-sm"
                                    />
                                </td>
                                <td>
                                    <Input
                                        value={edit.site !== undefined ? edit.site : robot.site}
                                        onChange={(e) =>
                                            onFieldChange(robot.vin, 'site', e.target.value)
                                        }
                                        placeholder="Site"
                                        className="h-8 text-sm"
                                    />
                                </td>
                                <td className="text-center">
                                    <input
                                        type="checkbox"
                                        className="toggle-checkbox"
                                        checked={isActive}
                                        onChange={(e) =>
                                            onFieldChange(robot.vin, 'active', e.target.checked)
                                        }
                                    />
                                </td>
                                <td className="text-center">
                                    <div className="action-buttons">
                                        <Button
                                            size="small"
                                            className="btn-save"
                                            onClick={() => onSave(robot)}
                                            disabled={!hasChanges(robot)}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="danger"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this robot?')) {
                                                    onDelete(robot.vin);
                                                }
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
