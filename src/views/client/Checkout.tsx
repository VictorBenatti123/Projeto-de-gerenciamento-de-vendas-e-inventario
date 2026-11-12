import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { usePedidos } from '../../context/PedidosContext';
import { useProdutos } from '../../context/ProdutosContext';
import { readStoredValue } from '../../utils/storage';
import { formatCep, formatCpf, formatPhone } from '../../utils/masks';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

type PaymentMethod = 'cartao' | 'pix' | 'boleto';

export default function Checkout({ onBack, onSuccess }: Props) {
  const { items, clearCart, buyNowItems, clearBuyNow } = useCart();
  const checkoutItems = buyNowItems ?? items;
  const checkoutTotal = checkoutItems.reduce((sum, item) => sum + item.produto.preco * item.quantidade, 0);
  const isBuyNow = buyNowItems !== null;
  const { user } = useAuth();
  const { adicionarPedido } = usePedidos();
  const { produtos, registrarSaida } = useProdutos();
  const [checkoutError, setCheckoutError] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cartao');
  const [loading, setLoading] = useState(false);
  const [parcelas, setParcelas] = useState(1);

  // Form state
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    cpf: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: 'SP',
  });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const setMasked =
    (field: keyof typeof form, formatter: (value: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [field]: formatter(e.target.value) }));

  const handleBack = () => {
    clearBuyNow();
    onBack();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0) return;
    setLoading(true);
    setCheckoutError('');
    const settings = readStoredValue<{ permitirVendaSemEstoque?: boolean }>('slm.configuracoes.v1', {});
    const currentItems = checkoutItems.map(({ produto, quantidade }) => {
      const currentProduct = produtos.find((item) => item.id === produto.id);
      return currentProduct ? { produto: currentProduct, quantidade } : null;
    });
    if (currentItems.some((item) => item === null)) {
      setCheckoutError('Um ou mais produtos não estão mais disponíveis. Atualize o carrinho.');
      setLoading(false);
      return;
    }
    const itemsToSell = currentItems.filter((item): item is { produto: (typeof produtos)[number]; quantidade: number } => item !== null);
    const stockResult = registrarSaida(
      itemsToSell.map(({ produto, quantidade }) => ({ produtoId: produto.id, quantidade })),
      'Venda pelo site',
      settings.permitirVendaSemEstoque === true
    );
    if (!stockResult.ok) {
      setCheckoutError(stockResult.error ?? 'Não foi possível validar o estoque.');
      setLoading(false);
      return;
    }
    const orderTotal = Number(checkoutTotal.toFixed(2));
    const grossItemsTotal = itemsToSell.reduce((sum, item) => sum + item.produto.preco * item.quantidade, 0);
    let remainingOrderTotal = orderTotal;
    const itensDetalhados = itemsToSell.map(({ produto, quantidade }, index) => {
      const lineGross = produto.preco * quantidade;
      const subtotal = index === itemsToSell.length - 1
        ? remainingOrderTotal
        : Number((orderTotal * lineGross / grossItemsTotal).toFixed(2));
      remainingOrderTotal = Number((remainingOrderTotal - subtotal).toFixed(2));
      return {
        produtoId: produto.id, sku: produto.sku, nome: produto.nome,
        categoria: produto.categoria, quantidade,
        precoUnitario: Number((subtotal / quantidade).toFixed(4)), subtotal,
      };
    });
    adicionarPedido({
      clienteId: user?.id,
      cliente: form.name.trim(),
      email: form.email.trim(),
      total: orderTotal,
      status: 'processando',
      data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      itens: itemsToSell.map(({ produto, quantidade }) => `${quantidade}x ${produto.nome}`),
      itensDetalhados,
      origem: 'site',
      telefone: form.phone.trim(),
      enderecoEntrega: {
        cep: form.cep.trim(),
        logradouro: form.address.trim(),
        numero: form.number.trim(),
        complemento: form.complement.trim(),
        bairro: form.district.trim(),
        cidade: form.city.trim(),
        estado: form.state,
      },
      parcelas: payMethod === 'cartao' ? parcelas : undefined,
      formaPagamento: payMethod,
    });
    setLoading(false);
    if (isBuyNow) clearBuyNow();
    else clearCart();
    onSuccess();
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Carrinho</div>
        <div className="text-lg font-medium text-slate-700 mb-4">Seu carrinho está vazio</div>
        <button onClick={handleBack} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm">
          ← Continuar Comprando
        </button>
      </div>
    );
  }

  const inputClass = 'w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Back */}
      <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-6">
        ← Continuar Comprando
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-8">Finalizar Pedido</h1>

      <form onSubmit={handleSubmit}>
        {checkoutError && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{checkoutError}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal info */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Dados Pessoais
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nome completo</label>
                  <input required maxLength={100} value={form.name} onChange={set('name')} placeholder="Seu nome" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>E-mail</label>
                  <input required type="email" maxLength={120} value={form.email} onChange={set('email')} placeholder="seu@email.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Telefone</label>
                  <input
                    required
                    inputMode="numeric"
                    maxLength={15}
                    pattern="\(\d{2}\) \d{4,5}-\d{4}"
                    value={form.phone}
                    onChange={setMasked('phone', formatPhone)}
                    placeholder="(11) 99999-9999"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>CPF</label>
                  <input
                    required
                    inputMode="numeric"
                    maxLength={14}
                    pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
                    value={form.cpf}
                    onChange={setMasked('cpf', formatCpf)}
                    placeholder="000.000.000-00"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Endereço de Entrega
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>CEP</label>
                  <input
                    required
                    inputMode="numeric"
                    maxLength={9}
                    pattern="\d{5}-\d{3}"
                    value={form.cep}
                    onChange={setMasked('cep', formatCep)}
                    placeholder="00000-000"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Endereço</label>
                  <input required maxLength={120} value={form.address} onChange={set('address')} placeholder="Rua, Avenida..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Número</label>
                  <input required maxLength={10} value={form.number} onChange={set('number')} placeholder="123" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Complemento</label>
                  <input maxLength={60} value={form.complement} onChange={set('complement')} placeholder="Apto, Bloco..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bairro</label>
                  <input required maxLength={60} value={form.district} onChange={set('district')} placeholder="Bairro" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cidade</label>
                  <input required maxLength={60} value={form.city} onChange={set('city')} placeholder="Cidade" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Estado</label>
                  <select value={form.state} onChange={set('state')} className={inputClass}>
                    {['SP','RJ','MG','RS','PR','SC','BA','GO','DF','PE','CE','AM','PA','ES','RN','PB','AL','PI','MA','MT','MS','RO','AC','AP','RR','SE','TO'].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Pagamento
              </h2>

              {/* Payment method tabs */}
              <div className="flex gap-2 mb-6">
                {([['cartao', '💳 Cartão'], ['pix', 'PIX'], ['boleto', 'Boleto']] as [PaymentMethod, string][]).map(([m, l]) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPayMethod(m)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      payMethod === m
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-200 text-slate-600 hover:border-blue-300'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {payMethod === 'cartao' && (
                <div className="space-y-4">
                  <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    O site ainda não está conectado a uma operadora de cartão. Nenhum dado de cartão será solicitado ou processado; o pedido ficará aguardando confirmação manual.
                  </div>
                  <div>
                    <label className={labelClass}>Número de parcelas (simulação)</label>
                    <select value={parcelas} onChange={(event) => setParcelas(Number(event.target.value))} className={inputClass}>
                      {Array.from({ length: 10 }, (_, index) => index + 1).map((number) => {
                        const parcela = Number((checkoutTotal / number).toFixed(2));
                        return (
                          <option key={number} value={number}>
                            {number}x de {parcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} {number === 1 ? '(à vista)' : '(simulação)'}
                          </option>
                        );
                      })}
                    </select>
                    <p className="mt-2 text-xs text-slate-400">A quantidade de parcelas será salva no pedido, mas a cobrança parcelada depende de integração com gateway.</p>
                  </div>
                </div>
              )}

              {payMethod === 'pix' && (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl font-bold text-emerald-700 mb-4">PIX</div>
                  <div className="text-lg font-bold text-slate-900 mb-1">Pix não integrado</div>
                  <div className="text-xs text-slate-500 max-w-sm">Nenhum QR Code ou código Pix copia e cola será gerado. O pedido será registrado como aguardando confirmação manual.</div>
                </div>
              )}

              {payMethod === 'boleto' && (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="text-5xl mb-4">📄</div>
                  <div className="text-lg font-bold text-slate-900 mb-1">Boleto não integrado</div>
                  <div className="text-xs text-slate-500 mt-2 max-w-xs">Nenhum boleto ou linha digitável será emitido. O pedido ficará aguardando confirmação manual.</div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-60 transition-all text-base"
            >
              {loading ? 'Registrando pedido...' : `Registrar pedido · R${checkoutTotal.toFixed(2).replace('.', ',')}`}
            </button>
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-24">
              <h3 className="text-base font-bold text-slate-900 mb-4">Resumo do Pedido</h3>
              <div className="space-y-3 mb-5">
                {checkoutItems.map(({ produto, quantidade }) => (
                  <div key={produto.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-700 leading-snug truncate">{produto.nome}</div>
                      <div className="text-xs text-slate-400">Qtd: {quantidade}</div>
                    </div>
                    <div className="text-sm font-semibold text-slate-800 shrink-0">
                      R${(produto.preco * quantidade).toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal ({checkoutItems.reduce((s, i) => s + i.quantidade, 0)} itens)</span>
                  <span>R${checkoutTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Frete</span>
                  <span className="text-emerald-600 font-medium">Grátis</span>
                </div>
<div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span>R${checkoutTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                {['Compra segura', 'Entrega', 'Devolução em até 30 dias'].map((b) => (
                  <div key={b} className="text-xs text-slate-500">{b}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
