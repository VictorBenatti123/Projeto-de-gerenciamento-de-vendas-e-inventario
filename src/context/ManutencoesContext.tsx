import { createContext, useContext, type ReactNode } from 'react';
import type { Manutencao } from '../data';
import { agendaInicial } from '../data/agenda';
import { usePersistentState } from '../utils/storage';

export interface AgendamentoManutencao extends Manutencao {
  date: string;
  observacoes?: string;
  origem: 'cliente' | 'admin';
  clienteId?: string;
  createdAt?: string;
}

type NovoAgendamento = Omit<AgendamentoManutencao, 'id'>;

interface ManutencoesContextValue {
  agendamentos: AgendamentoManutencao[];
  adicionarAgendamento: (agendamento: NovoAgendamento) => boolean;
  atualizarStatus: (id: number, status: Manutencao['status']) => void;
  removerAgendamento: (id: number) => void;
  horarioDisponivel: (date: string, hora: string, ignorarId?: number) => boolean;
}

const ManutencoesContext = createContext<ManutencoesContextValue | null>(null);
const initialData: AgendamentoManutencao[] = agendaInicial.map((agendamento) => ({
  ...agendamento,
  origem: 'admin',
}));

function sortAgendamentos(items: AgendamentoManutencao[]) {
  return [...items].sort((a, b) => a.date.localeCompare(b.date) || a.hora.localeCompare(b.hora));
}

export function ManutencoesProvider({ children }: { children: ReactNode }) {
  const [agendamentos, setAgendamentos] = usePersistentState<AgendamentoManutencao[]>('slm.agendamentos.v1', initialData);

  const horarioDisponivel = (date: string, hora: string, ignorarId?: number) => {
    const [year, month, day] = date.split('-').map(Number);
    const requestedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    requestedDate.setHours(0, 0, 0, 0);
    if (!year || !month || !day || requestedDate < today) return false;
    return !agendamentos.some((item) =>
      item.id !== ignorarId && item.date === date && item.hora === hora && item.status !== 'concluido'
    );
  };

  const adicionarAgendamento = (agendamento: NovoAgendamento) => {
    if (!horarioDisponivel(agendamento.date, agendamento.hora)) return false;
    const id = Math.max(0, ...agendamentos.map((item) => item.id)) + 1;
    setAgendamentos((current) => sortAgendamentos([...current, { ...agendamento, id, createdAt: new Date().toISOString() }]));
    return true;
  };

  const atualizarStatus = (id: number, status: Manutencao['status']) => {
    setAgendamentos((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  };

  const removerAgendamento = (id: number) => {
    setAgendamentos((current) => current.filter((item) => item.id !== id));
  };

  return (
    <ManutencoesContext.Provider value={{
      agendamentos, adicionarAgendamento, atualizarStatus, removerAgendamento, horarioDisponivel,
    }}>
      {children}
    </ManutencoesContext.Provider>
  );
}

export function useManutencoes() {
  const context = useContext(ManutencoesContext);
  if (!context) throw new Error('useManutencoes must be inside ManutencoesProvider');
  return context;
}
