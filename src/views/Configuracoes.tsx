import { useEffect, useState, type FormEvent } from 'react';
import { fieldClass } from '../components/AdminModal';

export interface ConfiguracoesData {
  nomeLoja: string;
  email: string;
  telefone: string;
  endereco: string;
  moeda: string;
  fusoHorario: string;
  estoqueMinimoPadrao: number;
  permitirVendaSemEstoque: boolean;
  mostrarProdutosSemEstoque: boolean;
  alertaEstoque: boolean;
  resumoDiario: boolean;
  novaVenda: boolean;
  novoAgendamento: boolean;
  autenticacaoDoisFatores: boolean;
  tempoSessao: string;
}

export const configuracoesIniciais: ConfiguracoesData = {
  nomeLoja: 'SLM Bikes & Parts',
  email: 'contato@cycleparts.com',
  telefone: '(11) 3456-7890',
  endereco: 'Av. Paulista, 1234 – São Paulo, SP',
  moeda: 'BRL',
  fusoHorario: 'America/Sao_Paulo',
  estoqueMinimoPadrao: 5,
  permitirVendaSemEstoque: false,
  mostrarProdutosSemEstoque: true,
  alertaEstoque: true,
  resumoDiario: true,
  novaVenda: true,
  novoAgendamento: true,
  autenticacaoDoisFatores: false,
  tempoSessao: '8',
};

interface Props {
  configuracoes: ConfiguracoesData;
  onSave: (configuracoes: ConfiguracoesData) => void;
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}

function SettingSwitch({ checked, onChange, label, description }: SwitchProps) {
  return (
    <div className="flex items-center justify-between gap-6 py-3.5">
      <div>
        <div className="text-sm font-semibold text-slate-700">{label}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-slate-400">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
      >
        <span
          className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function SectionHeader({ code, title, description }: { code: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
        {code}
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}

export default function Configuracoes({ configuracoes, onSave }: Props) {
  const [draft, setDraft] = useState(configuracoes);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(configuracoes);
  }, [configuracoes]);

  const update = <K extends keyof ConfiguracoesData>(key: K, value: ConfiguracoesData[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(draft);
    setSaved(true);
  };

  const reset = () => {
    setDraft(configuracoesIniciais);
    setSaved(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Preferências do sistema</h2>
          <p className="mt-1 text-sm text-slate-400">Personalize a operação da loja e os avisos da equipe.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span role="status" className="mr-2 text-xs font-semibold text-emerald-600">
              Alterações salvas
            </span>
          )}
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Restaurar padrão
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Salvar alterações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <SectionHeader code="LO" title="Dados da loja" description="Informações exibidas em documentos e canais de contato." />
          <div className="grid grid-cols-2 gap-4 p-5">
            <label className="col-span-2 text-xs font-semibold text-slate-600">
              Nome da loja
              <input
                required
                value={draft.nomeLoja}
                onChange={(event) => update('nomeLoja', event.target.value)}
                className={`${fieldClass} mt-1.5`}
              />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              E-mail comercial
              <input
                required
                type="email"
                value={draft.email}
                onChange={(event) => update('email', event.target.value)}
                className={`${fieldClass} mt-1.5`}
              />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Telefone
              <input
                required
                value={draft.telefone}
                onChange={(event) => update('telefone', event.target.value)}
                className={`${fieldClass} mt-1.5`}
              />
            </label>
            <label className="col-span-2 text-xs font-semibold text-slate-600">
              Endereço
              <input
                required
                value={draft.endereco}
                onChange={(event) => update('endereco', event.target.value)}
                className={`${fieldClass} mt-1.5`}
              />
            </label>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <SectionHeader code="OP" title="Operação e estoque" description="Regras padrão usadas na rotina comercial." />
          <div className="p-5">
            <div className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-4">
              <label className="text-xs font-semibold text-slate-600">
                Moeda
                <select
                  value={draft.moeda}
                  onChange={(event) => update('moeda', event.target.value)}
                  className={`${fieldClass} mt-1.5 bg-white`}
                >
                  <option value="BRL">Real (BRL)</option>
                  <option value="USD">Dólar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </label>
              <label className="col-span-2 text-xs font-semibold text-slate-600">
                Fuso horário
                <select
                  value={draft.fusoHorario}
                  onChange={(event) => update('fusoHorario', event.target.value)}
                  className={`${fieldClass} mt-1.5 bg-white`}
                >
                  <option value="America/Sao_Paulo">Brasília (UTC-3)</option>
                  <option value="America/Manaus">Manaus (UTC-4)</option>
                  <option value="America/Rio_Branco">Rio Branco (UTC-5)</option>
                </select>
              </label>
              <label className="col-span-3 text-xs font-semibold text-slate-600">
                Estoque mínimo padrão
                <input
                  type="number"
                  min="0"
                  value={draft.estoqueMinimoPadrao}
                  onChange={(event) => update('estoqueMinimoPadrao', Number(event.target.value))}
                  className={`${fieldClass} mt-1.5`}
                />
              </label>
            </div>
            <SettingSwitch
              checked={draft.permitirVendaSemEstoque}
              onChange={(value) => update('permitirVendaSemEstoque', value)}
              label="Permitir venda sem estoque"
              description="Autoriza pedidos mesmo quando a quantidade disponível for zero."
            />
            <div className="border-t border-slate-100">
              <SettingSwitch
                checked={draft.mostrarProdutosSemEstoque}
                onChange={(value) => update('mostrarProdutosSemEstoque', value)}
                label="Mostrar itens indisponíveis"
                description="Mantém produtos sem estoque visíveis na vitrine do cliente."
              />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <SectionHeader code="NO" title="Notificações" description="Escolha quais eventos geram avisos no painel." />
          <div className="divide-y divide-slate-100 px-5">
            <SettingSwitch
              checked={draft.alertaEstoque}
              onChange={(value) => update('alertaEstoque', value)}
              label="Alertas de estoque baixo"
              description="Avise quando um produto ficar abaixo da quantidade mínima."
            />
            <SettingSwitch
              checked={draft.novaVenda}
              onChange={(value) => update('novaVenda', value)}
              label="Novas vendas"
              description="Receba uma notificação sempre que uma venda for registrada."
            />
            <SettingSwitch
              checked={draft.novoAgendamento}
              onChange={(value) => update('novoAgendamento', value)}
              label="Novos agendamentos"
              description="Avise a equipe sobre novas solicitações de manutenção."
            />
            <SettingSwitch
              checked={draft.resumoDiario}
              onChange={(value) => update('resumoDiario', value)}
              label="Resumo diário"
              description="Consolide vendas, estoque e agenda ao final do dia."
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <SectionHeader code="SE" title="Segurança e acesso" description="Controle a proteção e duração das sessões administrativas." />
          <div className="p-5">
            <label className="block border-b border-slate-100 pb-4 text-xs font-semibold text-slate-600">
              Encerrar sessão após
              <select
                value={draft.tempoSessao}
                onChange={(event) => update('tempoSessao', event.target.value)}
                className={`${fieldClass} mt-1.5 bg-white`}
              >
                <option value="1">1 hora de inatividade</option>
                <option value="4">4 horas de inatividade</option>
                <option value="8">8 horas de inatividade</option>
                <option value="24">24 horas de inatividade</option>
              </select>
            </label>
            <SettingSwitch
              checked={draft.autenticacaoDoisFatores}
              onChange={(value) => update('autenticacaoDoisFatores', value)}
              label="Autenticação em duas etapas"
              description="Exige uma segunda verificação ao entrar em uma conta administrativa."
            />
            <div className="mt-1 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
              Contas administrativas usam permissões elevadas. Revise periodicamente os acessos da equipe.
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
