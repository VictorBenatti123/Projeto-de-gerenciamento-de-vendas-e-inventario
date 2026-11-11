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
  horarioDisponivel: (date: string, hora: string, servico?: string, ignorarId?: number) => boolean;
  horariosDisponiveis: (date: string, servico: string) => string[];
}

const ManutencoesContext = createContext<ManutencoesContextValue | null>(null);
const initialData: AgendamentoManutencao[] = agendaInicial.map((agendamento) => ({
  ...agendamento,
  origem: 'admin',
}));

// Durações estimadas em minutos; serviços administrativos sem correspondência usam 60 min.
export function duracaoServico(servico: string) {
  const normalized = servico.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (normalized.includes('revisao')) return 120;
  if (normalized.includes('cambio') || normalized.includes('transmissao')) return 90;
  if (normalized.includes('freio') || normalized.includes('pneu') || normalized.includes('roda')) return 60;
  if (normalized.includes('marcha')) return 45;
  if (normalized.includes('limpeza') || normalized.includes('lubrificacao')) return 60;
  return 60;
}

function minutosDoHorario(hora: string) {
  const match = /^(\\d{2}):(\\d{2})$/.exec(hora);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function horarioDentroFuncionamento(date: string, hora: string, servico: string) {
  const parts = date.split('-').map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part) || part <= 0)) return false;
  const [year, month, day] = parts;
  const parsedDate = new Date(year, month - 1, day);
  if (parsedDate.getFullYear() !== year || parsedDate.getMonth() !== month - 1 || parsedDate.getDate() !== day) return false;

  const start = minutosDoHorario(hora);
  if (start === null || start % 30 !== 0) return false;
  const weekday = parsedDate.getDay();
  if (weekday === 0) return false;

  const opening = 9 * 60;
  const closing = weekday === 6 ? 16 * 60 : 19 * 60;
  return start >= opening && start + duracaoServico(servico) <= closing;
}

function sortAgendamentos(items: AgendamentoManutencao[]) {
  return [...items].sort((a, b) => a.date.localeCompare(b.date) || a.hora.localeCompare(b.hora));
}

export function ManutencoesProvider({ children }: { children: ReactNode }) {
  const [agendamentos, setAgendamentos] = usePersistentState<AgendamentoManutencao[]>('slm.agendamentos.v1', initialData);

  const horarioDisponivel = (date: string, hora: string, servico = '', ignorarId?: number) => {
    if (!horarioDentroFuncionamento(date, hora, servico)) return false;

    const [year, month, day] = date.split('-').map(Number);
    const requestedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    requestedDate.setHours(0, 0, 0, 0);
    if (requestedDate < today) return false;

    const requestedStart = minutosDoHorario(hora)!;
    const requestedEnd = requestedStart + duracaoServico(servico);
    return !agendamentos.some((item) => {
      if (item.id === ignorarId || item.date !== date || item.status === 'concluido') return false;
      const existingStart = minutosDoHorario(item.hora);
      if (existingStart === null) return false;
      const existingEnd = existingStart + duracaoServico(item.servico);
      return requestedStart < existingEnd && requestedEnd > existingStart;
    });
  };

  const horariosDisponiveis = (date: string, servico: string) => {
    const slots: string[] = [];
    for (let minutes = 9 * 60; minutes <= 18 * 60 + 30; minutes += 30) {
      const hora = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
      if (horarioDisponivel(date, hora, servico)) slots.push(hora);
    }
    return slots;
  };

  const adicionarAgendamento = (agendamento: NovoAgendamento) => {
    if (!horarioDisponivel(agendamento.date, agendamento.hora, agendamento.servico)) return false;
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
      agendamentos, adicionarAgendamento, atualizarStatus, removerAgendamento, horarioDisponivel, horariosDisponiveis,
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
