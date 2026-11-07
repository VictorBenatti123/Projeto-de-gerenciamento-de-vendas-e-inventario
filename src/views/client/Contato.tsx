import { useState } from 'react';

const SHOP_IMG = `${import.meta.env.BASE_URL}slm-storefront.png`;
const SHOP_ADDRESS = 'Rua Cabo Antônio Pereira da Silva, 879 - Jardim Tranquilidade, Guarulhos - SP, 07051-011';
const SHOP_PHONE = '+551124254197';
const SHOP_PHONE_LABEL = '(11) 2425-4197';
const SHOP_EMAIL = 'slmbikes@gmail.com.br';
const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(SHOP_ADDRESS)}&output=embed`;
const MAP_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOP_ADDRESS)}`;

const contactItems = [
  {
    label: 'Endereço',
    content: (
      <>
        <div>Rua Cabo Antônio Pereira da Silva, 879</div>
        <div>Jardim Tranquilidade — Guarulhos/SP</div>
        <div>CEP: 07051-011</div>
      </>
    ),
  },
  {
    label: 'Celular',
    content: <a className="hover:text-blue-700" href={`tel:${SHOP_PHONE}`}>{SHOP_PHONE_LABEL}</a>,
  },
  {
    label: 'E-mail',
    content: <a className="hover:text-blue-700" href={`mailto:${SHOP_EMAIL}`}>{SHOP_EMAIL}</a>,
  },
  {
    label: 'Horário de funcionamento',
    content: <div>Sábado: 9h às 16h</div>,
  },
];

export default function Contato() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <div>
      <div className="relative h-56 overflow-hidden bg-slate-900">
        <img src={SHOP_IMG} alt="Fachada da SLM Bikes & Parts na Rua Cabo Antônio Pereira da Silva, em Guarulhos" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-6 pb-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">SLM Bikes & Parts</p>
            <h1 className="text-4xl font-bold text-white">Contato e localização</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <aside className="space-y-4">
            <div className="overflow-hidden border border-slate-200 bg-white">
              <img src={SHOP_IMG} alt="Fachada da loja SLM Bikes & Parts" className="h-48 w-full object-cover" />
              <div className="border-t border-slate-200 p-5">
                <h2 className="font-bold text-slate-900">SLM Bikes & Parts</h2>
                <p className="mt-1 text-sm text-slate-500">Bicicletas, peças, acessórios e oficina especializada.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-200 border border-slate-200 bg-white">
              {contactItems.map(({ label, content }) => (
                <section key={label} className="p-5">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</h3>
                  <div className="space-y-1 text-sm leading-relaxed text-slate-800">{content}</div>
                </section>
              ))}
            </div>
          </aside>

          <div className="space-y-6 lg:col-span-2">
            <section className="border border-slate-200 bg-white p-6 sm:p-8">
              {sent ? (
                <div className="py-10 text-center">
                  <h2 className="mb-2 text-xl font-bold text-slate-900">Mensagem registrada</h2>
                  <p className="mb-6 text-sm text-slate-600">Para falar diretamente com a loja, utilize o telefone ou o e-mail informados nesta página.</p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className="border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="mb-6 text-lg font-bold text-slate-900">Enviar mensagem</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Nome *</label>
                        <input required value={form.name} onChange={set('name')} placeholder="Seu nome" className="w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-700" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">E-mail *</label>
                        <input required type="email" value={form.email} onChange={set('email')} placeholder="seu@email.com" className="w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-700" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Assunto *</label>
                      <select required value={form.subject} onChange={set('subject')} className="w-full border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-700">
                        <option value="">Selecione o assunto</option>
                        <option>Dúvida sobre produto</option>
                        <option>Acompanhar pedido</option>
                        <option>Solicitar orçamento</option>
                        <option>Agendamento de manutenção</option>
                        <option>Reclamação ou sugestão</option>
                        <option>Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Mensagem *</label>
                      <textarea required value={form.message} onChange={set('message')} placeholder="Descreva sua dúvida ou mensagem..." rows={5} className="w-full resize-none border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-700" />
                    </div>
                    <button type="submit" disabled={loading} className="bg-[#092b60] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#061f46] disabled:opacity-60">
                      {loading ? 'Enviando...' : 'Enviar mensagem'}
                    </button>
                  </form>
                </>
              )}
            </section>

            <section className="overflow-hidden border border-slate-200 bg-white">
              <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">Como chegar</h2>
                  <p className="mt-1 text-sm text-slate-600">R. Cabo Antônio Pereira da Silva, 879 — Jardim Tranquilidade, Guarulhos/SP</p>
                </div>
                <a href={MAP_DIRECTIONS_URL} target="_blank" rel="noreferrer" className="shrink-0 border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                  Abrir no Google Maps
                </a>
              </div>
              <iframe
                title="Localização da SLM Bikes & Parts no Google Maps"
                src={MAP_EMBED_URL}
                className="h-80 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
