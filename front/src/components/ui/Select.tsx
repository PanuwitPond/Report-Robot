import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import './Select.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, children, className = '', ...props }, ref) => {
        return (
            <div className="select-wrapper">
                {label && <label className="select-label">{label}</label>}
                <select
                    ref={ref}
                    className={`select ${error ? 'select-error' : ''} ${className}`}
                    {...props}
                >
                    {children}
                </select>
                {error && <span className="select-error-text">{error}</span>}
            </div>
        );
    }
);

Select.displayName = 'Select';
