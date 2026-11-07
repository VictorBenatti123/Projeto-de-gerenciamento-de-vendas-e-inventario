import { useState, useRef, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProdutosProvider, useProdutos } from './context/ProdutosContext';
import { ManutencoesProvider } from './context/ManutencoesContext';
import { PedidosProvider } from './context/PedidosContext';
import LoginPage from './pages/LoginPage';
import ClientNav from './components/client/ClientNav';
import CartDrawer from './components/client/CartDrawer';
import Vitrine from './views/client/Vitrine';
import ProdutoDetalhe from './views/client/ProdutoDetalhe';
import Checkout from './views/client/Checkout';
import PedidoConcluido from './views/client/PedidoConcluido';
import Manutencao from './views/client/Manutencao';
import Contato from './views/client/Contato';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Estoque from './views/Estoque';
import Produtos from './views/Produtos';
import Vendas from './views/Vendas';
import Clientes from './views/Clientes';
import Manutencoes from './views/Manutencoes';
import Agenda from './views/Agenda';
import Alertas from './views/Alertas';
import Relatorios from './views/Relatorios';
import Configuracoes, { configuracoesIniciais, type ConfiguracoesData } from './views/Configuracoes';
import type { ViewId } from './data';

// ─── Client types ─────────────────────────────────────────────────────────────
type ClientPage = 'vitrine' | 'produto' | 'checkout' | 'concluido' | 'manutencao' | 'contato';

// ─── Admin helpers ─────────────────────────────────────────────────────────────
const viewTitles: Partial<Record<ViewId, string>> = {
  dashboard: 'Dashboard', estoque: 'Estoque', produtos: 'Produtos',
  vendas: 'Vendas', clientes: 'Clientes',
  manutencoes: 'Manutenções', agenda: 'Agenda', alertas: 'Alertas',
  relatorios: 'Relatórios', configuracoes: 'Configurações',
};

function Placeholder({ title }: { title: string }) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-16 text-center">
        <div className="text-4xl mb-4">🚧</div>
        <div className="text-lg font-semibold text-slate-700 mb-1">{title}</div>
        <div className="text-sm text-slate-400">Esta seção estará disponível em breve.</div>
      </div>
    </div>
  );
}

// ─── Notification Bell ────────────────────────────────────────────────────────
function NotificationBell({ onNavigate }: { onNavigate: (v: ViewId) => void }) {
  const { produtos, alertasCount } = useProdutos();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const semEstoque = produtos.filter((p) => p.status === 'zerado');
  const estoqueBaixo = produtos.filter((p) => p.status === 'baixo');

  const notifications = [
    ...semEstoque.map((p) => ({
      id: `z${p.id}`, icon: '🔴', title: `Sem estoque: ${p.nome}`,
      sub: `${p.sku} · 0 unidades`, view: 'alertas' as ViewId,
    })),
    ...estoqueBaixo.map((p) => ({
      id: `b${p.id}`, icon: '🟡', title: `Estoque baixo: ${p.nome}`,
      sub: `${p.sku} · ${p.estoque} un. (mín: ${p.estoqueMinimo})`, view: 'alertas' as ViewId,
    })),
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
      >
        🔔
        {alertasCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {alertasCount > 9 ? '9+' : alertasCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="text-sm font-bold text-slate-800">Notificações</div>
            {alertasCount > 0 && (
              <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                {alertasCount} alertas
              </span>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-sm">Nenhuma notificação</div>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { setOpen(false); onNavigate(n.view); }}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                >
                  <span className="text-base shrink-0 mt-0.5">{n.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 leading-snug">{n.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{n.sub}</div>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="px-4 py-2.5 border-t border-slate-100">
            <button
              onClick={() => { setOpen(false); onNavigate('alertas'); }}
              className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Ver todos os alertas →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin Search ─────────────────────────────────────────────────────────────
function AdminSearch({ onNavigate }: { onNavigate: (v: ViewId) => void }) {
  const { produtos } = useProdutos();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = search.toLowerCase().trim();
  const matchedProdutos = q
    ? produtos.filter((p) =>
        p.nome.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const hasResults = matchedProdutos.length > 0;

  return (
    <div className="flex-1 relative max-w-sm" ref={ref}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs z-10">🔍</span>
      <input
        ref={inputRef}
        value={search}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => { if (search) setOpen(true); }}
        placeholder="Buscar produto, SKU, categoria..."
        className="w-full pl-8 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 transition-all bg-slate-50"
      />
      {open && q && (
        <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          {hasResults ? (
            <>
              <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Produtos</div>
              {matchedProdutos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setOpen(false); setSearch(''); onNavigate('produtos'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-100 shrink-0">
                    <img src={p.imagem} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{p.nome}</div>
                    <div className="text-xs text-slate-400">{p.sku} · {p.categoria}</div>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 shrink-0">
                    R${p.preco.toFixed(2).replace('.', ',')}
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-slate-400">Nenhum resultado para "{search}"</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Admin Header ─────────────────────────────────────────────────────────────
function AdminHeader({ activeView, onNavigate }: { activeView: ViewId; onNavigate: (v: ViewId) => void }) {
  const { user, logout } = useAuth();
  const [userOpen, setUserOpen] = useState(false);

  return (
    <header className="h-14 flex items-center gap-4 px-6 bg-white border-b border-slate-200 shrink-0">
      <h1 className="text-lg font-bold text-slate-800 w-40 shrink-0">{viewTitles[activeView] ?? 'Admin'}</h1>
      <AdminSearch onNavigate={onNavigate} />
      <div className="flex-1" />
      <NotificationBell onNavigate={onNavigate} />
      {/* User */}
      <div className="relative">
        <button onClick={() => setUserOpen((o) => !o)} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">{user?.name.charAt(0)}</div>
          <span className="text-xs text-slate-400">▾</span>
        </button>
        {userOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setUserOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-40 py-1 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="text-sm font-semibold text-slate-800">{user?.name}</div>
                <div className="text-xs text-slate-400">{user?.email}</div>
              </div>
              <button onClick={() => { setUserOpen(false); logout(); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                🚪 Sair
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function renderAdminView(
  view: ViewId,
  onNavigate: (view: ViewId) => void,
  configuracoes: ConfiguracoesData,
  onSaveConfiguracoes: (configuracoes: ConfiguracoesData) => void
) {
  switch (view) {
    case 'dashboard': return <Dashboard onNavigate={onNavigate} />;
    case 'estoque': return <Estoque />;
    case 'produtos': return <Produtos />;
    case 'vendas': return <Vendas />;
    case 'clientes': return <Clientes />;
    case 'manutencoes': return <Manutencoes />;
    case 'agenda': return <Agenda />;
    case 'alertas': return <Alertas />;
    case 'relatorios': return <Relatorios />;
    case 'configuracoes':
      return <Configuracoes configuracoes={configuracoes} onSave={onSaveConfiguracoes} />;
    default: return <Placeholder title={viewTitles[view] ?? String(view)} />;
  }
}

// ─── Admin App ────────────────────────────────────────────────────────────────
function AdminApp() {
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [configuracoes, setConfiguracoes] = useState(configuracoesIniciais);
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader activeView={activeView} onNavigate={setActiveView} />
        <main className="flex-1 overflow-y-auto">
          {renderAdminView(activeView, setActiveView, configuracoes, setConfiguracoes)}
        </main>
      </div>
    </div>
  );
}

// ─── Client App ───────────────────────────────────────────────────────────────
function ClientApp({ onLogin }: { onLogin: () => void }) {
  const { user } = useAuth();
  const [page, setPage] = useState<ClientPage>('vitrine');
  const [produtoId, setProdutoId] = useState<number | null>(null);

  const goToProduto = (id: number) => { setProdutoId(id); setPage('produto'); };
  const goToCheckout = () => {
    if (!user) {
      onLogin();
      return;
    }
    setPage('checkout');
  };
  const goToVitrine = () => { setPage('vitrine'); setProdutoId(null); };

  return (
    <div className="min-h-screen bg-slate-50">
      <ClientNav
        currentPage={(page === 'produto' || page === 'concluido' ? 'vitrine' : page) as 'vitrine' | 'checkout' | 'manutencao' | 'contato'}
        onNavigate={(p) => { setPage(p as ClientPage); setProdutoId(null); }}
        onLogin={onLogin}
      />
      <CartDrawer onCheckout={goToCheckout} />
      <main>
        {page === 'vitrine' && <Vitrine onViewProduto={goToProduto} onSchedule={() => setPage('manutencao')} />}
        {page === 'produto' && produtoId !== null && (
          <ProdutoDetalhe
            produtoId={produtoId}
            onBack={goToVitrine}
            onViewProduto={goToProduto}
            onCheckout={goToCheckout}
          />
        )}
        {page === 'checkout' && <Checkout onBack={goToVitrine} onSuccess={() => setPage('concluido')} />}
        {page === 'concluido' && <PedidoConcluido onContinue={goToVitrine} />}
        {page === 'manutencao' && <Manutencao />}
        {page === 'contato' && <Contato />}
      </main>

      {page !== 'checkout' && (
        <footer className="bg-[#12151f] text-slate-400 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <img src={`${import.meta.env.BASE_URL}slm-logo.png`} alt="SLM Bikes & Parts" className="w-9 h-9 object-contain" />
                  <span className="text-white font-bold">SLM Bikes & Parts</span>
                </div>
                <p className="text-sm leading-relaxed">Bicicletas, peças, acessórios e oficina especializada em Guarulhos.</p>
              </div>
              <div>
                <div className="text-white font-semibold text-sm mb-3">Navegação</div>
                <div className="space-y-2 text-sm">
                  {[['vitrine', 'Produtos'], ['manutencao', 'Manutenção'], ['contato', 'Contato']].map(([p, l]) => (
                    <button key={p} onClick={() => setPage(p as ClientPage)} className="block hover:text-white transition-colors">{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-white font-semibold text-sm mb-3">Contato</div>
                <div className="space-y-2 text-sm">
                  <div>R. Cabo Antônio Pereira da Silva, 879 — Jardim Tranquilidade, Guarulhos/SP</div>
                  <div><a href="tel:+551124254197" className="hover:text-white">(11) 2425-4197</a></div>
                  <div><a href="mailto:slmbikes@gmail.com.br" className="hover:text-white">slmbikes@gmail.com.br</a></div>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 text-xs text-center">
              © 2026 SLM Bikes & Parts. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function AppContent() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (user) setShowLogin(false);
  }, [user]);

  if (user?.role === 'admin') return <AdminApp />;
  if (!user && showLogin) return <LoginPage onBack={() => setShowLogin(false)} />;
  return <ClientApp onLogin={() => setShowLogin(true)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <ProdutosProvider>
        <PedidosProvider>
          <ManutencoesProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </ManutencoesProvider>
        </PedidosProvider>
      </ProdutosProvider>
    </AuthProvider>
  );
}
