import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User, UserRole } from '@/types';
import { authService } from '@/services';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already authenticated
        const initAuth = async () => {
            try {
                const token = authService.getAccessToken();
                if (token) {
                    // Restore user from localStorage
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        setUser(JSON.parse(savedUser));
                    }
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Auth initialization error:', error);
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await authService.login(username, password);

            // Decode JWT to get user info including roles
            const decodedToken: any = jwtDecode(response.accessToken);

            const userWithRoles: User = {
                ...response.user,
                roles: decodedToken.realm_access?.roles || [],
            };

            setUser(userWithRoles);
            // Save user to localStorage
            localStorage.setItem('user', JSON.stringify(userWithRoles));
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            // Remove user from localStorage
            localStorage.removeItem('user');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
