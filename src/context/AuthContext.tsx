import { createContext, useContext, useState, type ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: 'admin' | 'customer', adminCode?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const ADMIN_CODE = 'ADMIN2026';

const mockUsers: (User & { password: string })[] = [
  { id: '1', name: 'Administrador SLM', email: 'admin@cycleparts.com', password: 'admin123', role: 'admin' },
  { id: '2', name: 'João Cliente', email: 'joao@email.com', password: '123456', role: 'customer' },
];

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState(mockUsers);

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const found = registeredUsers.find((u) => u.email === email && u.password === password);
    if (!found) return { ok: false, error: 'E-mail ou senha inválidos.' };
    const { password: _, ...u } = found;
    setUser(u);
    return { ok: true };
  };

  const signup = async (name: string, email: string, password: string, role: 'admin' | 'customer', adminCode?: string) => {
    await new Promise((r) => setTimeout(r, 600));
    if (registeredUsers.find((u) => u.email === email)) return { ok: false, error: 'E-mail já cadastrado.' };
    if (role === 'admin' && adminCode !== ADMIN_CODE) return { ok: false, error: 'Código de administrador inválido.' };
    const newUser = { id: String(Date.now()), name, email, password, role };
    setRegisteredUsers((prev) => [...prev, newUser]);
    const { password: _, ...u } = newUser;
    setUser(u);
    return { ok: true };
  };

  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
