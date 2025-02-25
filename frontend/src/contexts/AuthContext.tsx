import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { axiosInstance } from '../lib/axios';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  lastLogin?: Date;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Set the token in axios headers
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token by fetching user profile
          const response = await axiosInstance.get('/admin/profile');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          // If token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          axiosInstance.defaults.headers.common['Authorization'] = '';
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/admin/login', {
      email,
      password,
    });
    
    const { token, user: userData } = response.data;
    
    // Store token and user data
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Set axios default header
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    axiosInstance.defaults.headers.common['Authorization'] = '';
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  if (isLoading) {
    // You might want to show a loading spinner here
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 