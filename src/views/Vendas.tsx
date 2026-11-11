import { useState, type FormEvent } from 'react';
import type { Venda } from '../data';
import { usePedidos, type Pedido } from '../context/PedidosContext';
import { useProdutos } from '../context/ProdutosContext';
import { readStoredValue } from '../utils/storage';
import AdminModal, { fieldClass } from '../components/AdminModal';

const statusStyles: Record<string, string> = {
  pago: 'bg-emerald-50 text-emerald-700',
  enviado: 'bg-blue-50 text-blue-700',
  processando: 'bg-amber-50 text-amber-700',
  cancelado: 'bg-red-50 text-red-700',
};
const statusLabels: Record<string, string> = { pago: 'Pago', enviado: 'Enviado', processando: 'Processando', cancelado: 'Cancelado' };

export default function Vendas() {
  const { pedidos: items, adicionarPedido, atualizarStatusPedido } = usePedidos();
  const { produtos, registrarSaida, registrarEstorno } = useProdutos();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const filtered = items.filter((v) => {
    const matchSearch = v.cliente.toLowerCase().includes(search.toLowerCase()) || String(v.id).includes(search);
    const matchStatus = statusFilter === 'todos' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const total = items
    .filter((venda) => venda.status === 'pago' || venda.status === 'enviado')
    .reduce((sum, venda) => sum + venda.total, 0);
  const pagos = total;
  const today = new Date().toLocaleDateString('pt-BR');

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const rawItems = String(form.get('itens')).split(',').map((item) => item.trim()).filter(Boolean);
    const parsedItems = rawItems.map((raw) => {
      const quantityMatch = raw.match(/^(\d+)\s*x\s*(.+)$/i);
      const quantidade = quantityMatch ? Number(quantityMatch[1]) : 1;
      const term = (quantityMatch ? quantityMatch[2] : raw).trim().toLocaleLowerCase('pt-BR');
      const produto = produtos.find((candidate) =>
        candidate.nome.toLocaleLowerCase('pt-BR') === term || candidate.sku.toLocaleLowerCase('pt-BR') === term
      );
      return { raw, quantidade, produto };
    });
    const missing = parsedItems.find((item) => !item.produto);
    if (missing) {
      setFormError(`Produto não encontrado no catálogo: "${missing.raw}". Cadastre o produto ou informe seu nome/SKU corretamente.`);
      return;
    }
    if (parsedItems.some((item) => !Number.isInteger(item.quantidade) || item.quantidade <= 0)) {
      setFormError('Informe quantidades inteiras positivas, por exemplo: 2x Pneu Maxxis Ardent 29\".');
      return;
    }
    const matchedItems = parsedItems as { raw: string; quantidade: number; produto: (typeof produtos)[number] }[];
    const orderTotal = Number(form.get('total'));
    if (!Number.isFinite(orderTotal) || orderTotal <= 0) {
      setFormError('Informe um valor total maior que zero.');
      return;
    }
    const settings = readStoredValue<{ permitirVendaSemEstoque?: boolean }>('slm.configuracoes.v1', {});
    const stockResult = registrarSaida(
      matchedItems.map(({ produto, quantidade }) => ({ produtoId: produto.id, quantidade })),
      'Venda registrada no administrativo',
      settings.permitirVendaSemEstoque === true
    );
    if (!stockResult.ok) {
      setFormError(stockResult.error ?? 'Não foi possível atualizar o estoque.');
      return;
    }
    const itens = matchedItems.map(({ produto, quantidade }) => `${quantidade}x ${produto.nome}`);
    const grossItemsTotal = matchedItems.reduce((sum, item) => sum + item.produto.preco * item.quantidade, 0);
    let remainingOrderTotal = orderTotal;
    const itensDetalhados = matchedItems.map(({ produto, quantidade }, index) => {
      const lineGross = produto.preco * quantidade;
      const subtotal = index === matchedItems.length - 1
        ? remainingOrderTotal
        : Number((orderTotal * lineGross / grossItemsTotal).toFixed(2));
      remainingOrderTotal = Number((remainingOrderTotal - subtotal).toFixed(2));
      return {
        produtoId: produto.id, sku: produto.sku, nome: produto.nome,
        categoria: produto.categoria, quantidade,
        precoUnitario: Number((subtotal / quantidade).toFixed(4)), subtotal,
      };
    });
    const now = new Date();
    setFormError('');
    adicionarPedido({
      cliente: String(form.get('cliente')).trim(),
      total: orderTotal,
      status: String(form.get('status')) as Venda['status'],
      data: now.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      itens,
      itensDetalhados,
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

        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
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
        </div>

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
            {selected.telefone && <div className="text-sm text-slate-600"><span className="font-medium text-slate-800">Telefone:</span> {selected.telefone}</div>}
            {selected.enderecoEntrega && (
              <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                <div className="mb-1 font-semibold text-slate-800">Endereço de entrega</div>
                {selected.enderecoEntrega.logradouro}, {selected.enderecoEntrega.numero}
                {selected.enderecoEntrega.complemento ? ' · ' + selected.enderecoEntrega.complemento : ''}
                <br />{selected.enderecoEntrega.bairro}, {selected.enderecoEntrega.cidade} - {selected.enderecoEntrega.estado}
                <br />CEP {selected.enderecoEntrega.cep}
              </div>
            )}
            {selected.parcelas && selected.parcelas > 1 && <div className="text-sm text-slate-600">Parcelamento selecionado: {selected.parcelas}x (simulação)</div>}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <label className="block text-xs font-semibold text-slate-600">
                Atualizar status do pedido
                <select value={selected.status} onChange={(event) => {
                  const nextStatus = event.target.value as Venda['status'];
                  atualizarStatusPedido(selected.id, nextStatus);
                  setSelected({ ...selected, status: nextStatus });
                }} className={`${fieldClass} mt-1.5 bg-white`}>
                  <option value="processando">Processando</option>
                  <option value="pago">Pago</option>
                  <option value="enviado">Enviado</option>
 
                </select>
              </label>
              {selected.status !== 'cancelado' && (
                <button onClick={() => {
                  const detailed = selected.itensDetalhados?.map((item) => ({ produtoId: item.produtoId, quantidade: item.quantidade }));
                  const legacy = selected.itens.map((raw) => {
                    const match = raw.match(/^(\d+)x\s+(.+)$/i);
                    const quantity = match ? Number(match[1]) : 1;
                    const name = (match ? match[2] : raw).trim().toLocaleLowerCase('pt-BR');
                    const product = produtos.find((candidate) => candidate.nome.toLocaleLowerCase('pt-BR') === name);
                    return product ? { produtoId: product.id, quantidade: quantity } : null;
                  });
                  const restockItems = detailed ?? legacy.filter((item): item is { produtoId: number; quantidade: number } => item !== null);
                  if (restockItems.length === 0 || (!detailed && restockItems.length !== legacy.length)) {
                    window.alert('Não foi possível identificar todos os produtos deste pedido. O cancelamento foi bloqueado para evitar divergência no estoque.');
                    return;
                  }
                  const result = registrarEstorno(restockItems, selected.id);
                  if (!result.ok) { window.alert(result.error ?? 'Não foi possível estornar o estoque.'); return; }
                  atualizarStatusPedido(selected.id, 'cancelado');
                  setSelected({ ...selected, status: 'cancelado' });
                }} className="w-full rounded-lg bg-red-50 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
                  Cancelar pedido e devolver ao estoque
                </button>
              )}
              <p className="text-[11px] leading-relaxed text-amber-700">O status de pagamento só deve ser alterado após confirmação externa. Este sistema ainda não possui gateway integrado.</p>
              <button onClick={() => setSelected(null)} className="w-full py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors">Fechar</button>
            </div>
          </div>
        </div>
      )}
      {creating && (
        <AdminModal title="Nova venda" subtitle="Registre uma venda realizada fora do checkout online." onClose={() => setCreating(false)}>
          <form onSubmit={handleCreate} className="space-y-4 p-6">
            {formError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{formError}</div>}
            <label className="block text-xs font-semibold text-slate-600">
              Cliente
              <input name="cliente" required autoFocus className={`${fieldClass} mt-1.5`} placeholder="Nome do cliente" />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Itens
              <textarea name="itens" required rows={3} className={`${fieldClass} mt-1.5 resize-none`} placeholder={'Separe por vírgula. Ex.: 2x Pneu Maxxis Ardent 29"'} />
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
