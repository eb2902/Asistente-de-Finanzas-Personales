import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '../utils/api';

interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  currency: 'USD' | 'EUR' | 'ARS' | 'MXN';
  language: 'es' | 'en' | 'pt';
}

interface UserNotifications {
  emailAlerts: boolean;
  goalReminders: boolean;
  weeklySummary: boolean;
  aiSuggestions: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  preferences?: UserPreferences;
  notifications?: UserNotifications;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  updateProfile: (name: string, email: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<boolean>;
  updateNotifications: (notifications: Partial<UserNotifications>) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Función para validar token JWT
  const isValidToken = (token: string): boolean => {
    try {
      // Decodificar el payload del JWT (segunda parte del token)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Verificar si el token tiene fecha de expiración
      if (payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        // Si el token está expirado, retornar false
        return payload.exp > currentTime;
      }
      
      // Si no tiene fecha de expiración, asumimos que es válido
      return true;
    } catch {
      // Si hay error al decodificar, el token es inválido
      return false;
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      // Validate token before setting user
      if (isValidToken(savedToken)) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } else {
        // Token is invalid or expired, clear storage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('token', data.data.token);

        return true;
      } else {
        throw new Error(data.error || 'Error al iniciar sesión');
      }
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('token', data.data.token);

        return true;
      } else {
        throw new Error(data.error || 'Error al registrar usuario');
      }
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const apiUrl = getApiUrl();
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    } catch {
      // Error ignorado - el logout local se ejecuta igualmente
    } finally {
      setUser(null);
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
      }
    } catch {
      // Silent fail - user data refresh is non-critical
    }
  };

  const updateProfile = async (name: string, email: string): Promise<boolean> => {
    if (!token) return false;

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!token) return { success: false, error: 'No autenticado' };

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        return { success: true };
      }
      return { success: false, error: data.error || 'Error al cambiar contraseña' };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const updatePreferences = async (preferences: Partial<UserPreferences>): Promise<boolean> => {
    if (!token) return false;

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/auth/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        // Save preferences to localStorage for quick access
        if (preferences.theme) {
          localStorage.setItem('theme', preferences.theme);
        }
        if (preferences.currency) {
          localStorage.setItem('currency', preferences.currency);
        }
        if (preferences.language) {
          localStorage.setItem('language', preferences.language);
        }
        
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateNotifications = async (notifications: Partial<UserNotifications>): Promise<boolean> => {
    if (!token) return false;

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/auth/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(notifications)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!token) return false;

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/auth/account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Force logout after account deletion
        setUser(null);
        setToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('theme');
          localStorage.removeItem('currency');
          localStorage.removeItem('language');
        }
        router.push('/login');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    loading,
    updateProfile,
    changePassword,
    updatePreferences,
    updateNotifications,
    deleteAccount,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
