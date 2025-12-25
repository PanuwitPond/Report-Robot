import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { robotsService } from '@/services';
import { Button } from '@/components/ui';
import './RobotImageConfigPage.css';

export const RobotImageConfigPage = () => {
    const navigate = useNavigate();

    const { data: robots = [], isLoading } = useQuery({
        queryKey: ['robots'],
        queryFn: () => robotsService.getAll(),
    });

    if (isLoading) {
        return <div className="robot-image-config-page">Loading robots...</div>;
    }

    return (
        <div className="robot-image-config-page">
            <h1>Robot Image Configuration</h1>
            <p>Configure robot image settings and properties</p>
            
            <div className="content">
                <p>Total Robots: {robots.length}</p>
                {robots.length === 0 ? (
                    <p>No robots found. Please add robots first.</p>
                ) : (
                    <ul>
                        {robots.map((robot: any) => (
                            <li key={robot.id}>{robot.name}</li>
                        ))}
                    </ul>
                )}
            </div>

            <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
    );
};
