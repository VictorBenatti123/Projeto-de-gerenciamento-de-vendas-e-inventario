import { useState } from 'react';
import type { Produto } from '../../data';
import { useCart } from '../../context/CartContext';
import { useProdutos } from '../../context/ProdutosContext';

const HERO = 'https://images.unsplash.com/photo-1506316940527-4d1c138978a0?w=1600&h=700&fit=crop&auto=format&q=80';

const statusBadge = (p: Produto) => {
  if (p.estoque === 0) return { label: 'Esgotado', cls: 'bg-red-100 text-red-600' };
  if (p.estoque < p.estoqueMinimo) return { label: 'Últimas unidades', cls: 'bg-amber-100 text-amber-700' };
  return null;
};

interface Props {
  onViewProduto: (id: number) => void;
  onSchedule: () => void;
}

export default function Vitrine({ onViewProduto, onSchedule }: Props) {
  const { addItem, permiteSemEstoque } = useCart();
  const { produtos } = useProdutos();
  const [cat, setCat] = useState('Todos');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'relevancia' | 'preco-asc' | 'preco-desc' | 'nome'>('relevancia');

  const categorias = ['Todos', ...Array.from(new Set(produtos.map((p) => p.categoria))).sort()];
  const vitrine = produtos.filter((p) => p.naVitrine);

  const filtered = vitrine
    .filter((p) => {
      const matchCat = cat === 'Todos' || p.categoria === cat;
      const matchSearch =
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        p.marca.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sort === 'preco-asc') return a.preco - b.preco;
      if (sort === 'preco-desc') return b.preco - a.preco;
      if (sort === 'nome') return a.nome.localeCompare(b.nome);
      return 0;
    });

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[440px] overflow-hidden">
        <img src={HERO} alt="SLM Bikes & Parts" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/50 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
          <div className="max-w-xl">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300 mb-4">SLM Bikes & Parts</div>
            <h1 className="text-5xl font-extrabold text-white leading-[1.05] mb-5 tracking-tight">
              Peças e acessórios<br />para sua bicicleta.
            </h1>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Componentes, equipamentos e acessórios para diferentes modalidades de ciclismo.
            </p>
            <div className="flex gap-3">
              <a
                href="#produtos"
                onClick={(e) => { e.preventDefault(); document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Ver Produtos →
              </a>
              <button onClick={onSchedule} className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm backdrop-blur-sm">
                Agendar Manutenção
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-[#082b5c] text-white border-t-4 border-[#f5d51d]">
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {['Peças e componentes', 'Acessórios', 'Assistência técnica', 'Atendimento especializado'].map((text) => (
            <div key={text} className="text-[11px] font-semibold uppercase tracking-[0.12em]">{text}</div>
          ))}
        </div>
      </div>

      {/* Product section */}
      <section id="produtos" className="max-w-7xl mx-auto px-6 py-12">
        {/* Category pills */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {categorias.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all border ${
                cat === c
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Search + sort */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 relative max-w-sm">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="px-3 py-2.5 border border-slate-200 rounded-md text-sm outline-none text-slate-600 bg-white"
          >
            <option value="relevancia">Mais relevantes</option>
            <option value="preco-asc">Menor preço</option>
            <option value="preco-desc">Maior preço</option>
            <option value="nome">A-Z</option>
          </select>
          <span className="text-sm text-slate-400">{filtered.length} produtos</span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="text-5xl mb-4">🔍</div>
            <div className="text-lg font-medium">Nenhum produto encontrado</div>
            <div className="text-sm mt-1">Tente outro termo ou categoria</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => {
              const badge = statusBadge(p);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-md border border-slate-200 shadow-none hover:shadow-md transition-all duration-200 overflow-hidden group"
                >
                  {/* Image */}
                  <div
                    className="relative h-48 overflow-hidden bg-slate-100 cursor-pointer"
                    onClick={() => onViewProduto(p.id)}
                  >
                    <img
                      src={p.imagem}
                      alt={p.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {badge && (
                      <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full ${badge.cls}`}>
                        {badge.label}
                      </span>
                    )}
                    <span className="absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full bg-white/90 text-slate-600 backdrop-blur-sm">
                      {p.categoria}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <button
                      onClick={() => onViewProduto(p.id)}
                      className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors leading-snug text-left w-full mb-1"
                    >
                      {p.nome}
                    </button>
                    <div className="text-xs text-slate-400 mb-3">{p.marca} · {p.sku}</div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xl font-bold text-slate-900">
                          R${p.preco.toFixed(2).replace('.', ',')}
                        </div>
                        <div className="text-xs text-slate-400">
                          Consulte parcelamento no checkout
                        </div>
                      </div>
                      {p.estoque > 0 && (
                        <span className="text-xs text-emerald-600 font-medium">{p.estoque} em estoque</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => addItem(p)}
                        disabled={p.estoque === 0 && !permiteSemEstoque}
                        className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {p.estoque === 0 && !permiteSemEstoque ? 'Esgotado' : '+ Carrinho'}
                      </button>
                      <button
                        onClick={() => onViewProduto(p.id)}
                        className="px-3 py-2.5 border border-slate-200 rounded-xl text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors text-sm"
                      >
                        Ver →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
