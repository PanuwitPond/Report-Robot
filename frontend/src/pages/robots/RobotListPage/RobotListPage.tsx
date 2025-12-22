/**
 * RobotListPage
 * Main page component for robot fleet management
 * Uses extracted components and custom hooks for clean architecture
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRobotCrud, useRobotFilter } from '../hooks';
import { RobotTable } from './RobotTable';
import { RobotFilters } from './RobotFilters';
import { RobotAddModal } from './RobotAddModal';
import './RobotListPage.css';

export const RobotListPage = () => {
    // Custom hooks for CRUD and filtering
    const {
        robots,
        loading,
        error,
        edits,
        isSaving,
        loadRobots,
        handleUpdateRobot,
        handleDeleteRobot,
        handleCreateRobot,
        handleFieldChange,
        hasChanges
    } = useRobotCrud();

    const { filters, filteredRobots, setSearchText, setStatusFilter } = useRobotFilter(robots);

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Load robots on mount
    useEffect(() => {
        loadRobots();
    }, [loadRobots]);

    // Handle robot save with feedback
    const handleSaveRobot = async (robot: any) => {
        const result = await handleUpdateRobot(robot);
        if (result) alert(result.message);
    };

    // Handle robot delete with confirmation
    const handleDeleteWithConfirm = async (vin: string) => {
        const result = await handleDeleteRobot(vin);
        alert(result.message);
    };

    // Handle robot creation
    const handleCreateWithFeedback = async (newRobot: any) => {
        const result = await handleCreateRobot(newRobot);
        if (result.success) {
            setIsAddModalOpen(false);
            alert(result.message);
        } else {
            alert(result.message);
        }
    };

    // Loading state
    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>;
    }

    // Error state
    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h3 className="text-red-800 font-semibold mb-2">Failed to Load Robots</h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <Button variant="primary" onClick={loadRobots}>
                        🔄 Retry
                    </Button>
                </div>
            </div>
        );
    }

    // Main render
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Robot Fleet Management</h1>
                <p className="page-subtitle">
                    Manage your robot fleet status and configuration
                </p>
            </div>

            <RobotFilters
                searchText={filters.searchText}
                activeStatus={filters.activeStatus}
                onSearchChange={setSearchText}
                onStatusChange={setStatusFilter}
                onAddClick={() => setIsAddModalOpen(true)}
            />

            <RobotTable
                robots={filteredRobots}
                edits={edits}
                onFieldChange={handleFieldChange}
                onSave={handleSaveRobot}
                onDelete={handleDeleteWithConfirm}
                hasChanges={hasChanges}
            />

            <RobotAddModal
                isOpen={isAddModalOpen}
                isSaving={isSaving}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleCreateWithFeedback}
            />
        </div>
    );
};
