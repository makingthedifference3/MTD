import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser } from '../services/authService';

export interface AuthContextType {
  currentUser: AuthUser | null;
  currentRole: 'admin' | 'accountant' | 'project_manager' | 'team_member' | 'client' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  setSelectedRole: (role: 'admin' | 'accountant' | 'project_manager' | 'team_member' | null) => void;
  selectedRole: 'admin' | 'accountant' | 'project_manager' | 'team_member' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<
    'admin' | 'accountant' | 'project_manager' | 'team_member' | null
  >(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUserState(user);
      } catch (error) {
        console.error('Failed to load user from storage:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (user: AuthUser) => {
    setCurrentUserState(user);
    setSelectedRole(null);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUserState(null);
    setSelectedRole(null);
    localStorage.removeItem('currentUser');
  };

  const currentRole = (currentUser?.role as
    | 'admin'
    | 'accountant'
    | 'project_manager'
    | 'team_member'
    | 'client') || null;

  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated,
        isLoading,
        login,
        logout,
        setSelectedRole,
        selectedRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
