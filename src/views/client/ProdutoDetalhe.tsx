import { useEffect, useState, type FormEvent } from 'react';
import type { Produto } from '../../data';
import { useCart } from '../../context/CartContext';
import { useProdutos } from '../../context/ProdutosContext';
import { usePersistentState } from '../../utils/storage';

interface ProductReview {
  id: string;
  produtoId: number;
  nome: string;
  nota: number;
  comentario: string;
  createdAt: string;
}

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
  const { addItem, beginBuyNow, permiteSemEstoque } = useCart();
  const { produtos } = useProdutos();
  const [reviews, setReviews] = usePersistentState<ProductReview[]>('slm.avaliacoes.v1', []);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [buyNowError, setBuyNowError] = useState('');
  const produto = produtos.find((p) => p.id === produtoId);
  const [qty, setQty] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => setSelectedImage(0), [produtoId]);

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
  const gallery = Array.from(new Set([produto.imagem, ...(produto.galeria ?? [])].filter(Boolean)));
  const productReviews = reviews.filter((review) => review.produtoId === produto.id);
  const averageRating = productReviews.length
    ? productReviews.reduce((sum, review) => sum + review.nota, 0) / productReviews.length
    : 0;
  const related = produtos.filter((p) => p.naVitrine && p.categoria === produto.categoria && p.id !== produto.id).slice(0, 4);

  const handleAddToCart = () => {
    const added = addItem(produto, qty);
    setAddedFeedback(added);
    if (added) setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleBuyNow = () => {
    if (!beginBuyNow(produto, qty)) {
      setBuyNowError('Não foi possível iniciar a compra. Verifique a disponibilidade em estoque.');
      return;
    }
    setBuyNowError('');
    onCheckout();
  };

  const handleReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const comentario = reviewComment.trim();
    if (!comentario) return;
    setReviews((current) => [{
      id: produto.id + '-' + Date.now(),
      produtoId: produto.id,
      nome: reviewName.trim() || 'Cliente',
      nota: reviewRating,
      comentario,
      createdAt: new Date().toISOString(),
    }, ...current]);
    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
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
              <img src={gallery[selectedImage] ?? produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((image, index) => (
                  <button key={image} type="button" onClick={() => setSelectedImage(index)} aria-label={'Ver imagem ' + (index + 1)}
                    className={'aspect-square overflow-hidden rounded-xl border-2 ' + (selectedImage === index ? 'border-blue-600' : 'border-transparent')}>
                    <img src={image} alt={produto.nome + ' - imagem ' + (index + 1)} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
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

            <h1 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">{produto.nome}</h1>
            <div className="mb-5 flex items-center gap-2 text-sm">
              {productReviews.length > 0 ? (
                <>
                  <span className="font-semibold text-amber-500">{'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}</span>
                  <span className="font-semibold text-slate-700">{averageRating.toFixed(1).replace('.', ',')}</span>
                  <span className="text-slate-400">({productReviews.length} avaliações)</span>
                </>
              ) : <span className="text-slate-400">Ainda sem avaliações</span>}
            </div>

             {/* Price */}
            <div className="p-4 bg-slate-50 rounded-2xl mb-6">
              <div className="text-4xl font-bold text-slate-900 mb-1">
                R${produto.preco.toFixed(2).replace('.', ',')}
              </div>
              <div className="text-sm text-slate-500">
                Consulte as opções de parcelamento no checkout. A cobrança ainda não está integrada.
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
            {produto.estoque > 0 || permiteSemEstoque ? (
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
                      onClick={() => setQty(qty + 1)}
                      disabled={!permiteSemEstoque && qty >= produto.estoque}
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
                    onClick={handleBuyNow}
                    className="px-6 py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-sm"
                  >
                    Comprar Agora
                  </button>
                </div>
                {buyNowError && <p role="alert" className="text-sm text-red-600">{buyNowError}</p>}
              </div>
            ) : (
              <div className="py-4 px-5 bg-red-50 border border-red-100 rounded-xl text-center">
                <div className="text-red-600 font-semibold mb-1">Produto Esgotado</div>
                <div className="text-red-500 text-sm">Este produto está temporariamente indisponível.</div>
              </div>
            )}
          </div>
        </div>

        <section className="mt-16 border-t border-slate-200 pt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Avaliações dos clientes</h2>
              <p className="mt-1 text-sm text-slate-500">As avaliações ficam salvas neste navegador; não são sincronizadas com outros dispositivos.</p>
            </div>
            {productReviews.length > 0 && <div className="text-sm font-semibold text-slate-700">{averageRating.toFixed(1).replace('.', ',')} / 5 · {productReviews.length} avaliação(ões)</div>}
          </div>
          <form onSubmit={handleReviewSubmit} className="mb-8 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 font-semibold text-slate-900">Deixe sua avaliação</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Seu nome (opcional)
                <input value={reviewName} onChange={(event) => setReviewName(event.target.value)} maxLength={60} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="Como deseja aparecer" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Nota
                <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                  {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} estrela(s)</option>)}
                </select>
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Comentário
              <textarea required value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} maxLength={1000} rows={3} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="Conte como foi sua experiência com o produto..." />
            </label>
            <button type="submit" className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Publicar avaliação</button>
          </form>
          {productReviews.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Este produto ainda não recebeu avaliações.</p>
          ) : (
            <div className="space-y-3">
              {productReviews.map((review) => (
                <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800">{review.nome}</span>
                    <time className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</time>
                  </div>
                  <div className="my-2 text-amber-500">{'★'.repeat(review.nota)}{'☆'.repeat(5 - review.nota)}</div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{review.comentario}</p>
                </article>
              ))}
            </div>
          )}
        </section>

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
