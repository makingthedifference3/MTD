import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../mockData';

interface AuthContextType {
  currentUser: User | null;
  currentRole: 'admin' | 'accountant' | 'project-manager' | 'team-member' | null;
  login: (role: 'admin' | 'accountant' | 'project-manager' | 'team-member') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentRole, setCurrentRole] = useState<
    'admin' | 'accountant' | 'project-manager' | 'team-member' | null
  >(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (role: 'admin' | 'accountant' | 'project-manager' | 'team-member') => {
    setCurrentRole(role);
    const mockUser: User = {
      id: `user-${role}`,
      name:
        role === 'admin'
          ? 'Admin User'
          : role === 'accountant'
          ? 'Priya Sharma'
          : role === 'project-manager'
          ? 'Lokesh Joshi'
          : 'Rahul Verma',
      email: `${role}@mtd.com`,
      mobile: '+91-9876543210',
      address: 'Mumbai, Maharashtra',
      role: role,
      department:
        role === 'admin'
          ? 'IT'
          : role === 'accountant'
          ? 'Finance'
          : role === 'project-manager'
          ? 'Operations'
          : 'Operations',
    };
    setCurrentUser(mockUser);
  };

  const logout = () => {
    setCurrentRole(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, currentRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
