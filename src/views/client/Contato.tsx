import { useState } from 'react';

const SHOP_IMG = 'https://images.unsplash.com/photo-1750341472956-e69e84cc71a9?w=800&h=500&fit=crop&auto=format&q=80';
const SHOP_ADDRESS = 'Av. Paulista, 1234, Bela Vista, São Paulo, SP, 01310-100';
const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(SHOP_ADDRESS)}&output=embed`;
const MAP_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOP_ADDRESS)}`;

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
      {/* Hero */}
      <div className="relative h-52 overflow-hidden">
        <img src={SHOP_IMG} alt="SLM Bikes & Parts" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Fale Conosco</h1>
            <p className="text-slate-300">Estamos aqui para ajudar com tudo que sua bike precisar</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Info column */}
          <div className="space-y-6">
            {/* Store info card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <img src={SHOP_IMG} alt="Loja" className="w-full h-40 object-cover" />
              <div className="p-5">
                <h2 className="text-base font-bold text-slate-900 mb-1">SLM Bikes & Parts</h2>
                <p className="text-sm text-slate-500">Sua loja completa de bikes desde 2015</p>
              </div>
            </div>

            {/* Contact details */}
            {[
              { icon: '📍', label: 'Endereço', lines: ['Av. Paulista, 1234 – Loja 5', 'Bela Vista, São Paulo – SP', 'CEP: 01310-100'] },
              { icon: '📞', label: 'Telefone', lines: ['(11) 3456-7890', '(11) 99876-5432 (WhatsApp)'] },
              { icon: '📧', label: 'E-mail', lines: ['contato@cycleparts.com', 'suporte@cycleparts.com'] },
              { icon: '🕐', label: 'Horário', lines: ['Segunda a Sexta: 9h – 19h', 'Sábado: 9h – 17h', 'Domingo: Fechado'] },
            ].map(({ icon, label, lines }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm font-bold text-slate-800">{label}</span>
                </div>
                <div className="space-y-1">
                  {lines.map((line) => (
                    <div key={line} className="text-sm text-slate-600">{line}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Form + map column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact form */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Mensagem enviada!</h3>
                  <p className="text-slate-500 mb-6">Retornaremos em até 24 horas úteis.</p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-slate-900 mb-6">Enviar mensagem</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome *</label>
                        <input
                          required
                          value={form.name}
                          onChange={set('name')}
                          placeholder="Seu nome"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail *</label>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={set('email')}
                          placeholder="seu@email.com"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Assunto *</label>
                      <select
                        required
                        value={form.subject}
                        onChange={set('subject')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all bg-white"
                      >
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
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Mensagem *</label>
                      <textarea
                        required
                        value={form.message}
                        onChange={set('message')}
                        placeholder="Descreva sua dúvida ou mensagem..."
                        rows={5}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm"
                    >
                      {loading ? 'Enviando...' : '📤 Enviar Mensagem'}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Google Maps */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">📍 Nossa localização</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Av. Paulista, 1234 – São Paulo, SP</p>
                </div>
                <a
                  href={MAP_DIRECTIONS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-lg border border-blue-200 px-3 py-2 text-center text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                >
                  Abrir no Google Maps
                </a>
              </div>
              <iframe
                title="Localização da SLM Bikes & Parts no Google Maps"
                src={MAP_EMBED_URL}
                className="h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
