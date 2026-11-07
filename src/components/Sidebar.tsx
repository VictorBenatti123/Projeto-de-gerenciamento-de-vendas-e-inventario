import type { ViewId } from '../data';
import { useProdutos } from '../context/ProdutosContext';

interface NavItem {
  id: ViewId;
  label: string;
  icon: string;
  badge?: { text: string; color: 'red' | 'blue' };
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface Props {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

export default function Sidebar({ activeView, onNavigate }: Props) {
  const { estoqueBaixo, alertasCount } = useProdutos();

  const sections: NavSection[] = [
    {
      label: 'VISÃO GERAL',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '' },
        { id: 'estoque', label: 'Estoque', icon: '', badge: estoqueBaixo > 0 ? { text: `${estoqueBaixo} baixos`, color: 'red' } : undefined },
        { id: 'produtos', label: 'Produtos', icon: '' },
      ],
    },
    {
      label: 'COMERCIAL',
      items: [
        { id: 'vendas', label: 'Vendas', icon: '', badge: { text: '12 hoje', color: 'blue' } },
        { id: 'clientes', label: 'Clientes', icon: '' },
      ],
    },
    {
      label: 'SERVIÇOS',
      items: [
        { id: 'manutencoes', label: 'Manutenções', icon: '', badge: { text: '8 hoje', color: 'blue' } },
        { id: 'agenda', label: 'Agenda', icon: '' },
        { id: 'alertas', label: 'Alertas', icon: '', badge: alertasCount > 0 ? { text: String(alertasCount), color: 'red' } : undefined },
      ],
    },
    {
      label: 'SISTEMA',
      items: [
        { id: 'relatorios', label: 'Relatórios', icon: '' },
        { id: 'configuracoes', label: 'Configurações', icon: '' },
      ],
    },
  ];

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col overflow-y-auto bg-[#12151f]">
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/5">
        <img src={`${import.meta.env.BASE_URL}slm-logo.png`} alt="SLM Bikes & Parts" className="h-10 w-10 object-contain shrink-0" />
        <div className="min-w-0">
          <div className="text-white text-[12px] font-bold leading-tight">SLM Bikes & Parts</div>
          <div className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Administração</div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-2">
        {sections.map((section) => (
          <div key={section.label} className="mb-4">
            <div className="px-2 py-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1">
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md mb-0.5 text-left transition-all duration-150 ${
                    active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
                  <span className="text-[13px] font-medium flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                      active ? 'bg-white/20 text-white' : item.badge.color === 'red' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {item.badge.text}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">A</div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-300 text-[12px] font-medium truncate">Admin</div>
            <div className="text-slate-600 text-[10px] truncate">slmbikes@gmail.com.br</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
