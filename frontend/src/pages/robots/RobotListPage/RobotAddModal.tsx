/**
 * RobotAddModal Component
 * Modal form for adding new robots
 */

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { RobotData } from '../types/robot.types';
import { INITIAL_ROBOT_STATE, ROBOT_MESSAGES } from '../constants/robot.constants';

interface RobotAddModalProps {
    isOpen: boolean;
    isSaving: boolean;
    onClose: () => void;
    onSubmit: (robot: RobotData) => Promise<void>;
}

export const RobotAddModal = ({ isOpen, isSaving, onClose, onSubmit }: RobotAddModalProps) => {
    const [newRobot, setNewRobot] = useState<RobotData>(INITIAL_ROBOT_STATE);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newRobot.vin || !newRobot.name || !newRobot.site) {
            alert(ROBOT_MESSAGES.VALIDATION_ERROR);
            return;
        }

        try {
            await onSubmit(newRobot);
            setNewRobot(INITIAL_ROBOT_STATE);
        } catch (err) {
            // Error already handled in parent
        }
    };

    const handleClose = () => {
        setNewRobot(INITIAL_ROBOT_STATE);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Robot">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-w-[400px]">
                <Input
                    label="VIN (Required)"
                    value={newRobot.vin}
                    onChange={(e) => setNewRobot({ ...newRobot, vin: e.target.value })}
                    placeholder="e.g. R001"
                    required
                    disabled={isSaving}
                />

                <Input
                    label="Name (Required)"
                    value={newRobot.name}
                    onChange={(e) => setNewRobot({ ...newRobot, name: e.target.value })}
                    placeholder="e.g. Cleaner Alpha"
                    required
                    disabled={isSaving}
                />

                <Input
                    label="Display Name"
                    value={newRobot.display_name || ''}
                    onChange={(e) => setNewRobot({ ...newRobot, display_name: e.target.value })}
                    placeholder="e.g. Robot 1 - Lobby"
                    disabled={isSaving}
                />

                <Input
                    label="Site (Required)"
                    value={newRobot.site}
                    onChange={(e) => setNewRobot({ ...newRobot, site: e.target.value })}
                    placeholder="e.g. Site A"
                    required
                    disabled={isSaving}
                />

                <div className="flex items-center gap-2 mt-2">
                    <input
                        type="checkbox"
                        id="active-check"
                        className="w-4 h-4"
                        checked={newRobot.active}
                        onChange={(e) => setNewRobot({ ...newRobot, active: e.target.checked })}
                        disabled={isSaving}
                    />
                    <label
                        htmlFor="active-check"
                        className="font-medium cursor-pointer select-none"
                    >
                        Active Status
                    </label>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSaving}>
                        {isSaving ? 'Creating...' : 'Create Robot'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
