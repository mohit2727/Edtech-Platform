'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { setAuthToken } from '@/lib/api';

interface UserProfile {
    _id: string;
    name: string;
    mobile: string;
    email?: string;
    age?: string;
    city?: string;
    state?: string;
    pincode?: string;
    role: string;
    enrolledCourses: string[];
    purchasedQuizzes: string[];
    purchasedPlaylists: string[];
}

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    isLoggedIn: boolean;
    login: (details: { mobile: string; name: string; age?: string; city?: string; state?: string; pincode?: string }) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isLoggedIn: false,
    login: async () => { },
    logout: () => { },
    refreshUser: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // On mount, check localStorage for an existing session
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (token) {
            setAuthToken(token);
            // Verify token is still valid by fetching profile
            api.get('/users/profile')
                .then(res => {
                    setUser(res.data);
                })
                .catch(() => {
                    // Token expired or invalid — clear it
                    localStorage.removeItem('authToken');
                    setAuthToken(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (details: { mobile: string; name: string; age?: string; city?: string; state?: string; pincode?: string }) => {
        const res = await api.post('/users/login', details);
        const { token, user: userProfile } = res.data;

        localStorage.setItem('authToken', token);
        setAuthToken(token);
        setUser(userProfile);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const res = await api.get('/users/profile');
            setUser(res.data);
        } catch {
            // If profile fetch fails, user might be logged out
        }
    };

    const isLoggedIn = !!user;

    return (
        <AuthContext.Provider value={{ user, loading, isLoggedIn, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
