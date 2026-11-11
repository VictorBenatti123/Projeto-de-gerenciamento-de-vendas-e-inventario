import { useState, type FormEvent } from 'react';
import AdminModal, { fieldClass } from '../components/AdminModal';
import { useManutencoes, type AgendamentoManutencao } from '../context/ManutencoesContext';

const STATUS_STYLES = {
  concluido: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700', label: '✓ Concluído' },
  concluir: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700', label: 'Pendente' },
  iniciar: { dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700', label: 'Agendado' },
};

const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function Agenda() {
  const { agendamentos: agendaItems, adicionarAgendamento, atualizarStatus, removerAgendamento, horarioDisponivel } = useManutencoes();
  const todayDate = new Date();
  const todayKey = toDateKey(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
  const [year, setYear] = useState(todayDate.getFullYear());
  const [month, setMonth] = useState(todayDate.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [creating, setCreating] = useState(false);
  const [originFilter, setOriginFilter] = useState<'todos' | 'cliente' | 'admin'>('todos');

  const grid = getMonthGrid(year, month);
  const visibleAgendaItems =
    originFilter === 'todos'
      ? agendaItems
      : agendaItems.filter((agendamento) => agendamento.origem === originFilter);

  const eventsByDate: Record<string, AgendamentoManutencao[]> = {};
  visibleAgendaItems.forEach((item) => {
    if (!eventsByDate[item.date]) eventsByDate[item.date] = [];
    eventsByDate[item.date].push(item);
  });

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const selectedItems = eventsByDate[selectedDate] ?? [];
  const today = todayKey;

  const updateStatus = (id: number, status: AgendamentoManutencao['status']) => {
    atualizarStatus(id, status);
  };

  const removeItem = (id: number) => {
    if (window.confirm('Cancelar este agendamento?')) removerAgendamento(id);
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const date = String(form.get('date'));
    const hora = String(form.get('hora'));
    const servico = String(form.get('servico')).trim();
    if (!horarioDisponivel(date, hora, servico)) {
      window.alert('Horário fora do expediente ou em conflito com outro serviço. Verifique a duração e escolha outro horário.');
      return;
    }
    const created = adicionarAgendamento({
      date,
      hora,
      cliente: String(form.get('cliente')).trim(),
      servico,
      bicicleta: String(form.get('bicicleta')).trim(),
      status: 'iniciar',
      origem: 'admin',
    });
    if (!created) {
      window.alert('Horário indisponível: fora do expediente ou em conflito com outro serviço.');
      return;
    }
    const parsed = new Date(`${date}T12:00:00`);
    setYear(parsed.getFullYear());
    setMonth(parsed.getMonth());
    setSelectedDate(date);
    setCreating(false);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-bold text-slate-800">Origem dos agendamentos</div>
          <div className="mt-0.5 text-xs text-slate-400">
            A agenda reúne solicitações feitas no site e registros criados pela equipe.
          </div>
        </div>
        <div className="flex items-center rounded-lg bg-slate-100 p-1">
          {([
            { id: 'todos', label: `Todos (${agendaItems.length})` },
            {
              id: 'cliente',
              label: `Agendados no site (${agendaItems.filter((item) => item.origem === 'cliente').length})`,
            },
            {
              id: 'admin',
              label: `Criados no admin (${agendaItems.filter((item) => item.origem === 'admin').length})`,
            },
          ] as const).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setOriginFilter(option.id)}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                originFilter === option.id
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors text-lg">
              ‹
            </button>
            <h2 className="text-base font-bold text-slate-800">{MONTH_NAMES[month]} {year}</h2>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors text-lg">
              ›
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {WEEKDAYS.map((d) => (
              <div key={d} className={`py-2 text-center text-xs font-semibold ${d === 'Dom' || d === 'Sáb' ? 'text-slate-400' : 'text-slate-500'}`}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {grid.map((day, i) => {
              if (!day) return <div key={i} className="min-h-[80px] bg-slate-50/50 border-b border-r border-slate-100 last:border-r-0" />;
              const dateKey = toDateKey(year, month, day);
              const events = eventsByDate[dateKey] ?? [];
              const isToday = dateKey === today;
              const isSelected = dateKey === selectedDate;
              const isWeekend = (i % 7 === 0) || (i % 7 === 6);

              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`min-h-[80px] p-2 border-b border-r border-slate-100 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50' : isWeekend ? 'bg-slate-50/30 hover:bg-slate-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mb-1 ${
                    isToday
                      ? 'bg-blue-600 text-white'
                      : isSelected
                      ? 'bg-blue-100 text-blue-700'
                      : isWeekend
                      ? 'text-slate-400'
                      : 'text-slate-700'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {events.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`flex items-center gap-1 text-[10px] font-medium px-1 py-0.5 rounded ${STATUS_STYLES[ev.status].badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_STYLES[ev.status].dot}`} />
                        <span className="truncate">{ev.hora} {ev.cliente.split(' ')[0]}</span>
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-[10px] text-slate-400 pl-1">+{events.length - 2} mais</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 px-6 py-3 border-t border-slate-100 bg-slate-50/50">
            {(['concluido', 'concluir', 'iniciar'] as const).map((s) => (
              <span key={s} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`w-2 h-2 rounded-full ${STATUS_STYLES[s].dot}`} />
                {STATUS_STYLES[s].label.replace('✓ ', '')}
              </span>
            ))}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="text-sm font-bold text-slate-800">
              {selectedDate
                ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
                : 'Selecione um dia'}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {selectedItems.length === 0 ? 'Nenhum agendamento' : `${selectedItems.length} agendamento${selectedItems.length > 1 ? 's' : ''}`}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {selectedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-4xl mb-2">📅</span>
                <div className="text-sm text-slate-500">Nenhum serviço agendado</div>
                <button onClick={() => setCreating(true)} className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  + Novo Agendamento
                </button>
              </div>
            ) : (
              selectedItems.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-blue-600 font-mono">{item.hora}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status].badge}`}>
                      {STATUS_STYLES[item.status].label}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-800 mb-0.5">{item.cliente}</div>
                  <div className="text-xs text-slate-500 mb-0.5">{item.servico}</div>
                  <div className="text-xs text-blue-500">🚲 {item.bicicleta}</div>
                  {item.observacoes && (
                    <div className="mt-1 text-xs leading-relaxed text-slate-400">
                      Observação: {item.observacoes}
                    </div>
                  )}
                  {item.origem === 'cliente' && (
                    <span className="mt-2 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                      Agendado pelo cliente
                    </span>
                  )}
                  {item.status !== 'concluido' && (
                    <div className="flex gap-1.5 mt-3">
                      {item.status === 'iniciar' && (
                        <button
                          onClick={() => updateStatus(item.id, 'concluir')}
                          className="flex-1 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Iniciar
                        </button>
                      )}
                      {item.status === 'concluir' && (
                        <button
                          onClick={() => updateStatus(item.id, 'concluido')}
                          className="flex-1 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          ✓ Concluir
                        </button>
                      )}
                      <button onClick={() => removeItem(item.id)} className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="px-5 py-3 border-t border-slate-100">
            <button onClick={() => setCreating(true)} className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              + Novo Agendamento
            </button>
          </div>
        </div>
      </div>

      {/* Month summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total no Mês', value: visibleAgendaItems.filter(i => i.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`)).length, color: 'text-slate-800' },
          { label: 'Concluídos', value: visibleAgendaItems.filter(i => i.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`) && i.status === 'concluido').length, color: 'text-emerald-600' },
          { label: 'Pendentes', value: visibleAgendaItems.filter(i => i.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`) && i.status === 'concluir').length, color: 'text-amber-600' },
          { label: 'Agendados', value: visibleAgendaItems.filter(i => i.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`) && i.status === 'iniciar').length, color: 'text-blue-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-slate-600">{s.label}</div>
          </div>
        ))}
      </div>
      {creating && (
        <AdminModal title="Novo agendamento" subtitle="O compromisso será exibido no calendário selecionado." onClose={() => setCreating(false)}>
          <form onSubmit={handleCreate} className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-4">
              <label className="text-xs font-semibold text-slate-600">Data
                <input name="date" required type="date" defaultValue={selectedDate} className={`${fieldClass} mt-1.5`} />
              </label>
              <label className="text-xs font-semibold text-slate-600">Horário
                <input name="hora" required type="time" className={`${fieldClass} mt-1.5`} />
              </label>
            </div>
            <label className="block text-xs font-semibold text-slate-600">Cliente
              <input name="cliente" required autoFocus className={`${fieldClass} mt-1.5`} placeholder="Nome completo" />
            </label>
            <label className="block text-xs font-semibold text-slate-600">Serviço
              <input name="servico" required className={`${fieldClass} mt-1.5`} placeholder="Serviço solicitado" />
            </label>
            <label className="block text-xs font-semibold text-slate-600">Bicicleta
              <input name="bicicleta" required className={`${fieldClass} mt-1.5`} placeholder="Marca e modelo" />
            </label>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setCreating(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancelar</button>
              <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">Criar agendamento</button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
