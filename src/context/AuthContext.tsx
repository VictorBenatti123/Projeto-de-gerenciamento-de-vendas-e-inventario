import { createContext, useContext, type ReactNode } from 'react';
import { usePersistentState } from '../utils/storage';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  telefone?: string;
  bicicletas?: number;
}

type StoredUser = User & { password: string };

interface AuthContextValue {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: 'admin' | 'customer', adminCode?: string) => Promise<{ ok: boolean; error?: string }>;
  updateUser: (id: string, values: Partial<Pick<User, 'name' | 'email' | 'telefone' | 'bicicletas'>>) => void;
  logout: () => void;
}

const ADMIN_CODE = 'ADMIN2026';
const mockUsers: StoredUser[] = [
  { id: '1', name: 'Administrador SLM', email: 'slmbikes@gmail.com.br', password: 'admin123', role: 'admin' },
  { id: '2', name: 'João Cliente', email: 'joao@email.com', password: '123456', role: 'customer' },
];

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = usePersistentState<User | null>('slm.session.v1', null);
  const [registeredUsers, setRegisteredUsers] = usePersistentState<StoredUser[]>('slm.users.v1', mockUsers);

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const normalizedEmail = email.trim().toLowerCase();
    const found = registeredUsers.find((candidate) =>
      candidate.email.trim().toLowerCase() === normalizedEmail && candidate.password === password
    );
    if (!found) return { ok: false, error: 'E-mail ou senha inválidos.' };
    const { password: _password, ...safeUser } = found;
    setUser(safeUser);
    return { ok: true };
  };

  const signup = async (name: string, email: string, password: string, role: 'admin' | 'customer', adminCode?: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const normalizedEmail = email.trim().toLowerCase();
    if (registeredUsers.some((candidate) => candidate.email.trim().toLowerCase() === normalizedEmail)) {
      return { ok: false, error: 'E-mail já cadastrado.' };
    }
    if (role === 'admin' && adminCode !== ADMIN_CODE) {
      return { ok: false, error: 'Código de administrador inválido.' };
    }
    const newUser: StoredUser = {
      id: String(Date.now()),
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      telefone: '',
      bicicletas: 0,
    };
    setRegisteredUsers((current) => [...current, newUser]);
    const { password: _password, ...safeUser } = newUser;
    setUser(safeUser);
    return { ok: true };
  };

  const updateUser = (id: string, values: Partial<Pick<User, 'name' | 'email' | 'telefone' | 'bicicletas'>>) => {
    setRegisteredUsers((current) => current.map((candidate) =>
      candidate.id === id
        ? { ...candidate, ...values, email: values.email?.trim().toLowerCase() ?? candidate.email }
        : candidate
    ));
    setUser((current) => current?.id === id ? { ...current, ...values } : current);
  };

  const logout = () => setUser(null);
  const users = registeredUsers.map(({ password: _password, ...safeUser }) => safeUser);

  return (
    <AuthContext.Provider value={{ user, users, login, signup, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be inside AuthProvider');
  return context;
}
