import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Manutencao } from '../data';
import { agendaInicial } from '../data/agenda';

export interface AgendamentoManutencao extends Manutencao {
  date: string;
  observacoes?: string;
  origem: 'cliente' | 'admin';
}

type NovoAgendamento = Omit<AgendamentoManutencao, 'id'>;

interface ManutencoesContextValue {
  agendamentos: AgendamentoManutencao[];
  adicionarAgendamento: (agendamento: NovoAgendamento) => void;
  atualizarStatus: (id: number, status: Manutencao['status']) => void;
  removerAgendamento: (id: number) => void;
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
  const [agendamentos, setAgendamentos] = useState(initialData);

  const adicionarAgendamento = (agendamento: NovoAgendamento) => {
    setAgendamentos((current) => {
      const id = Math.max(0, ...current.map((item) => item.id)) + 1;
      return sortAgendamentos([...current, { ...agendamento, id }]);
    });
  };

  const atualizarStatus = (id: number, status: Manutencao['status']) => {
    setAgendamentos((current) =>
      current.map((agendamento) => (agendamento.id === id ? { ...agendamento, status } : agendamento))
    );
  };

  const removerAgendamento = (id: number) => {
    setAgendamentos((current) => current.filter((agendamento) => agendamento.id !== id));
  };

  return (
    <ManutencoesContext.Provider
      value={{ agendamentos, adicionarAgendamento, atualizarStatus, removerAgendamento }}
    >
      {children}
    </ManutencoesContext.Provider>
  );
}

export function useManutencoes() {
  const context = useContext(ManutencoesContext);
  if (!context) throw new Error('useManutencoes must be inside ManutencoesProvider');
  return context;
}
