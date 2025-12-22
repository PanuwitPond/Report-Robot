/**
 * Robot Entity Definition
 */

export interface RobotEntity {
    id?: string | number;
    vin: string;
    name: string;
    display_name?: string;
    workspace_id?: string;
    site?: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date | null;
}
