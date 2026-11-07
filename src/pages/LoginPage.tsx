import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const HERO_IMG = 'https://images.unsplash.com/photo-1506316940527-4d1c138978a0?w=900&h=1200&fit=crop&auto=format&q=80';

export default function LoginPage({ onBack }: { onBack: () => void }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupRole, setSignupRole] = useState<'customer' | 'admin'>('customer');
  const [adminCode, setAdminCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(loginEmail, loginPass);
    setLoading(false);
    if (!res.ok) setError(res.error ?? 'Erro ao fazer login.');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (signupPass !== signupConfirm) { setError('As senhas não conferem.'); return; }
    if (signupPass.length < 6) { setError('Senha deve ter ao menos 6 caracteres.'); return; }
    setLoading(true);
    const res = await signup(signupName, signupEmail, signupPass, signupRole, adminCode);
    setLoading(false);
    if (!res.ok) setError(res.error ?? 'Erro ao criar conta.');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={HERO_IMG} alt="Mountain bike" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-blue-900/40" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}slm-logo.png`} alt="SLM Bikes & Parts" className="w-14 h-14 object-contain" />
            <div>
              <div className="text-white text-xl font-bold">SLM Bikes & Parts</div>
              <div className="text-slate-300 text-xs tracking-widest uppercase">Acesso ao sistema</div>
            </div>
          </div>
          {/* Tagline */}
          <div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-4">
              Sua loja de<br />bikes completa
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              Peças, acessórios e serviços de qualidade<br />para todos os estilos de pedal.
            </p>
            <div className="flex gap-6">
              {[['500+', 'Produtos'], ['10+', 'Marcas'], ['2.000+', 'Clientes']].map(([n, l]) => (
                <div key={l}>
                  <div className="text-2xl font-bold text-white">{n}</div>
                  <div className="text-slate-400 text-sm">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
          >
            ← Voltar para a loja
          </button>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src={`${import.meta.env.BASE_URL}slm-logo.png`} alt="SLM Bikes & Parts" className="w-10 h-10 object-contain" />
            <span className="text-lg font-bold text-slate-800">SLM Bikes & Parts</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Criar Conta
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Bem-vindo de volta!</h2>
                <p className="text-slate-500 text-sm mt-1">Entre com sua conta para continuar.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
                  <input
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all text-sm"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-xs text-slate-400 bg-white px-2">contas de demonstração</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => { setLoginEmail('admin@cycleparts.com'); setLoginPass('admin123'); }}
                  className="p-3 border border-slate-200 rounded-xl text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="font-semibold text-slate-800 mb-0.5">👨‍💼 Admin</div>
                  <div className="text-slate-400">admin@cycleparts.com</div>
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginEmail('joao@email.com'); setLoginPass('123456'); }}
                  className="p-3 border border-slate-200 rounded-xl text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="font-semibold text-slate-800 mb-0.5">👤 Cliente</div>
                  <div className="text-slate-400">joao@email.com</div>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Crie sua conta</h2>
                <p className="text-slate-500 text-sm mt-1">Preencha seus dados para se cadastrar.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
                    <input
                      type="password"
                      required
                      value={signupPass}
                      onChange={(e) => setSignupPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar</label>
                    <input
                      type="password"
                      required
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de conta</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['customer', 'admin'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSignupRole(r)}
                        className={`p-3 rounded-xl border text-left text-sm transition-all ${signupRole === r ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        <div className="font-semibold mb-0.5">{r === 'customer' ? '👤 Cliente' : '👨‍💼 Administrador'}</div>
                        <div className={`text-xs ${signupRole === r ? 'text-blue-500' : 'text-slate-400'}`}>
                          {r === 'customer' ? 'Compra produtos e serviços' : 'Gerencia o sistema'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {signupRole === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Código de Administrador</label>
                    <input
                      type="text"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      placeholder="Código fornecido pelo gestor"
                      className="w-full px-4 py-3 border border-amber-200 bg-amber-50 rounded-xl text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
                    />
                    <p className="text-xs text-amber-600 mt-1">⚠️ Código de demo: ADMIN2026</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all text-sm"
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
