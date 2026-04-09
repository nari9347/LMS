import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();
export const BACKEND_URL = "https://narilmsbackend.onrender.com"|| 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const url = BACKEND_URL;
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState('');

    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(url+'/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Failed to load user', error);
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post(url+'/api/auth/login', {
                email: (email || '').trim().toLowerCase(),
                password
            });
            localStorage.setItem('token', res.data.token);
            setAuthError('');
            await loadUser();
            return { success: true, message: '' };
        } catch (error) {
            console.error('Login error', error);
            const message = error?.response?.data?.msg || 'Login failed. Please check email and password.';
            setAuthError(message);
            return { success: false, message };
        }
    };

    const register = async (name, email, password, role, accessCode) => {
        try {
            const res = await axios.post(url + '/api/auth/register', {
                name: (name || '').trim(),
                email: (email || '').trim().toLowerCase(),
                password,
                role,
                accessCode: (accessCode || '').trim()
            });
            localStorage.setItem('token', res.data.token);
            setAuthError('');
            await loadUser();
            return { success: true, message: '' };
        } catch (error) {
             console.error('Register error', error);
             const message = error?.response?.data?.msg || 'Registration failed. Please try again.';
             setAuthError(message);
             return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        setAuthError('');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, authError, login, register, logout, url }}>
            {children}
        </AuthContext.Provider>
    );
};
