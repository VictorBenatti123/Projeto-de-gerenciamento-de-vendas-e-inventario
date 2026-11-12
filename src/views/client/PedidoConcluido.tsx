interface Props {
  onContinue: () => void;
}

export default function PedidoConcluido({ onContinue }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-sm">
        ✅
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-3">Pedido registrado</h1>
      <p className="text-slate-500 text-lg mb-2">Obrigado. Seu pedido foi salvo no sistema.</p>
      <p className="text-slate-400 text-sm mb-10">
        O pagamento ainda depende de confirmação manual. Este site não emite cobranças nem envia e-mails automaticamente.
      </p>

      <div className="bg-slate-50 rounded-2xl p-6 mb-10 text-left">
        <h3 className="font-semibold text-slate-800 mb-4">O que acontece agora?</h3>
        <div className="space-y-4">
          {[
            { icon: '🧾', step: '1', title: 'Pedido registrado', desc: 'Os dados e itens foram salvos no sistema.' },
            { icon: '💳', step: '2', title: 'Confirmação do pagamento', desc: 'A equipe deve confirmar o recebimento fora do site.' },
            { icon: '📦', step: '3', title: 'Separação', desc: 'Após a confirmação, a equipe poderá preparar o pedido.' },
            { icon: '🚚', step: '4', title: 'Envio', desc: 'O andamento da entrega deverá ser atualizado pela equipe.' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                {item.step}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">{item.icon} {item.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onContinue}
        className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors text-base"
      >
        Continuar Comprando
      </button>
    </div>
  );
}
