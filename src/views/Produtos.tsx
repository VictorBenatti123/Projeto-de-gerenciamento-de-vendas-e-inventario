import { useState } from 'react';
import { useProdutos } from '../context/ProdutosContext';
import ProductFormModal from '../components/ProductFormModal';
import AdminModal from '../components/AdminModal';
import type { Produto } from '../data';

export default function Produtos() {
  const { produtos, toggleVitrine, removerProduto } = useProdutos();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Todas');
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [creating, setCreating] = useState(false);
  const [produtoParaRemover, setProdutoParaRemover] = useState<Produto | null>(null);

  const categorias = ['Todas', ...Array.from(new Set(produtos.map((p) => p.categoria))).sort()];
  const naVitrine = produtos.filter((p) => p.naVitrine).length;

  const filtered = produtos.filter((p) => {
    const matchSearch =
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.marca.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === 'Todas' || p.categoria === cat;
    return matchSearch && matchCat;
  });

  const confirmarRemocao = () => {
    if (!produtoParaRemover) return;
    removerProduto(produtoParaRemover.id);
    setProdutoParaRemover(null);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
          <span className="text-2xl">🏪</span>
          <div>
            <div className="text-2xl font-bold text-blue-600">{naVitrine}</div>
            <div className="text-sm text-slate-600">Na Vitrine</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
          <span className="text-2xl">📦</span>
          <div>
            <div className="text-2xl font-bold text-slate-800">{produtos.length}</div>
            <div className="text-sm text-slate-600">Total de Produtos</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <div className="text-2xl font-bold text-slate-800">{categorias.length - 1}</div>
            <div className="text-sm text-slate-600">Categorias</div>
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
              placeholder="Buscar produto, marca, SKU..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 transition-all"
            />
          </div>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none text-slate-600 bg-white"
          >
            {categorias.map((c) => <option key={c}>{c}</option>)}
          </select>
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            <button onClick={() => setView('grid')} className={`px-3 py-1.5 text-xs rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>Grade</button>
            <button onClick={() => setView('table')} className={`px-3 py-1.5 text-xs rounded-md transition-colors ${view === 'table' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>Tabela</button>
          </div>
          <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            + Novo Produto
          </button>
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
            {filtered.map((p) => (
              <div key={p.id} className="border border-slate-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                <div className="relative h-36 overflow-hidden bg-slate-100">
                  <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleVitrine(p.id)}
                      className={`px-2 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${p.naVitrine ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white/90 text-slate-600 hover:bg-blue-600 hover:text-white'}`}
                    >
                      {p.naVitrine ? '🏪 Vitrine' : '+ Vitrine'}
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-slate-800 leading-snug mb-1 line-clamp-2">{p.nome}</div>
                  <div className="text-xs text-slate-400 mb-2">{p.marca} · {p.sku}</div>
                  <span className="text-base font-bold text-slate-800">R${p.preco.toFixed(2).replace('.', ',')}</span>
                  <button
                    type="button"
                    onClick={() => setProdutoParaRemover(p)}
                    className="mt-3 w-full rounded-lg border border-red-100 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    Excluir produto
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['SKU', 'Produto', 'Categoria', 'Preço', 'Vitrine', 'Ações'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{p.sku}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          <img src={p.imagem} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800">{p.nome}</div>
                          <div className="text-xs text-slate-400">{p.marca}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{p.categoria}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">R${p.preco.toFixed(2).replace('.', ',')}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleVitrine(p.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${p.naVitrine ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}
                      >
                        {p.naVitrine ? '🏪 Na Vitrine' : 'Adicionar'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setProdutoParaRemover(p)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">Nenhum produto encontrado.</div>
        )}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          {filtered.length} de {produtos.length} produtos · {naVitrine} na vitrine
        </div>
      </div>
      {creating && <ProductFormModal onClose={() => setCreating(false)} />}
      {produtoParaRemover && (
        <AdminModal
          title="Excluir produto"
          subtitle="Esta ação remove o item do catálogo administrativo."
          onClose={() => setProdutoParaRemover(null)}
        >
          <div className="p-6">
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-900">Deseja excluir “{produtoParaRemover.nome}”?</p>
              <p className="mt-1 text-xs text-red-700">
                SKU {produtoParaRemover.sku} · {produtoParaRemover.estoque} unidades em estoque
              </p>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              O produto deixará de aparecer nas listagens, indicadores, alertas e resultados de busca do painel.
            </p>
            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setProdutoParaRemover(null)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarRemocao}
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Excluir produto
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
