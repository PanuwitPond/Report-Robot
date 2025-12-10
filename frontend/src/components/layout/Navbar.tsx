import { useState } from 'react';
// import { Link } from 'react-router-dom';
import { useDomain } from '@/contexts';
import './Navbar.css';
import Logo from '../../image/Logo.svg';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { currentDomain, availableDomains, setDomain } = useDomain();

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <button className="navbar-toggle" onClick={toggleMenu}>
                        ☰
                    </button>
                    <img src={Logo} alt="Logo" className="navbar-logo" />
                    <h1 className="navbar-title">Robot Report System</h1>
                </div>

                {/* <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
                    <Link to="/export-report" className="navbar-link" onClick={() => setIsOpen(false)}>
                        Export Report
                    </Link>
                    <Link to="/report-task-config" className="navbar-link" onClick={() => setIsOpen(false)}>
                        Report Task Config
                    </Link>
                    <Link to="/report-image-config" className="navbar-link" onClick={() => setIsOpen(false)}>
                        Report Image Config
                    </Link>
                </div> */}

                {availableDomains.length > 1 && (
                    <div className="navbar-domain">
                        <select
                            value={currentDomain}
                            onChange={(e) => setDomain(e.target.value as any)}
                            className="domain-select"
                        >
                            {availableDomains.map((domain) => (
                                <option key={domain} value={domain}>
                                    {domain}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </nav>
    );
};
