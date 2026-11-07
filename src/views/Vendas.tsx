import { useState, type FormEvent } from 'react';
import type { Venda } from '../data';
import { usePedidos, type Pedido } from '../context/PedidosContext';
import AdminModal, { fieldClass } from '../components/AdminModal';

const statusStyles: Record<string, string> = {
  pago: 'bg-emerald-50 text-emerald-700',
  enviado: 'bg-blue-50 text-blue-700',
  processando: 'bg-amber-50 text-amber-700',
  cancelado: 'bg-red-50 text-red-700',
};
const statusLabels: Record<string, string> = { pago: 'Pago', enviado: 'Enviado', processando: 'Processando', cancelado: 'Cancelado' };

export default function Vendas() {
  const { pedidos: items, adicionarPedido } = usePedidos();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = items.filter((v) => {
    const matchSearch = v.cliente.toLowerCase().includes(search.toLowerCase()) || String(v.id).includes(search);
    const matchStatus = statusFilter === 'todos' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const total = items
    .filter((venda) => venda.status !== 'cancelado')
    .reduce((sum, venda) => sum + venda.total, 0);
  const pagos = items.filter((venda) => venda.status === 'pago').reduce((sum, venda) => sum + venda.total, 0);
  const today = new Date().toLocaleDateString('pt-BR');

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const itens = String(form.get('itens')).split(',').map((item) => item.trim()).filter(Boolean);
    const now = new Date();
    adicionarPedido({
      cliente: String(form.get('cliente')).trim(),
      total: Number(form.get('total')),
      status: String(form.get('status')) as Venda['status'],
      data: now.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      itens,
      origem: 'admin',
      formaPagamento: 'outro',
    });
    setCreating(false);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total de Pedidos', value: items.length, color: 'text-slate-800', sub: 'todo o histórico' },
          { label: 'Receita Acumulada', value: `R$${total.toLocaleString('pt-BR')}`, color: 'text-emerald-600', sub: 'exceto cancelados' },
          { label: 'Valor Recebido', value: `R$${pagos.toLocaleString('pt-BR')}`, color: 'text-blue-600', sub: 'pagamentos confirmados' },
          { label: 'Pedidos Hoje', value: items.filter(v => v.data.includes(today)).length, color: 'text-amber-600', sub: today },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className={`text-2xl font-bold ${c.color} leading-none mb-1`}>{c.value}</div>
            <div className="text-sm font-medium text-slate-700">{c.label}</div>
            <div className="text-xs text-slate-400">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente ou pedido..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none text-slate-600 bg-white"
          >
            <option value="todos">Todos os Status</option>
            <option value="pago">Pago</option>
            <option value="enviado">Enviado</option>
            <option value="processando">Processando</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            + Nova Venda
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {['Pedido', 'Data', 'Cliente', 'Itens', 'Total', 'Status', 'Ações'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="text-sm font-semibold text-blue-600">#{v.id}</div>
                  {v.origem === 'site' && (
                    <span className="mt-0.5 inline-block rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600">
                      Site
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">{v.data}</td>
                <td className="px-5 py-3 text-sm font-medium text-slate-800">{v.cliente}</td>
                <td className="px-5 py-3">
                  <div className="text-xs text-slate-500">
                    {v.itens.slice(0, 2).map((item, i) => (
                      <div key={i} className="truncate max-w-[160px]">{item}</div>
                    ))}
                    {v.itens.length > 2 && <div className="text-slate-400">+{v.itens.length - 2} mais</div>}
                  </div>
                </td>
                <td className="px-5 py-3 text-sm font-bold text-slate-800">
                  R${v.total.toLocaleString('pt-BR')}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[v.status]}`}>
                    {statusLabels[v.status]}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => setSelected(v)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Ver detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">Nenhuma venda encontrada.</div>
        )}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          {filtered.length} de {items.length} pedidos
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-lg font-bold text-slate-800">Pedido #{selected.id}</div>
                <div className="text-xs text-slate-400">{selected.data}</div>
              </div>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${statusStyles[selected.status]}`}>
                {statusLabels[selected.status]}
              </span>
            </div>
            <div className="space-y-3 mb-4">
              <div className="text-sm text-slate-600"><span className="font-medium text-slate-800">Cliente:</span> {selected.cliente}</div>
              {selected.email && (
                <div className="text-sm text-slate-600"><span className="font-medium text-slate-800">E-mail:</span> {selected.email}</div>
              )}
              {selected.formaPagamento && selected.formaPagamento !== 'outro' && (
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-slate-800">Pagamento:</span>{' '}
                  {selected.formaPagamento === 'cartao'
                    ? `Cartão final ${selected.finalCartao}`
                    : selected.formaPagamento.toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-slate-800 mb-2">Itens do pedido:</div>
                <div className="space-y-1">
                  {selected.itens.map((item, i) => (
                    <div key={i} className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-sm font-medium text-slate-700">Total</span>
                <span className="text-xl font-bold text-slate-800">R${selected.total.toLocaleString('pt-BR')}</span>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="w-full py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
      {creating && (
        <AdminModal title="Nova venda" subtitle="Registre uma venda realizada fora do checkout online." onClose={() => setCreating(false)}>
          <form onSubmit={handleCreate} className="space-y-4 p-6">
            <label className="block text-xs font-semibold text-slate-600">
              Cliente
              <input name="cliente" required autoFocus className={`${fieldClass} mt-1.5`} placeholder="Nome do cliente" />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Itens
              <textarea name="itens" required rows={3} className={`${fieldClass} mt-1.5 resize-none`} placeholder="Separe os produtos por vírgula" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="text-xs font-semibold text-slate-600">
                Total (R$)
                <input name="total" required type="number" min="0.01" step="0.01" className={`${fieldClass} mt-1.5`} />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Status
                <select name="status" className={`${fieldClass} mt-1.5 bg-white`}>
                  <option value="processando">Processando</option>
                  <option value="pago">Pago</option>
                  <option value="enviado">Enviado</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setCreating(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancelar</button>
              <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">Registrar venda</button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
