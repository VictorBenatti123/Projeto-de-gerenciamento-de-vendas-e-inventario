import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useManutencoes } from '../../context/ManutencoesContext';
import { formatCardExpiry, formatCardNumber, formatCvv } from '../../utils/masks';

const HERO = 'https://images.unsplash.com/photo-1675798227643-da319f8ee8f7?w=1200&h=400&fit=crop&auto=format&q=80';

const servicos = [
  { id: 'revisao', label: 'Revisão Completa', desc: 'Checagem geral de todos os componentes', preco: 'R$120,00', valor: 120, icon: '🔧' },
  { id: 'freios', label: 'Regulagem de Freios', desc: 'Ajuste e substituição de pastilhas/cabos', preco: 'R$60,00', valor: 60, icon: '🛑' },
  { id: 'cambio', label: 'Troca de Câmbio', desc: 'Instalação e configuração de câmbio', preco: 'R$80,00', valor: 80, icon: '⚙️' },
  { id: 'pneus', label: 'Troca de Pneus', desc: 'Substituição de pneus e câmaras', preco: 'R$45,00', valor: 45, icon: '🔘' },
  { id: 'marchas', label: 'Regulagem de Marchas', desc: 'Ajuste fino da transmissão', preco: 'R$50,00', valor: 50, icon: '🔩' },
  { id: 'limpeza', label: 'Limpeza e Lubrificação', desc: 'Limpeza completa e lubrificação da transmissão', preco: 'R$40,00', valor: 40, icon: '✨' },
];

const statusStyles = {
  concluido: { label: 'Concluído', className: 'bg-emerald-50 text-emerald-700' },
  concluir: { label: 'Em andamento', className: 'bg-amber-50 text-amber-700' },
  iniciar: { label: 'Agendado', className: 'bg-blue-50 text-blue-700' },
};

export default function Manutencao() {
  const { user } = useAuth();
  const { agendamentos, adicionarAgendamento, removerAgendamento, horarioDisponivel, horariosDisponiveis } = useManutencoes();
  const [selectedServico, setSelectedServico] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');
  const [cardForm, setCardForm] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [installments, setInstallments] = useState('1');
  const updateCardField = (field: keyof typeof cardForm, formatter?: (value: string) => string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatter ? formatter(event.target.value) : event.target.value;
    setCardForm((current) => ({ ...current, [field]: value }));
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}`;
  const servicoSelecionado = servicos.find((item) => item.id === selectedServico);
  const horariosDisponiveisParaData = selectedDate && servicoSelecionado
    ? horariosDisponiveis(selectedDate, servicoSelecionado.label)
    : [];
  const dataSelecionada = selectedDate ? new Date(`${selectedDate}T12:00:00`) : null;
  const domingoSelecionado = dataSelecionada?.getDay() === 0;
  const meusAgendamentos = agendamentos.filter(
    (agendamento) => agendamento.origem === 'cliente' && (agendamento.clienteId ? agendamento.clienteId === user?.id : agendamento.cliente === user?.name)
  );

  const cancelarAgendamento = (id: number) => {
    if (window.confirm('Deseja cancelar este agendamento?')) removerAgendamento(id);
  };

  const handleContinueToPayment = () => {
    if (!selectedServico || !selectedDate || !selectedTime) {
      window.alert('Selecione um serviço, uma data e um horário antes de continuar.');
      return;
    }
    if (!horarioDisponivel(selectedDate, selectedTime, servicoSelecionado?.label ?? selectedServico)) {
      window.alert('Este horário acabou de ser reservado. Escolha outro horário.');
      setSelectedTime('');
      return;
    }
    setPaymentStep(true);
  };

  const confirmarPagamentoDemo = async () => {
    if (!servicoSelecionado || !selectedDate || !selectedTime) return;
    if (paymentMethod === 'cartao') {
      const numeroValido = /^\d{4} \d{4} \d{4} \d{4}$/.test(cardForm.number);
      const validadeValida = /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardForm.expiry);
      const cvvValido = /^\d{3,4}$/.test(cardForm.cvv);
      if (!cardForm.name.trim() || !numeroValido || !validadeValida || !cvvValido) {
        window.alert('Preencha corretamente o nome, número, validade e código de segurança do cartão.');
        return;
      }
    }
    if (!horarioDisponivel(selectedDate, selectedTime, servicoSelecionado.label)) {
      window.alert('Este horário não está mais disponível. Escolha outro.');
      setPaymentStep(false);
      setSelectedTime('');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const created = adicionarAgendamento({
      date: selectedDate,
      hora: selectedTime,
      cliente: user?.name ?? 'Cliente',
      servico: servicoSelecionado.label,
      bicicleta: bikeModel.trim() || 'Bicicleta não informada',
      observacoes: notes.trim() || undefined,
      origem: 'cliente',
      clienteId: user?.id,
      status: 'iniciar',
    });
    setLoading(false);
    if (!created) {
      window.alert('Este horário não está mais disponível. Escolha outro.');
      setPaymentStep(false);
      setSelectedTime('');
      return;
    }
    setPaymentStep(false);
    setSuccess(true);
  };

  if (paymentStep && servicoSelecionado) {
    const adiantamento = servicoSelecionado.valor * 0.2;
    const restante = servicoSelecionado.valor - adiantamento;
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <button type="button" onClick={() => setPaymentStep(false)} className="mb-6 text-sm font-semibold text-slate-500 hover:text-slate-800">← Voltar ao agendamento</button>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-900 px-6 py-7 text-white">
              <p className="text-sm text-slate-300">Etapa final</p>
              <h1 className="mt-1 text-2xl font-bold">Pagamento do adiantamento</h1>
              <p className="mt-2 text-sm text-slate-300">Reserve seu horário com o pagamento de 20% do serviço.</p>
            </div>
            <div className="space-y-6 p-6 sm:p-8">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-xs text-slate-500">Serviço selecionado</p><p className="mt-1 font-semibold text-slate-900">{servicoSelecionado.label}</p><p className="mt-1 text-sm text-slate-500">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')} às {selectedTime}</p></div>
                  <span className="text-2xl">{servicoSelecionado.icon}</span>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="flex justify-between text-sm text-slate-600"><span>Valor do serviço</span><span>{servicoSelecionado.preco}</span></div>
                  <div className="mt-2 flex justify-between text-sm text-slate-600"><span>Adiantamento (20%)</span><span className="font-semibold text-slate-900">{adiantamento.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span></div>
                  <div className="mt-3 flex justify-between border-t border-slate-100 pt-3"><span className="font-semibold text-slate-900">Restante no atendimento</span><span className="font-bold text-slate-900">{restante.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span></div>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <h2 className="font-bold text-slate-900">Forma de pagamento</h2>
                  <p className="mt-1 text-xs text-slate-500">Escolha como deseja pagar o adiantamento.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setPaymentMethod('pix')} className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${paymentMethod === 'pix' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <span className="text-2xl text-emerald-600">▦</span>
                    <span><span className="block text-sm font-semibold text-slate-900">Pix</span><span className="text-xs text-slate-500">Pagamento instantâneo</span></span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('cartao')} className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${paymentMethod === 'cartao' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <span className="text-2xl text-blue-600">▰</span>
                    <span><span className="block text-sm font-semibold text-slate-900">Cartão</span><span className="text-xs text-slate-500">Crédito</span></span>
                  </button>
                </div>
                {paymentMethod === 'pix' ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-7 text-center">
                    <div className="mx-auto mb-4 flex h-36 w-36 items-center justify-center rounded-xl border border-slate-200 bg-white text-5xl text-slate-300">▦</div>
                    <p className="font-semibold text-slate-800">QR Code Pix</p>
                    <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">O código Pix será disponibilizado após a integração do meio de pagamento.</p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl text-blue-600 shadow-sm">▰</div>
                      <div>
                        <p className="font-semibold text-slate-800">Cartão de crédito</p>
                        <p className="text-xs text-slate-500">Adiantamento de {adiantamento.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</p>
                      </div>
                    </div>
                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      Ambiente de demonstração. Não informe dados reais do cartão.
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Nome no cartão</label>
                        <input autoComplete="off" maxLength={100} value={cardForm.name} onChange={updateCardField('name')} placeholder="Como impresso no cartão" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Número do cartão</label>
                        <input autoComplete="off" inputMode="numeric" maxLength={19} pattern="\\d{4} \\d{4} \\d{4} \\d{4}" value={cardForm.number} onChange={updateCardField('number', formatCardNumber)} placeholder="0000 0000 0000 0000" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Validade</label>
                          <input autoComplete="off" inputMode="numeric" maxLength={5} pattern="(0[1-9]|1[0-2])\\/\\d{2}" value={cardForm.expiry} onChange={updateCardField('expiry', formatCardExpiry)} placeholder="MM/AA" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">CVV</label>
                          <input autoComplete="off" inputMode="numeric" maxLength={4} value={cardForm.cvv} onChange={updateCardField('cvv', formatCvv)} placeholder="123" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Parcelamento</label>
                        <select value={installments} onChange={(event) => setInstallments(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                          {Array.from({ length: 10 }, (_, index) => index + 1).map((quantity) => (
                            <option key={quantity} value={quantity}>
                              {quantity}x de {(adiantamento / quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} {quantity === 1 ? '(à vista)' : 'sem juros'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button type="button" disabled={loading} onClick={confirmarPagamentoDemo} className="w-full rounded-xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">{loading ? 'Processando...' : 'Confirmar adiantamento e agendar'}</button>
              <p className="text-center text-xs text-slate-400">Ambiente de demonstração: nenhuma cobrança será realizada.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    const servico = servicos.find((s) => s.id === selectedServico);

  return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Agendamento Confirmado!</h2>
        <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-4 mb-8">
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Serviço</span>
            <span className="font-semibold text-slate-800 text-sm">{servico?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Bicicleta</span>
            <span className="font-semibold text-slate-800 text-sm">{bikeModel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Data</span>
            <span className="font-semibold text-slate-800 text-sm">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Horário</span>
            <span className="font-semibold text-slate-800 text-sm">{selectedTime}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-4">
            <span className="text-slate-700 font-medium text-sm">Valor estimado</span>
            <span className="font-bold text-blue-600 text-sm">{servico?.preco}</span>
          </div>
        </div>
        <button
          onClick={() => { setSuccess(false); setSelectedServico(''); setSelectedDate(''); setSelectedTime(''); setBikeModel(''); setNotes(''); }}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Fazer novo agendamento
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative h-52 overflow-hidden">
        <img src={HERO} alt="Manutenção" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Agendar Manutenção</h1>
            <p className="text-slate-300">Mecânicos especializados para cuidar da sua bike</p>
          </div>
        </div>
      </div>

      {meusAgendamentos.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 pt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Meus agendamentos</h2>
              <p className="mt-1 text-sm text-slate-500">
                Acompanhe os serviços compartilhados com a equipe da oficina.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {meusAgendamentos.length} {meusAgendamentos.length === 1 ? 'agendamento' : 'agendamentos'}
            </span>
          </div>
          <div className="space-y-3">
            {meusAgendamentos.map((agendamento) => {
              const status = statusStyles[agendamento.status];
              return (
                <div
                  key={agendamento.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                >
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-50">
                    <span className="text-lg font-bold text-slate-800">
                      {new Date(`${agendamento.date}T12:00:00`).getDate().toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {new Date(`${agendamento.date}T12:00:00`).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-800">{agendamento.servico}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {agendamento.hora} · {agendamento.bicicleta}
                    </p>
                    {agendamento.observacoes && (
                      <p className="mt-1 truncate text-xs text-slate-400">{agendamento.observacoes}</p>
                    )}
                  </div>
                  {agendamento.status === 'iniciar' && (
                    <button
                      type="button"
                      onClick={() => cancelarAgendamento(agendamento.id)}
                      className="shrink-0 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="space-y-8">
          {/* Service selection */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">1. Escolha o serviço</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {servicos.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { setSelectedServico(s.id); setSelectedTime(''); }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedServico === s.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{s.icon}</span>
                    <span className={`text-sm font-semibold ${selectedServico === s.id ? 'text-blue-700' : 'text-slate-800'}`}>
                      {s.label}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">{s.desc}</div>
                  <div className={`text-sm font-bold ${selectedServico === s.id ? 'text-blue-600' : 'text-slate-700'}`}>{s.preco}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Bike info */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">2. Dados da bicicleta</h2>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Modelo da bicicleta (opcional)</label>
                <input
                  value={bikeModel}
                  onChange={(e) => setBikeModel(e.target.value)}
                  placeholder='Ex: Trek Marlin 7 29" 2024'
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Observações adicionais</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Descreva o problema ou qualquer informação relevante sobre o serviço..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Date & time */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Data e horário</h2>
            <p className="mb-4 text-sm text-slate-500">Funcionamento: segunda a sexta, 09:00–19:00; sábado, 09:00–16:00; domingo, fechado. A duração do serviço é considerada na disponibilidade.</p>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Data *</label>
                <input
                  type="date"
                  required
                  min={minDateStr}
                  value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                  className="w-full sm:w-64 px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all"
                />
              </div>
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Horário disponível *</label>
                  {!selectedServico ? (
                    <p className="text-sm text-slate-500">Selecione um serviço para consultar os horários compatíveis com sua duração.</p>
                  ) : domingoSelecionado ? (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">A oficina não funciona aos domingos. Escolha outro dia.</p>
                  ) : horariosDisponiveisParaData.length === 0 ? (
                    <p className="text-sm text-slate-500">Não há horários disponíveis para este serviço nesta data. Escolha outro dia.</p>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {horariosDisponiveisParaData.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedTime(t)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                            selectedTime === t
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Summary + submit */}
          {selectedServico && selectedDate && selectedTime && bikeModel && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Resumo do agendamento</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-blue-600">🔧</span>
                  <span className="text-blue-800">{servicos.find((s) => s.id === selectedServico)?.label}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-600">🚲</span>
                  <span className="text-blue-800">{bikeModel}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-600">📅</span>
                  <span className="text-blue-800">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às {selectedTime}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleContinueToPayment}
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-base"
          >
            Continuar para pagamento · 20% de adiantamento
          </button>
        </div>
      </div>
    </div>
  );
}
