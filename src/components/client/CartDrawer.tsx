import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onCheckout: () => void;
}

export default function CartDrawer({ onCheckout }: Props) {
  const { user } = useAuth();
  const { items, isOpen, closeCart, removeItem, updateQty, total, count, clearCart, notice, clearNotice } = useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={closeCart} />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Carrinho</h2>
            <p className="text-xs text-slate-400">{count} {count === 1 ? 'item' : 'itens'}</p>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={clearCart} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                Limpar
              </button>
            )}
            <button
              onClick={closeCart}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {notice && <div role="alert" className="mx-6 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"><div className="flex items-start justify-between gap-2"><span>{notice}</span><button type="button" onClick={clearNotice} aria-label="Fechar aviso">✕</button></div></div>}

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Carrinho</div>
              <div className="text-slate-600 font-medium mb-1">Seu carrinho está vazio</div>
              <div className="text-slate-400 text-sm">Adicione produtos da vitrine para começar</div>
            </div>
          ) : (
            items.map(({ produto, quantidade }) => (
              <div key={produto.id} className="flex gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 leading-tight mb-0.5 truncate">{produto.nome}</div>
                  <div className="text-xs text-slate-400 mb-2">{produto.marca} · {produto.sku}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 border border-slate-200 rounded-lg">
                      <button
                        onClick={() => updateQty(produto.id, quantidade - 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-l-lg text-sm font-bold transition-colors"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold text-slate-800 w-6 text-center">{quantidade}</span>
                      <button
                        onClick={() => updateQty(produto.id, quantidade + 1)}
                        disabled={quantidade >= produto.estoque}
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-r-lg text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      R${(produto.preco * quantidade).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(produto.id)}
                  className="self-start text-slate-300 hover:text-red-500 transition-colors text-xs mt-1"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-slate-200 bg-slate-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold">R${total.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Frete</span>
                <span className="text-emerald-600 font-semibold">Grátis</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>R${total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
            <button
              onClick={() => { closeCart(); onCheckout(); }}
              className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-sm"
            >
              {user ? 'Finalizar Pedido →' : 'Entrar para finalizar →'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
