import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { axiosInstance } from '../lib/axios';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  profilePicture?: string;
  lastLogin?: Date;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string, isStudent?: boolean) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    axiosInstance.defaults.headers.common['Authorization'] = '';
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
          setIsLoading(false);
          return;
        }

        try {
          const userData = JSON.parse(storedUser) as User;
          
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          setUser(userData);
          setIsAuthenticated(true);
          
          try {
            if (userData.role === 'admin') {
              await axiosInstance.get('/admin/profile');
            } else {
              await axiosInstance.get(`/students/${userData._id}`);
            }
          } catch (verifyError) {
            console.warn('Token verification warning:', verifyError);
            if (axios.isAxiosError(verifyError) && verifyError.response?.status === 401) {
              console.error('Token invalid, logging out');
              logout();
            }
          }
        } catch (parseError) {
          console.error('Failed to parse stored user data:', parseError);
          logout();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, isStudent = false) => {
    try {
      const endpoint = isStudent ? '/auth/student/login' : '/auth/admin/login';
      
      const response = await axiosInstance.post(endpoint, {
        email,
        password,
      });
      
      const { token, ...userData } = response.data;
      
      if (!userData.role) {
        userData.role = isStudent ? 'student' : 'admin';
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData as User);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
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