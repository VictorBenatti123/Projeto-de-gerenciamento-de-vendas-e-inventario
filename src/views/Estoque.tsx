import { useState } from 'react';
import { useProdutos } from '../context/ProdutosContext';
import ProductFormModal from '../components/ProductFormModal';

const statusStyles: Record<string, string> = {
  ok: 'bg-emerald-50 text-emerald-700',
  baixo: 'bg-amber-50 text-amber-700',
  zerado: 'bg-red-50 text-red-700',
};
const statusLabels: Record<string, string> = { ok: 'Normal', baixo: 'Baixo', zerado: 'Zerado' };

export default function Estoque() {
  const { produtos, atualizarEstoque, estoqueBaixo, semEstoque } = useProdutos();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [creating, setCreating] = useState(false);

  const categorias = ['Todas', ...Array.from(new Set(produtos.map((p) => p.categoria))).sort()];

  const filtered = produtos.filter((p) => {
    const matchSearch =
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Todas' || p.categoria === catFilter;
    const matchStatus = statusFilter === 'todos' || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total de Itens', value: produtos.length, dot: 'bg-blue-500', color: 'text-blue-600' },
          { label: 'Estoque Normal', value: produtos.filter(p => p.status === 'ok').length, dot: 'bg-emerald-500', color: 'text-emerald-600' },
          { label: 'Estoque Baixo', value: estoqueBaixo, dot: 'bg-amber-500', color: 'text-amber-600' },
          { label: 'Sem Estoque', value: semEstoque, dot: 'bg-red-500', color: 'text-red-600' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
            <div>
              <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
              <div className="text-xs text-slate-500">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou SKU..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
            />
          </div>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none text-slate-600 bg-white"
          >
            {categorias.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none text-slate-600 bg-white"
          >
            <option value="todos">Todos os Status</option>
            <option value="ok">Normal</option>
            <option value="baixo">Baixo</option>
            <option value="zerado">Zerado</option>
          </select>
          <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            + Novo Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['SKU', 'Produto', 'Categoria', 'Marca', 'Estoque', 'Mín.', 'Status', 'Ações'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">{p.sku}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-800">{p.nome}</div>
                    <div className="text-xs text-slate-400">{p.fornecedor}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{p.categoria}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{p.marca}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${p.estoque === 0 ? 'text-red-500' : p.estoque < p.estoqueMinimo ? 'text-amber-600' : 'text-slate-800'}`}>
                      {p.estoque}
                    </span>
                    <span className="text-xs text-slate-400"> un.</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{p.estoqueMinimo} un.</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[p.status]}`}>
                      {statusLabels[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => atualizarEstoque(p.id, p.estoque - 1)}
                        disabled={p.estoque === 0}
                        className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 text-xs font-bold transition-colors"
                      >
                        −
                      </button>
                      <button
                        onClick={() => atualizarEstoque(p.id, p.estoque + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">Nenhum item encontrado.</div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          {filtered.length} de {produtos.length} itens
        </div>
      </div>
      {creating && <ProductFormModal onClose={() => setCreating(false)} />}
    </div>
  );
}
