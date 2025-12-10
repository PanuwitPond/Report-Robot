import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Domain, UserRole } from '@/types';
import { useAuth } from './AuthContext';

interface DomainContextType {
    currentDomain: Domain;
    setDomain: (domain: Domain) => void;
    availableDomains: Domain[];
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

interface DomainProviderProps {
    children: ReactNode;
}

export const DomainProvider = ({ children }: DomainProviderProps) => {
    const { user } = useAuth();
    const [currentDomain, setCurrentDomain] = useState<Domain>('METTBOT');

    // Determine available domains based on user roles
    const availableDomains: Domain[] = (() => {
        if (!user) return [];

        const roles = user.roles || [];

        // Admin can access all domains
        if (roles.includes('ADMIN')) {
            return ['METTBOT', 'METTPOLE'];
        }

        // METTBOT user can only access METTBOT
        if (roles.includes('METTBOT_USER')) {
            return ['METTBOT'];
        }

        // METTPOLE user can only access METTPOLE
        if (roles.includes('METTPOLE_USER')) {
            return ['METTPOLE'];
        }

        return [];
    })();

    // Set initial domain based on user role
    useEffect(() => {
        if (availableDomains.length > 0) {
            // If user has a preferred domain, use it
            if (user?.domain && availableDomains.includes(user.domain)) {
                setCurrentDomain(user.domain);
            } else {
                // Otherwise, use the first available domain
                setCurrentDomain(availableDomains[0]);
            }
        }
    }, [user, availableDomains]);

    const setDomain = (domain: Domain) => {
        if (availableDomains.includes(domain)) {
            setCurrentDomain(domain);
        } else {
            console.warn(`User does not have access to domain: ${domain}`);
        }
    };

    return (
        <DomainContext.Provider
            value={{
                currentDomain,
                setDomain,
                availableDomains,
            }}
        >
            {children}
        </DomainContext.Provider>
    );
};

export const useDomain = () => {
    const context = useContext(DomainContext);
    if (!context) {
        throw new Error('useDomain must be used within DomainProvider');
    }
    return context;
};
