import { useState } from 'react';
import { useManutencoes } from '../context/ManutencoesContext';
import { usePedidos } from '../context/PedidosContext';
import { useProdutos } from '../context/ProdutosContext';
import {
  addDays,
  formatPercentChange,
  latestDate,
  parseBrDate,
  parseIsoDate,
} from '../utils/analytics';

type Period = '30d' | '60d' | '90d';

const periodConfig: Record<Period, { days: number; weeks: number }> = {
  '30d': { days: 30, weeks: 4 },
  '60d': { days: 60, weeks: 8 },
  '90d': { days: 90, weeks: 13 },
};

const categoryColors = [
  'bg-blue-600',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-pink-500',
  'bg-slate-400',
];

function itemParts(item: string) {
  const match = item.match(/^(\d+)x\s+(.+)$/);
  return { quantity: match ? Number(match[1]) : 1, name: match ? match[2] : item };
}

export default function Relatorios() {
  const { produtos } = useProdutos();
  const { pedidos } = usePedidos();
  const { agendamentos } = useManutencoes();
  const [period, setPeriod] = useState<Period>('30d');

  const config = periodConfig[period];
  const referenceDate = latestDate([
    ...pedidos.map((pedido) => parseBrDate(pedido.data)),
    ...agendamentos.map((agendamento) => parseIsoDate(agendamento.date)),
  ]);
  const periodStart = addDays(referenceDate, -(config.days - 1));
  const previousStart = addDays(periodStart, -config.days);
  const previousEnd = addDays(periodStart, -1);

  const selectedOrders = pedidos.filter((pedido) => {
    const date = parseBrDate(pedido.data);
    return date && date >= periodStart && date <= referenceDate && pedido.status !== 'cancelado';
  });
  const previousOrders = pedidos.filter((pedido) => {
    const date = parseBrDate(pedido.data);
    return date && date >= previousStart && date <= previousEnd && pedido.status !== 'cancelado';
  });
  const selectedMaintenance = agendamentos.filter((item) => {
    const date = parseIsoDate(item.date);
    return date && date >= periodStart && date <= referenceDate;
  });
  const previousMaintenance = agendamentos.filter((item) => {
    const date = parseIsoDate(item.date);
    return date && date >= previousStart && date <= previousEnd;
  });

  const totalRevenue = selectedOrders.reduce((sum, pedido) => sum + pedido.total, 0);
  const previousRevenue = previousOrders.reduce((sum, pedido) => sum + pedido.total, 0);
  const avgTicket = selectedOrders.length ? totalRevenue / selectedOrders.length : 0;
  const previousTicket = previousOrders.length ? previousRevenue / previousOrders.length : 0;
  const stockValue = produtos.reduce((sum, produto) => sum + produto.preco * produto.estoque, 0);

  const weeks = Array.from({ length: config.weeks }, (_, index) => {
    const end = addDays(referenceDate, -(config.weeks - index - 1) * 7);
    const start = addDays(end, -6);
    const weekOrders = selectedOrders.filter((pedido) => {
      const date = parseBrDate(pedido.data);
      return date && date >= start && date <= end;
    });
    const weekMaintenance = selectedMaintenance.filter((item) => {
      const date = parseIsoDate(item.date);
      return date && date >= start && date <= end;
    });
    return {
      label: `${String(start.getDate()).padStart(2, '0')}/${String(start.getMonth() + 1).padStart(
        2,
        '0'
      )}`,
      revenue: weekOrders.reduce((sum, pedido) => sum + pedido.total, 0),
      maintenance: weekMaintenance.length,
    };
  });

  const productStats = new Map<string, { name: string; quantity: number; revenue: number; category: string }>();
  selectedOrders.forEach((pedido) => {
    pedido.itens.forEach((item) => {
      const { quantity, name } = itemParts(item);
      const product = produtos.find(
        (candidate) =>
          candidate.nome.toLowerCase() === name.toLowerCase() ||
          candidate.nome.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(candidate.nome.toLowerCase())
      );
      const key = product?.nome ?? name;
      const current = productStats.get(key) ?? {
        name: key,
        quantity: 0,
        revenue: 0,
        category: product?.categoria ?? 'Outros',
      };
      current.quantity += quantity;
      current.revenue += product ? product.preco * quantity : pedido.total / Math.max(1, pedido.itens.length);
      productStats.set(key, current);
    });
  });

  const topProducts = [...productStats.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  const categoryMap = new Map<string, { revenue: number; quantity: number }>();
  productStats.forEach((item) => {
    const current = categoryMap.get(item.category) ?? { revenue: 0, quantity: 0 };
    current.revenue += item.revenue;
    current.quantity += item.quantity;
    categoryMap.set(item.category, current);
  });
  const categories = [...categoryMap.entries()]
    .map(([category, values], index) => ({
      category,
      ...values,
      color: categoryColors[index % categoryColors.length],
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const maxRevenue = Math.max(1, ...weeks.map((week) => week.revenue));
  const maxMaintenance = Math.max(1, ...weeks.map((week) => week.maintenance));
  const maxCategoryRevenue = Math.max(1, ...categories.map((category) => category.revenue));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Relatórios e Estatísticas</h2>
          <p className="text-xs text-slate-400">
            Período encerrado em {referenceDate.toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center rounded-xl bg-slate-100 p-1">
          {(['30d', '60d', '90d'] as Period[]).map((item) => (
            <button
              key={item}
              onClick={() => setPeriod(item)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                period === item ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              {item === '30d' ? 'Últimos 30 dias' : item === '60d' ? '60 dias' : '90 dias'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: 'Receita do período',
            value: `R$${totalRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
            delta: formatPercentChange(totalRevenue, previousRevenue),
            color: 'text-emerald-600',
          },
          {
            label: 'Ticket médio',
            value: `R$${avgTicket.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
            delta: formatPercentChange(avgTicket, previousTicket),
            color: 'text-blue-600',
          },
          {
            label: 'Manutenções',
            value: String(selectedMaintenance.length),
            delta: formatPercentChange(selectedMaintenance.length, previousMaintenance.length),
            color: 'text-amber-600',
          },
          {
            label: 'Valor em estoque',
            value: `R$${stockValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
            delta: `${produtos.filter((produto) => produto.status !== 'ok').length} itens críticos`,
            color: 'text-slate-800',
          },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="mt-1 text-xs font-semibold text-slate-600">{card.label}</div>
            <div className="mt-1 text-xs text-slate-400">{card.delta}</div>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Receita x Manutenções por semana</h3>
            <p className="text-xs text-slate-400">Dados reais do período selecionado</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-blue-600" /> Receita
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-emerald-400" /> Manutenções
            </span>
          </div>
        </div>
        <div className="flex h-44 items-end gap-2">
          {weeks.map((week) => (
            <div key={week.label} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-36 w-full items-end gap-0.5">
                <div
                  className="flex-1 rounded-t-sm bg-blue-600"
                  style={{ height: `${(week.revenue / maxRevenue) * 100}%` }}
                  title={`R$${week.revenue.toLocaleString('pt-BR')}`}
                />
                <div
                  className="flex-1 rounded-t-sm bg-emerald-400"
                  style={{ height: `${(week.maintenance / maxMaintenance) * 100}%` }}
                  title={`${week.maintenance} manutenções`}
                />
              </div>
              <span className="text-[10px] text-slate-400">{week.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800">Receita por categoria</h3>
          <p className="mb-5 text-xs text-slate-400">Calculada a partir dos itens dos pedidos</p>
          {categories.length ? (
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.category}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{category.category}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{category.quantity} un.</span>
                      <span className="text-sm font-bold text-slate-800">
                        R${category.revenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${category.color}`}
                      style={{ width: `${(category.revenue / maxCategoryRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-slate-400">
              Nenhuma venda no período selecionado.
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800">Produtos mais vendidos</h3>
          <p className="mb-5 text-xs text-slate-400">Ranking por unidades vendidas</p>
          {topProducts.length ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-800">{product.name}</div>
                    <div className="text-xs text-slate-400">{product.quantity} unidades</div>
                  </div>
                  <div className="text-sm font-bold text-emerald-600">
                    R${product.revenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-slate-400">
              Nenhum produto vendido no período.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
