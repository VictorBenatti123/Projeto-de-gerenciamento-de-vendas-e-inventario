import { useState } from 'react';
import type { Produto } from '../../data';
import { useCart } from '../../context/CartContext';
import { useProdutos } from '../../context/ProdutosContext';

interface Props {
  produtoId: number;
  onBack: () => void;
  onViewProduto: (id: number) => void;
  onCheckout: () => void;
}

const statusBadge = (p: Produto) => {
  if (p.estoque === 0) return { label: 'Esgotado', cls: 'bg-red-100 text-red-700' };
  if (p.estoque < p.estoqueMinimo) return { label: `Últimas ${p.estoque} unidades!`, cls: 'bg-amber-100 text-amber-700' };
  return { label: `${p.estoque} em estoque`, cls: 'bg-emerald-100 text-emerald-700' };
};

export default function ProdutoDetalhe({ produtoId, onBack, onViewProduto, onCheckout }: Props) {
  const { addItem } = useCart();
  const { produtos } = useProdutos();
  const produto = produtos.find((p) => p.id === produtoId);
  const [qty, setQty] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  if (!produto) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <div className="text-lg font-medium text-slate-700">Produto não encontrado</div>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">← Voltar à vitrine</button>
      </div>
    );
  }

  const badge = statusBadge(produto);
  const related = produtos.filter((p) => p.naVitrine && p.categoria === produto.categoria && p.id !== produto.id).slice(0, 4);

  const handleAddToCart = () => {
    addItem(produto, qty);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
          <button onClick={onBack} className="hover:text-blue-600 transition-colors">Produtos</button>
          <span>›</span>
          <span className="text-slate-500">{produto.categoria}</span>
          <span>›</span>
          <span className="text-slate-700 font-medium truncate max-w-[200px]">{produto.nome}</span>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100">
              <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
            </div>
            {/* Thumbnails (same image, different crop for demo) */}
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${i === 0 ? 'border-blue-500' : 'border-slate-200 hover:border-blue-300'}`}>
                  <img src={produto.imagem} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {/* Category + brand */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">{produto.categoria}</span>
              <span className="text-sm text-slate-400">{produto.marca}</span>
              <span className="text-slate-200">·</span>
              <span className="text-xs font-mono text-slate-400">{produto.sku}</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">{produto.nome}</h1>

            {/* Rating (static demo) */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-amber-400 text-sm">{'★★★★☆'}</div>
              <span className="text-sm text-slate-500">4.2 (47 avaliações)</span>
            </div>

            {/* Price */}
            <div className="p-4 bg-slate-50 rounded-2xl mb-6">
              <div className="text-4xl font-bold text-slate-900 mb-1">
                R${produto.preco.toFixed(2).replace('.', ',')}
              </div>
              <div className="text-sm text-slate-500">
                em até <strong>10x</strong> de R${(produto.preco / 10).toFixed(2).replace('.', ',')} sem juros
              </div>
              <div className="text-sm text-emerald-600 font-medium mt-1">
                💳 5% de desconto no PIX: R${(produto.preco * 0.95).toFixed(2).replace('.', ',')}
              </div>
            </div>

            {/* Stock status */}
            <span className={`text-sm font-semibold px-3 py-1.5 rounded-full w-fit mb-6 ${badge.cls}`}>
              {badge.label}
            </span>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Descrição</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{produto.descricao}</p>
            </div>

            {/* Fornecedor */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-6 text-sm">
              <span className="text-slate-500">🏭</span>
              <span className="text-slate-600">Fornecedor: <strong className="text-slate-800">{produto.fornecedor}</strong></span>
            </div>

            {/* Quantity + Add to cart */}
            {produto.estoque > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-10 h-12 flex items-center justify-center text-slate-500 hover:bg-slate-50 text-lg font-bold transition-colors"
                    >
                      −
                    </button>
                    <span className="w-12 h-12 flex items-center justify-center text-base font-semibold text-slate-800 border-x border-slate-200">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(Math.min(produto.estoque, qty + 1))}
                      className="w-10 h-12 flex items-center justify-center text-slate-500 hover:bg-slate-50 text-lg font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-slate-400">{produto.estoque} disponíveis</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 font-semibold rounded-xl transition-all text-sm ${
                      addedFeedback
                        ? 'bg-emerald-500 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {addedFeedback ? '✓ Adicionado ao carrinho!' : 'Adicionar ao carrinho'}
                  </button>
                  <button
                    onClick={() => {
                      addItem(produto, qty);
                      onCheckout();
                    }}
                    className="px-6 py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-sm"
                  >
                    Comprar Agora
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-4 px-5 bg-red-50 border border-red-100 rounded-xl text-center">
                <div className="text-red-600 font-semibold mb-1">Produto Esgotado</div>
                <div className="text-red-500 text-sm">Este produto está temporariamente indisponível.</div>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Produtos relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onViewProduto(p.id)}
                  className="bg-white rounded-xl border border-slate-100 hover:shadow-md transition-shadow text-left overflow-hidden group"
                >
                  <div className="h-32 overflow-hidden bg-slate-100">
                    <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-semibold text-slate-700 leading-snug mb-1 line-clamp-2">{p.nome}</div>
                    <div className="text-sm font-bold text-blue-600">R${p.preco.toFixed(2).replace('.', ',')}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
