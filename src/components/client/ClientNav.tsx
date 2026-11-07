import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { usePedidos } from '../../context/PedidosContext';
import AdminModal from '../AdminModal';

type NavPage = 'vitrine' | 'checkout' | 'manutencao' | 'contato';

interface Props {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  onLogin: () => void;
}

export default function ClientNav({ currentPage, onNavigate, onLogin }: Props) {
  const { user, logout } = useAuth();
  const { count, openCart } = useCart();
  const { pedidos } = usePedidos();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [accountPanel, setAccountPanel] = useState<'account' | 'orders' | null>(null);

  const navLinks: { page: NavPage; label: string }[] = [
    { page: 'vitrine', label: 'Produtos' },
    { page: 'manutencao', label: 'Manutenção' },
    { page: 'contato', label: 'Contato' },
  ];
  const meusPedidos = pedidos.filter((pedido) => pedido.clienteId === user?.id);
  const statusLabels = {
    pago: 'Pago',
    enviado: 'Enviado',
    processando: 'Processando',
    cancelado: 'Cancelado',
  };
  const statusStyles = {
    pago: 'bg-emerald-50 text-emerald-700',
    enviado: 'bg-blue-50 text-blue-700',
    processando: 'bg-amber-50 text-amber-700',
    cancelado: 'bg-red-50 text-red-700',
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('vitrine')}
            className="flex items-center gap-2.5 shrink-0"
          >
            <img src={`${import.meta.env.BASE_URL}slm-logo.png`} alt="SLM Bikes & Parts" className="h-11 w-11 object-contain" />
            <div className="text-left">
              <span className="block text-slate-900 font-bold text-[15px] leading-tight">SLM Bikes & Parts</span>
              <span className="block text-slate-500 text-[10px] tracking-[0.16em] uppercase leading-tight">Peças • Acessórios • Oficina</span>
            </div>
          </button>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ page, label }) => (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-semibold" aria-hidden="true">▣</span>
              <span className="text-sm font-medium hidden sm:inline">Carrinho</span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden sm:inline max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-slate-400 text-xs">▾</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-slate-200 shadow-lg z-40 py-1 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </div>
                      <button onClick={() => { setUserMenuOpen(false); setAccountPanel('account'); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                        👤 Minha Conta
                      </button>
                      <button onClick={() => { setUserMenuOpen(false); setAccountPanel('orders'); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                        Meus Pedidos
                      </button>
                      <div className="border-t border-slate-100 mt-1" />
                      <button
                        onClick={() => { setUserMenuOpen(false); logout(); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        🚪 Sair
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>
      {user && accountPanel === 'account' && (
        <AdminModal title="Minha conta" subtitle="Dados do perfil conectado" onClose={() => setAccountPanel(null)}>
          <div className="p-6">
            <div className="mb-5 flex items-center gap-4 rounded-xl bg-blue-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">{user?.name.charAt(0)}</div>
              <div><div className="font-bold text-slate-800">{user?.name}</div><div className="text-sm text-slate-500">{user?.email}</div></div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-slate-400">Tipo de conta</span><span className="font-medium text-slate-700">Cliente</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-slate-400">Status</span><span className="font-medium text-emerald-600">Ativa</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Identificador</span><span className="font-mono text-xs text-slate-500">#{user?.id}</span></div>
            </div>
          </div>
        </AdminModal>
      )}
      {user && accountPanel === 'orders' && (
        <AdminModal title="Meus pedidos" subtitle="Acompanhe suas compras recentes" onClose={() => setAccountPanel(null)}>
          {meusPedidos.length === 0 ? (
            <div className="p-6 text-center">
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Pedidos</div>
              <div className="font-semibold text-slate-700">Nenhum pedido nesta sessão</div>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">Quando você finalizar uma compra, o pedido aparecerá aqui para acompanhamento.</p>
              <button onClick={() => { setAccountPanel(null); onNavigate('vitrine'); }} className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Explorar produtos</button>
            </div>
          ) : (
            <div className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto">
              {meusPedidos.map((pedido) => (
                <div key={pedido.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-800">Pedido #{pedido.id}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{pedido.data}</div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[pedido.status]}`}>
                      {statusLabels[pedido.status]}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1">
                    {pedido.itens.map((item) => (
                      <div key={item} className="truncate text-xs text-slate-500">{item}</div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-400">
                      {pedido.formaPagamento === 'cartao' && pedido.finalCartao
                        ? `Cartão final ${pedido.finalCartao}`
                        : pedido.formaPagamento?.toUpperCase()}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      R${pedido.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminModal>
      )}
    </nav>
  );
}
