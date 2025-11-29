import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface RegisteredUser extends UserProfile {
  password: string;
}

interface UserContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message?: string };
  register: (profile: UserProfile, password: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Default users for initial app state (if storage is empty)
const DEFAULT_USERS: RegisteredUser[] = [
  {
    name: 'Dr. Vikram Malhotra',
    email: 'admin@hospital.com',
    password: 'admin',
    role: 'admin',
    height: '180 cm',
    weight: '78 kg',
    gender: 'Male',
    bloodType: 'O+',
    emergencyContactName: 'Hospital HQ',
    emergencyContactPhone: '011-4567-8900',
    avatar: ''
  },
  {
    name: 'Anurag Verma',
    email: 'user@hashcare.com',
    password: 'user',
    role: 'patient',
    height: '175 cm',
    weight: '70 kg',
    gender: 'Male',
    bloodType: 'B+',
    emergencyContactName: 'Priya Verma',
    emergencyContactPhone: '+91 98765 43210',
    avatar: ''
  }
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Initialize registered users from LocalStorage or fall back to defaults
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
    try {
      const savedUsers = localStorage.getItem('hashcare_users');
      return savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS;
    } catch (e) {
      console.error("Failed to parse users from storage", e);
      return DEFAULT_USERS;
    }
  });

  // Persist users to LocalStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem('hashcare_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const login = (email: string, password: string) => {
    const foundUser = registeredUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      // Create a clean profile object without the password
      const { password: _, ...profile } = foundUser;
      setUser(profile);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password.' };
  };

  const register = (profile: UserProfile, password: string) => {
    if (registeredUsers.some(u => u.email === profile.email)) {
      return false; // User already exists
    }
    const newUser: RegisteredUser = { ...profile, password };
    setRegisteredUsers(prev => [...prev, newUser]);
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      const updatedProfile = { ...user, ...updates };
      setUser(updatedProfile);
      
      // Also update the record in the 'database' (state + local storage)
      setRegisteredUsers(prev => prev.map(u => 
        u.email === user.email ? { ...u, ...updates } : u
      ));
    }
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated, login, register, logout, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};