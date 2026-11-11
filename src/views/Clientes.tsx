import { useState, type FormEvent } from 'react';
import { clientes, type Cliente } from '../data';
import { useAuth } from '../context/AuthContext';
import { usePersistentState } from '../utils/storage';
import { useManutencoes } from '../context/ManutencoesContext';
import { usePedidos } from '../context/PedidosContext';
import AdminModal, { fieldClass } from '../components/AdminModal';

export default function Clientes() {
  const { pedidos } = usePedidos();
  const { agendamentos } = useManutencoes();
  const { users, updateUser } = useAuth();
  const [manualClientes, setManualClientes] = usePersistentState<Cliente[]>('slm.clientes.v1', clientes);
  const registeredCustomers: Cliente[] = users.filter((user) => user.role === 'customer').map((user) => {
    const numericId = Number(user.id);
    const stableId = Number.isSafeInteger(numericId) && numericId > 0
      ? 100000 + numericId
      : 1000000 + [...user.id].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7) % 8000000;
    const orders = pedidos.filter((pedido) => pedido.clienteId === user.id || (!pedido.clienteId && pedido.email?.toLowerCase() === user.email.toLowerCase()));
    const lastOrder = [...orders].sort((a, b) => {
      const parse = (value: string) => {
        const [day, month, year] = value.split(' ')[0].split('/').map(Number);
        return year ? new Date(year, month - 1, day).getTime() : 0;
      };
      return parse(b.data) - parse(a.data);
    })[0];
    return { id: stableId, userId: user.id, nome: user.name, email: user.email,
      telefone: user.telefone ?? '', totalCompras: orders.filter((pedido) => pedido.status !== 'cancelado').reduce((sum, pedido) => sum + pedido.total, 0),
      ultimaVisita: lastOrder?.data.split(' ')[0] ?? '—', bicicletas: user.bicicletas ?? 0 };
  });
  const items = [
    ...manualClientes.filter((client) => !users.some((user) => user.role === 'customer' && user.email.toLowerCase() === client.email.toLowerCase())),
    ...registeredCustomers,
  ];
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Cliente | null | 'new'>(null);
  const [history, setHistory] = useState<Cliente | null>(null);

  const filtered = items.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.telefone.includes(search)
  );

  const validOrders = pedidos.filter((pedido) => pedido.status !== 'cancelado');
  const customerOrders = (client: Cliente) => validOrders.filter((pedido) => {
    if (client.userId && pedido.clienteId) return pedido.clienteId === client.userId;
    if (pedido.email && client.email) return pedido.email.toLowerCase() === client.email.toLowerCase();
    return pedido.cliente.toLowerCase() === client.nome.toLowerCase();
  });
  const customerTotal = (client: Cliente) => customerOrders(client).reduce((sum, pedido) => sum + pedido.total, 0);
  const revenueByCustomer = validOrders.reduce<Record<string, number>>((acc, pedido) => {
    acc[pedido.cliente] = (acc[pedido.cliente] ?? 0) + pedido.total;
    return acc;
  }, {});
  const topCustomer = Object.entries(revenueByCustomer).sort((a, b) => b[1] - a[1])[0];
  const totalRevenue = validOrders.reduce((sum, pedido) => sum + pedido.total, 0);
  const averageTicket = validOrders.length ? totalRevenue / validOrders.length : 0;
  const activeCustomers = Object.keys(revenueByCustomer).length;

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = {
      nome: String(form.get('nome')).trim(),
      email: String(form.get('email')).trim(),
      telefone: String(form.get('telefone')).trim(),
      bicicletas: Number(form.get('bicicletas')),
    };
    if (editing && editing !== 'new') {
      if (editing.userId) {
        const duplicate = users.some((user) => user.id !== editing.userId && user.role === 'customer' && user.email.toLowerCase() === values.email.toLowerCase());
        if (duplicate) { window.alert('Este e-mail já está vinculado a outro cliente.'); return; }
        updateUser(editing.userId, { name: values.nome, email: values.email, telefone: values.telefone, bicicletas: values.bicicletas });
      } else {
        setManualClientes((prev) => prev.map((client) => client.id === editing.id ? { ...client, ...values } : client));
      }
    } else {
      if (manualClientes.some((client) => client.email.toLowerCase() === values.email.toLowerCase()) || users.some((user) => user.email.toLowerCase() === values.email.toLowerCase())) {
        window.alert('Já existe um cliente com este e-mail.');
        return;
      }
      const novo: Cliente = { ...values, id: Math.max(0, ...items.map((client) => client.id)) + 1,
        totalCompras: 0, ultimaVisita: new Date().toLocaleDateString('pt-BR') };
      setManualClientes((prev) => [novo, ...prev]);
    }
    setEditing(null);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="text-2xl font-bold text-slate-800">{items.length}</div>
          <div className="text-sm text-slate-600 font-medium">Total de Clientes</div>
          <div className="text-xs text-slate-400">cadastrados no sistema</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{activeCustomers}</div>
          <div className="text-sm text-slate-600 font-medium">Compradores Ativos</div>
          <div className="text-xs text-slate-400">com pedidos registrados</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="text-2xl font-bold text-emerald-600">
            R${averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-slate-600 font-medium">Ticket Médio</div>
          <div className="text-xs text-slate-400">
            {topCustomer ? `Maior comprador: ${topCustomer[0]}` : 'sem compras registradas'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail ou telefone..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 transition-all"
            />
          </div>
          <button onClick={() => setEditing('new')} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            + Novo Cliente
          </button>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {['Cliente', 'Contato', 'Bicicletas', 'Total Gasto', 'Última Visita', 'Ações'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold shrink-0">
                      {c.nome.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{c.nome}</div>
                      <div className="text-xs text-slate-400">ID #{c.id.toString().padStart(4, '0')}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="text-xs text-slate-700">{c.email}</div>
                  <div className="text-xs text-slate-400">{c.telefone}</div>
                </td>
                <td className="px-5 py-3 text-sm text-slate-700 font-medium">{c.bicicletas}</td>
                <td className="px-5 py-3 text-sm font-bold text-emerald-600">
                  R${customerTotal(c).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3 text-xs text-slate-500">
                  {customerOrders(c)[0]?.data.split(' ')[0] ?? c.ultimaVisita}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditing(c)} className="text-xs text-blue-600 hover:underline">Editar</button>
                    <span className="text-slate-200">|</span>
                    <button onClick={() => setHistory(c)} className="text-xs text-slate-500 hover:underline">Histórico</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">Nenhum cliente encontrado.</div>
        )}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          {filtered.length} de {items.length} clientes
        </div>
      </div>
      {editing && (
        <AdminModal title={editing === 'new' ? 'Novo cliente' : 'Editar cliente'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSave} className="space-y-4 p-6">
            <label className="block text-xs font-semibold text-slate-600">Nome completo
              <input name="nome" required autoFocus defaultValue={editing === 'new' ? '' : editing.nome} className={`${fieldClass} mt-1.5`} />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="text-xs font-semibold text-slate-600">E-mail
                <input name="email" required type="email" defaultValue={editing === 'new' ? '' : editing.email} className={`${fieldClass} mt-1.5`} />
              </label>
              <label className="text-xs font-semibold text-slate-600">Telefone
                <input name="telefone" required defaultValue={editing === 'new' ? '' : editing.telefone} className={`${fieldClass} mt-1.5`} />
              </label>
            </div>
            <label className="block text-xs font-semibold text-slate-600">Bicicletas cadastradas
              <input name="bicicletas" required type="number" min="0" defaultValue={editing === 'new' ? 0 : editing.bicicletas} className={`${fieldClass} mt-1.5`} />
            </label>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancelar</button>
              <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">Salvar cliente</button>
            </div>
          </form>
        </AdminModal>
      )}
      {history && (
        <AdminModal title={`Histórico de ${history.nome}`} subtitle={`${history.email} · ${history.telefone}`} onClose={() => setHistory(null)}>
          <div className="space-y-5 p-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-50 p-4"><div className="text-xs text-emerald-700">Total gasto</div><div className="text-xl font-bold text-emerald-700">R${customerTotal(history).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>
              <div className="rounded-xl bg-blue-50 p-4"><div className="text-xs text-blue-700">Bicicletas</div><div className="text-xl font-bold text-blue-700">{history.bicicletas}</div></div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold text-slate-700">Compras relacionadas</h3>
              {customerOrders(history).map((pedido) => (
                <div key={pedido.id} className="flex justify-between border-b border-slate-100 py-2 text-sm"><span className="text-slate-600">Pedido #{pedido.id}</span><span className="font-semibold text-slate-800">R${pedido.total.toLocaleString('pt-BR')}</span></div>
              ))}
              {customerOrders(history).length === 0 && <p className="text-sm text-slate-400">Nenhuma compra detalhada encontrada.</p>}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold text-slate-700">Manutenções</h3>
              {agendamentos.filter((item) => history.userId && item.clienteId ? item.clienteId === history.userId : item.cliente === history.nome).map((item) => (
                <div key={item.id} className="border-b border-slate-100 py-2"><div className="text-sm font-medium text-slate-700">{item.servico}</div><div className="text-xs text-slate-400">{item.bicicleta} · {item.date} às {item.hora}</div></div>
              ))}
              {!agendamentos.some((item) => history.userId && item.clienteId ? item.clienteId === history.userId : item.cliente === history.nome) && <p className="text-sm text-slate-400">Nenhuma manutenção registrada.</p>}
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
