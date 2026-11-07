import { useState } from 'react';
import { useProdutos } from '../context/ProdutosContext';

export default function Alertas() {
  const { produtos, atualizarEstoque } = useProdutos();
  const [filter, setFilter] = useState<'todos' | 'zerado' | 'baixo'>('todos');
  const [reposicao, setReposicao] = useState<Record<number, string>>({});
  const [repondo, setRepondo] = useState<number | null>(null);

  const alertas = produtos.filter((p) => p.status !== 'ok');
  const filtered = filter === 'todos' ? alertas : alertas.filter((a) => a.status === filter);

  const handleRepor = async (id: number) => {
    const qtd = parseInt(reposicao[id] ?? '0', 10);
    if (!qtd || qtd <= 0) return;
    setRepondo(id);
    await new Promise((r) => setTimeout(r, 500));
    const produto = produtos.find((p) => p.id === id);
    if (produto) atualizarEstoque(id, produto.estoque + qtd);
    setReposicao((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setRepondo(null);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
          <div>
            <div className="text-2xl font-bold text-slate-800">{alertas.length}</div>
            <div className="text-sm text-slate-600">Exigem Ação</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
          <div>
            <div className="text-2xl font-bold text-red-600">{produtos.filter(p => p.status === 'zerado').length}</div>
            <div className="text-sm text-slate-600">Sem Estoque</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
          <div>
            <div className="text-2xl font-bold text-amber-600">{produtos.filter(p => p.status === 'baixo').length}</div>
            <div className="text-sm text-slate-600">Estoque Baixo</div>
          </div>
        </div>
      </div>

      {/* Alert table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <div className="text-sm font-semibold text-slate-800">⚠️ Alertas de Estoque</div>
            <div className="text-xs text-slate-400">{alertas.length} alertas ativos · Repor estoque diretamente</div>
          </div>
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            {(['todos', 'zerado', 'baixo'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {f === 'todos' ? 'Todos' : f === 'zerado' ? 'Zerado' : 'Baixo'}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-sm font-medium">Nenhum alerta ativo!</div>
            </div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                <span className={`w-3 h-3 rounded-full shrink-0 ${p.status === 'zerado' ? 'bg-red-500' : 'bg-amber-500'}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{p.nome}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${p.status === 'zerado' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                      {p.status === 'zerado' ? 'Zerado' : 'Baixo'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {p.sku} · Mín: {p.estoqueMinimo} un.
                    {p.status === 'baixo' && ` · Atual: ${p.estoque} un.`}
                    {p.status === 'zerado' && ` · Sem estoque`}
                  </div>
                </div>

                {/* Inline replenishment */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                    <span className="px-2 py-1.5 text-xs text-slate-400 bg-slate-50 border-r border-slate-200 select-none">Qtd</span>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      placeholder="0"
                      value={reposicao[p.id] ?? ''}
                      onChange={(e) => setReposicao((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      className="w-16 px-2 py-1.5 text-sm text-center outline-none text-slate-800 font-semibold"
                    />
                  </div>
                  <button
                    onClick={() => handleRepor(p.id)}
                    disabled={!reposicao[p.id] || parseInt(reposicao[p.id]) <= 0 || repondo === p.id}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-w-[80px] text-center"
                  >
                    {repondo === p.id ? '...' : '+ Repor'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
