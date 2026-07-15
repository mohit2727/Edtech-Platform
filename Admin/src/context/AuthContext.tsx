"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { setAuthToken } from '../lib/api';

export interface LocalAdminUser {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: LocalAdminUser | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<LocalAdminUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedToken = localStorage.getItem('adminToken');
                const storedUser = localStorage.getItem('adminUser');

                if (storedToken && storedUser) {
                    setUser(JSON.parse(storedUser));
                    if (setAuthToken) {
                        setAuthToken(storedToken);
                    }
                }
            } catch (error) {
                console.error('Error restoring session from localStorage:', error);
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (email: string, pass: string) => {
        try {
            const response = await api.post('/users/admin-login', { email, password: pass });
            const { token, user: loggedInUser } = response.data;

            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(loggedInUser));

            setUser(loggedInUser);
            if (setAuthToken) {
                setAuthToken(token);
            }
        } catch (err: any) {
            const errMsg = err?.response?.data?.message || err.message || 'Invalid email or password';
            throw new Error(errMsg);
        }
    };

    const logout = async () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setUser(null);
        if (setAuthToken) {
            setAuthToken(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

