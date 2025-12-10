import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './auth-context'; // Import useAuth to get user object

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); // Get user from AuthContext
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Initialize theme from localStorage or system preference
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light'; // Default to light on server or if window is undefined
  });

  // Apply theme to document element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme); // Store theme preference
  }, [theme]);

  // Sync theme with user preferences from backend if available
  useEffect(() => {
    if (user && user.theme && user.theme !== theme) {
      setTheme(user.theme);
    }
  }, [user]); // Dependency on user object from AuthContext

  const updateUserTheme = async (newTheme: 'light' | 'dark') => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/api/auth/user/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ theme: newTheme }),
      });
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    updateUserTheme(newTheme); // Update theme on backend
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
