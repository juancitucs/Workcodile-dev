import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from './types'; // Assuming User type is defined here

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AuthContextType {
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  sendVerificationCode: (name: string, email: string, password: string) => Promise<any>;
  verifyAndRegister: (email: string, password: string, verificationCode: string) => Promise<any>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { 'x-auth-token': token },
          });

          if (!response.ok) {
            logout(); // Use the logout function provided by this context
            setAuthStatus('unauthenticated');
            return;
          }

          const userData = await response.json();
          setUser(userData);
          setAuthStatus('authenticated');
        } catch (error) {
          console.error('Failed to load user session:', error);
          logout();
          setAuthStatus('unauthenticated');
        }
      } else {
        setAuthStatus('unauthenticated');
      }
    };

    loadUser();
  }, []); // Empty dependency array means this runs once on mount

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Error al iniciar sesión');
    }

    const { token, user: userData } = await response.json();
    localStorage.setItem('token', token);
    setUser(userData);
    setAuthStatus('authenticated');
  };

  const sendVerificationCode = async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/send-verification-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.msg || 'Error al enviar el código de verificación');
    }
    return responseData;
  };

  const verifyAndRegister = async (email: string, password: string, verificationCode: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-and-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, verificationCode }),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.msg || 'Error al verificar el código o registrar el usuario');
    }

    const { token, user: userData } = responseData;
    localStorage.setItem('token', token);
    setUser(userData);
    setAuthStatus('authenticated');
    return responseData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAuthStatus('unauthenticated');
  };

  const updateProfile = (profileData: Partial<User>) => {
    if (user) {
      setUser(prevUser => (prevUser ? { ...prevUser, ...profileData } : null));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authStatus,
        user,
        login,
        sendVerificationCode,
        verifyAndRegister,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
