import { useState, type FormEvent } from 'react';
import type { Manutencao } from '../data';
import { useManutencoes } from '../context/ManutencoesContext';
import AdminModal, { fieldClass } from '../components/AdminModal';

const statusStyles: Record<string, string> = {
  concluido: 'bg-emerald-50 text-emerald-700',
  concluir: 'bg-amber-50 text-amber-700',
  iniciar: 'bg-slate-100 text-slate-600',
};
const statusLabels: Record<string, string> = { concluido: '✓ Concluído', concluir: 'Pendente', iniciar: 'Agendado' };

export default function Manutencoes() {
  const { agendamentos, adicionarAgendamento, atualizarStatus, removerAgendamento } = useManutencoes();
  const [filter, setFilter] = useState('todos');
  const [creating, setCreating] = useState(false);

  const update = (id: number, status: Manutencao['status']) => {
    atualizarStatus(id, status);
  };

  const remove = (id: number) => {
    if (window.confirm('Cancelar este agendamento?')) removerAgendamento(id);
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const created = adicionarAgendamento({
      date: String(form.get('date')),
      hora: String(form.get('hora')),
      cliente: String(form.get('cliente')).trim(),
      servico: String(form.get('servico')).trim(),
      bicicleta: String(form.get('bicicleta')).trim(),
      status: 'iniciar',
      origem: 'admin',
    });
    if (!created) {
      window.alert('Não foi possível criar o agendamento. Confira o expediente (segunda a sexta, 09:00–19:00; sábado, 09:00–16:00; domingo fechado) e se o horário conflita com outro serviço.');
      return;
    }
    setCreating(false);
  };

  const filtered =
    filter === 'todos' ? agendamentos : agendamentos.filter((manutencao) => manutencao.status === filter);
  const concluidos = agendamentos.filter((manutencao) => manutencao.status === 'concluido').length;
  const pendentes = agendamentos.filter((manutencao) => manutencao.status === 'concluir').length;
  const agendados = agendamentos.filter((manutencao) => manutencao.status === 'iniciar').length;

  return (
    <div className="p-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Geral', value: agendamentos.length, color: 'text-slate-800', bg: 'bg-slate-50' },
          { label: 'Concluídos', value: concluidos, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pendentes', value: pendentes, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Agendados', value: agendados, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-slate-600">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <div className="text-sm font-semibold text-slate-800">Manutenções Agendadas</div>
            <div className="text-xs text-slate-400">Agenda compartilhada entre clientes e administração</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
              {(['todos', 'concluido', 'concluir', 'iniciar'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filter === s ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {s === 'todos' ? 'Todos' : statusLabels[s].replace('✓ ', '')}
                </button>
              ))}
            </div>
            <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              + Novo Agendamento
            </button>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-50">
          {filtered.map((m) => (
            <div
              key={m.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors ${
                m.status === 'concluido' ? 'opacity-60' : ''
              }`}
            >
              {/* Time */}
              <div className="w-20 shrink-0">
                <span className="text-sm font-bold text-blue-600 font-mono">{m.hora}</span>
                <div className="mt-0.5 text-[10px] font-medium text-slate-400">
                  {new Date(`${m.date}T12:00:00`).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </div>
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold shrink-0">
                {m.cliente.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">{m.cliente}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusStyles[m.status]}`}>
                    {statusLabels[m.status]}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{m.servico}</div>
                <div className="text-xs text-blue-500 font-medium mt-0.5">🚲 {m.bicicleta}</div>
                {m.observacoes && (
                  <div className="mt-1 text-xs text-slate-400">Observação: {m.observacoes}</div>
                )}
                {m.origem === 'cliente' && (
                  <span className="mt-1.5 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                    Agendado pelo cliente
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-2">
                {m.status === 'concluido' ? (
                  <span className="text-xs text-emerald-600 font-semibold">✓ Concluído</span>
                ) : m.status === 'concluir' ? (
                  <>
                    <button
                      onClick={() => update(m.id, 'concluido')}
                      className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      ✓ Concluir
                    </button>
                    <button onClick={() => remove(m.id)} aria-label={`Cancelar agendamento de ${m.cliente}`} className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 text-xs transition-colors">✕</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => update(m.id, 'concluir')}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Iniciar
                    </button>
                    <button onClick={() => remove(m.id)} aria-label={`Cancelar agendamento de ${m.cliente}`} className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 text-xs transition-colors">✕</button>
                  </>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">Nenhuma manutenção encontrada.</div>
          )}
        </div>
      </div>
      {creating && (
        <AdminModal title="Novo agendamento" subtitle="Inclua o serviço na programação de hoje." onClose={() => setCreating(false)}>
          <form onSubmit={handleCreate} className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-4">
              <label className="text-xs font-semibold text-slate-600">Data
                <input name="date" required type="date" className={`${fieldClass} mt-1.5`} />
              </label>
              <label className="text-xs font-semibold text-slate-600">Horário
                <input name="hora" required type="time" className={`${fieldClass} mt-1.5`} />
              </label>
            </div>
            <label className="block text-xs font-semibold text-slate-600">Cliente
              <input name="cliente" required autoFocus className={`${fieldClass} mt-1.5`} placeholder="Nome completo" />
            </label>
            <label className="block text-xs font-semibold text-slate-600">Serviço
              <input name="servico" required className={`${fieldClass} mt-1.5`} placeholder="Ex.: Revisão completa" />
            </label>
            <label className="block text-xs font-semibold text-slate-600">Bicicleta
              <input name="bicicleta" required className={`${fieldClass} mt-1.5`} placeholder="Marca, modelo e aro" />
            </label>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setCreating(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancelar</button>
              <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">Agendar serviço</button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
