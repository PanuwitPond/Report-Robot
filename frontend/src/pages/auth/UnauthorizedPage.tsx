import { useNavigate } from 'react-router-dom';
import './UnauthorizedPage.css';

export const UnauthorizedPage = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="unauthorized-container">
            <div className="unauthorized-content">
                <div className="unauthorized-icon">🔒</div>
                <h1>Access Denied</h1>
                <p className="unauthorized-message">
                    You don't have permission to access this page.
                </p>
                <p className="unauthorized-detail">
                    Your role doesn't have the required permissions to view this content.
                </p>

                <div className="unauthorized-actions">
                    <button 
                        className="btn btn-primary" 
                        onClick={handleGoHome}
                    >
                        Go to Home
                    </button>
                    <button 
                        className="btn btn-secondary" 
                        onClick={handleGoBack}
                    >
                        Go Back
                    </button>
                </div>

                <div className="unauthorized-help">
                    <p>
                        If you believe you should have access to this page, 
                        please contact your administrator.
                    </p>
                </div>
            </div>
        </div>
    );
};
