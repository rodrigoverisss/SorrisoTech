import { User } from '@/types';

const STORAGE_KEY = 'sorrisotech_user';
const USERS_KEY = 'sorrisotech_users';

// Mock users for demonstration
const MOCK_USERS = [
  {
    id: '1',
    name: 'Dr. Carlos Silva',
    email: 'admin@sorrisotech.com',
    password: 'admin123',
    role: 'admin' as const,
  },
  {
    id: '2',
    name: 'Dra. Ana Paula',
    email: 'dentista@sorrisotech.com',
    password: 'dentista123',
    role: 'dentist' as const,
  },
  {
    id: '3',
    name: 'Maria Oliveira',
    email: 'recepcao@sorrisotech.com',
    password: 'recepcao123',
    role: 'receptionist' as const,
  },
];

// Initialize mock users in localStorage
if (!localStorage.getItem(USERS_KEY)) {
  localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
}

export const login = (email: string, password: string): User | null => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find((u: any) => u.email === email && u.password === password);
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }
  
  return null;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const updateCurrentUser = (updates: Partial<User>): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;

  // Update session
  const updated = { ...currentUser, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Update in users list
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const index = users.findIndex((u: any) => u.id === currentUser.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  return true;
};

export const changePassword = (currentPassword: string, newPassword: string): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find((u: any) => u.id === currentUser.id);

  if (!user || user.password !== currentPassword) return false;

  user.password = newPassword;
  const index = users.findIndex((u: any) => u.id === currentUser.id);
  users[index] = user;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
};

export const hasPermission = (requiredRole: User['role']): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  return user.role === requiredRole;
};
