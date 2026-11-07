import { useState } from 'react';
import type { Manutencao } from '../data';
import { useManutencoes } from '../context/ManutencoesContext';
import { usePedidos } from '../context/PedidosContext';
import { useProdutos } from '../context/ProdutosContext';
import { addDays, latestDate, parseBrDate, parseIsoDate, toDateKey } from '../utils/analytics';

const vendaStatusStyles: Record<string, string> = {
  pago: 'bg-emerald-50 text-emerald-700',
  enviado: 'bg-blue-50 text-blue-700',
  processando: 'bg-amber-50 text-amber-700',
  cancelado: 'bg-red-50 text-red-700',
};

const vendaStatusLabels: Record<string, string> = {
  pago: 'Pago',
  enviado: 'Env.',
  processando: 'Proc.',
  cancelado: 'Cancel.',
};

function formatShortDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

function MaintenanceActions({
  id,
  status,
  onUpdate,
  onRemove,
}: {
  id: number;
  status: Manutencao['status'];
  onUpdate: (id: number, status: Manutencao['status']) => void;
  onRemove: (id: number) => void;
}) {
  if (status === 'concluido') {
    return (
      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        Concluído
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onUpdate(id, status === 'iniciar' ? 'concluir' : 'concluido')}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
          status === 'iniciar'
            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            : 'bg-emerald-500 text-white hover:bg-emerald-600'
        }`}
      >
        {status === 'iniciar' ? 'Iniciar' : 'Concluir'}
      </button>
      <button
        onClick={() => onRemove(id)}
        aria-label="Cancelar agendamento"
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-xs text-red-500 transition-colors hover:bg-red-100"
      >
        ×
      </button>
    </div>
  );
}

export default function Dashboard({
  onNavigate,
}: {
  onNavigate: (view: 'agenda' | 'vendas' | 'estoque') => void;
}) {
  const { produtos } = useProdutos();
  const { pedidos } = usePedidos();
  const { agendamentos, atualizarStatus, removerAgendamento } = useManutencoes();
  const [period, setPeriod] = useState<'hoje' | 'semana' | 'mes'>('hoje');

  const referenceDate = latestDate([
    ...pedidos.map((pedido) => parseBrDate(pedido.data)),
    ...agendamentos.map((agendamento) => parseIsoDate(agendamento.date)),
  ]);
  const referenceKey = toDateKey(referenceDate);
  const weekStart = addDays(referenceDate, -referenceDate.getDay());
  const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1, 12);

  const periodConfig = {
    hoje: {
      title: `Hoje — ${referenceDate.toLocaleDateString('pt-BR')}`,
      start: referenceKey,
      end: referenceKey,
    },
    semana: {
      title: `Semana de ${weekStart.toLocaleDateString('pt-BR')} a ${addDays(
        weekStart,
        6
      ).toLocaleDateString('pt-BR')}`,
      start: toDateKey(weekStart),
      end: toDateKey(addDays(weekStart, 6)),
    },
    mes: {
      title: referenceDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      start: toDateKey(monthStart),
      end: toDateKey(new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0, 12)),
    },
  };

  const activePeriod = periodConfig[period];
  const visibleMaintenance = agendamentos.filter(
    (item) => item.date >= activePeriod.start && item.date <= activePeriod.end
  );
  const criticalProducts = produtos.filter((produto) => produto.status !== 'ok');
  const todayOrders = pedidos.filter(
    (pedido) => parseBrDate(pedido.data)?.toDateString() === referenceDate.toDateString()
  );
  const todayRevenue = todayOrders
    .filter((pedido) => pedido.status !== 'cancelado')
    .reduce((sum, pedido) => sum + pedido.total, 0);
  const monthPrefix = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}`;
  const monthOrders = pedidos.filter((pedido) => {
    const date = parseBrDate(pedido.data);
    return (
      date?.getFullYear() === referenceDate.getFullYear() &&
      date.getMonth() === referenceDate.getMonth() &&
      pedido.status !== 'cancelado'
    );
  });
  const monthRevenue = monthOrders.reduce((sum, pedido) => sum + pedido.total, 0);
  const monthMaintenance = agendamentos.filter((item) => item.date.startsWith(monthPrefix));

  const kpis = [
    {
      label: 'Receita hoje',
      value: `R$${todayRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      detail: `${todayOrders.length} pedidos`,
      color: 'text-emerald-600',
    },
    {
      label: 'Pedidos hoje',
      value: String(todayOrders.length),
      detail: referenceDate.toLocaleDateString('pt-BR'),
      color: 'text-blue-600',
    },
    {
      label: 'Manutenções hoje',
      value: String(agendamentos.filter((item) => item.date === referenceKey).length),
      detail: 'agenda do dia',
      color: 'text-amber-600',
    },
    {
      label: 'Produtos críticos',
      value: String(criticalProducts.length),
      detail: `${criticalProducts.filter((item) => item.status === 'zerado').length} sem estoque`,
      color: 'text-red-600',
    },
  ];

  const goals = [
    { label: 'Receita mensal', value: monthRevenue, goal: 20000, prefix: 'R$' },
    { label: 'Pedidos no mês', value: monthOrders.length, goal: 40, prefix: '' },
    { label: 'Manutenções no mês', value: monthMaintenance.length, goal: 30, prefix: '' },
  ];

  const handleRemove = (id: number) => {
    if (window.confirm('Cancelar este agendamento?')) removerAgendamento(id);
  };

  return (
    <div className="space-y-5 p-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="mt-1 text-sm font-semibold text-slate-700">{kpi.label}</div>
            <div className="text-xs text-slate-400">{kpi.detail}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center gap-1 border-b border-slate-100 px-4 pt-4">
            {(['hoje', 'semana', 'mes'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setPeriod(item)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  period === item
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between border-b border-slate-50 px-4 py-3">
            <div>
              <div className="text-sm font-semibold capitalize text-slate-700">{activePeriod.title}</div>
              <div className="text-xs text-slate-400">
                {visibleMaintenance.length} atendimentos ·{' '}
                {visibleMaintenance.filter((item) => item.status === 'concluido').length} concluídos
              </div>
            </div>
            <button
              onClick={() => onNavigate('agenda')}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Abrir agenda
            </button>
          </div>
          <div className="max-h-[430px] divide-y divide-slate-50 overflow-y-auto">
            {visibleMaintenance.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/60">
                <div className="w-20 shrink-0">
                  {period !== 'hoje' && (
                    <div className="text-[10px] font-semibold capitalize text-slate-400">
                      {formatShortDate(item.date)}
                    </div>
                  )}
                  <div className="font-mono text-xs font-bold text-blue-600">{item.hora}</div>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                  {item.cliente.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-800">{item.cliente}</div>
                  <div className="truncate text-xs text-slate-500">
                    {item.servico} · {item.bicicleta}
                  </div>
                </div>
                <MaintenanceActions
                  id={item.id}
                  status={item.status}
                  onUpdate={atualizarStatus}
                  onRemove={handleRemove}
                />
              </div>
            ))}
            {visibleMaintenance.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-400">
                Nenhuma manutenção neste período.
              </div>
            )}
          </div>
        </section>

        <div className="space-y-5">
          <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-slate-800">Produtos que exigem ação</div>
                <div className="text-xs text-slate-400">{criticalProducts.length} itens críticos</div>
              </div>
              <button onClick={() => onNavigate('estoque')} className="text-xs font-semibold text-blue-600">
                Gerenciar
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {criticalProducts.slice(0, 4).map((produto) => (
                <div key={produto.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      produto.status === 'zerado' ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-slate-700">{produto.nome}</div>
                    <div className="text-[11px] text-slate-400">
                      {produto.estoque} un. · mínimo {produto.estoqueMinimo}
                    </div>
                  </div>
                </div>
              ))}
              {criticalProducts.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhum produto exige reposição.
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-slate-800">Últimas vendas</div>
                <div className="text-xs text-slate-400">Dados compartilhados do checkout</div>
              </div>
              <button onClick={() => onNavigate('vendas')} className="text-xs font-semibold text-blue-600">
                Ver tudo
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {pedidos.slice(0, 5).map((pedido) => (
                <div key={pedido.id} className="grid grid-cols-[55px_1fr_auto] items-center gap-2 px-4 py-2.5">
                  <span className="text-xs font-semibold text-blue-600">#{pedido.id}</span>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-slate-700">{pedido.cliente}</div>
                    <div className="text-[10px] text-slate-400">{pedido.data}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-800">
                      R${pedido.total.toFixed(2).replace('.', ',')}
                    </div>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${vendaStatusStyles[pedido.status]}`}>
                      {vendaStatusLabels[pedido.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-sm font-bold text-slate-800">Metas do mês</h2>
          <p className="text-xs text-slate-400">
            Visão executiva de {referenceDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.value / goal.goal) * 100));
            return (
              <div key={goal.label}>
                <div className="mb-2 flex items-end justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-600">{goal.label}</div>
                    <div className="text-lg font-bold text-slate-800">
                      {goal.prefix}
                      {goal.value.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-1 text-[10px] text-slate-400">
                  Meta: {goal.prefix}
                  {goal.goal.toLocaleString('pt-BR')}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
