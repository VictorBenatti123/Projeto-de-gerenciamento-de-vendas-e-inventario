import type { FormEvent } from 'react';
import { categoryImages } from '../data';
import { useProdutos } from '../context/ProdutosContext';
import AdminModal, { fieldClass } from './AdminModal';

export default function ProductFormModal({ onClose }: { onClose: () => void }) {
  const { addProduto, produtos } = useProdutos();
  const categorias = Array.from(new Set([...Object.keys(categoryImages), ...produtos.map((produto) => produto.categoria)])).sort();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const categoria = String(form.get('categoria'));
    const galeria = [...new Set(String(form.get('galeria') ?? '')
      .split(/[\r\n,]+/)
      .map((url) => url.trim())
      .filter((url) => /^https?:\/\//i.test(url)))];
    const imagem = galeria[0] ?? categoryImages[categoria] ?? categoryImages.Componentes;
    addProduto({
      nome: String(form.get('nome')).trim(),
      sku: String(form.get('sku')).trim().toUpperCase(),
      categoria,
      marca: String(form.get('marca')).trim(),
      fornecedor: String(form.get('fornecedor')).trim(),
      preco: Number(form.get('preco')),
      estoque: Number(form.get('estoque')),
      estoqueMinimo: Number(form.get('estoqueMinimo')),
      descricao: String(form.get('descricao')).trim() || 'Produto cadastrado no painel administrativo.',
      imagem,
      galeria: galeria.length > 0 ? galeria : undefined,
      naVitrine: form.get('naVitrine') === 'on',
    });
    onClose();
  };

  return (
    <AdminModal title="Novo produto" subtitle="Cadastre o item no estoque e defina sua exibição na vitrine." onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-4">
          <label className="col-span-2 text-xs font-semibold text-slate-600">
            Nome do produto
            <input name="nome" required autoFocus className={`${fieldClass} mt-1.5`} placeholder="Ex.: Capacete MTB Pro" />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            SKU
            <input name="sku" required className={`${fieldClass} mt-1.5`} placeholder="SKU-0123" />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Categoria
            <select name="categoria" className={`${fieldClass} mt-1.5 bg-white`}>
              {categorias.map((categoria) => <option key={categoria}>{categoria}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Marca
            <input name="marca" required className={`${fieldClass} mt-1.5`} placeholder="Marca" />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Fornecedor
            <input name="fornecedor" required className={`${fieldClass} mt-1.5`} placeholder="Fornecedor" />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Preço (R$)
            <input name="preco" required min="0.01" step="0.01" type="number" className={`${fieldClass} mt-1.5`} />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Estoque inicial
            <input name="estoque" required min="0" step="1" type="number" className={`${fieldClass} mt-1.5`} />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Estoque mínimo
            <input name="estoqueMinimo" required min="0" step="1" type="number" className={`${fieldClass} mt-1.5`} />
          </label>
          <label className="col-span-2 text-xs font-semibold text-slate-600">
            Descrição
            <textarea name="descricao" rows={3} className={`${fieldClass} mt-1.5 resize-none`} placeholder="Detalhes e especificações do produto" />
          </label>
          <label className="col-span-2 text-xs font-semibold text-slate-600">
            Galeria de imagens (URLs)
            <textarea name="galeria" rows={3} className={`${fieldClass} mt-1.5 resize-none`} placeholder="https://... (uma URL por linha)" />
            <span className="mt-1 block font-normal text-slate-400">Use URLs públicas HTTP/HTTPS. A primeira imagem será a capa do produto.</span>
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input name="naVitrine" type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600" />
          Exibir este produto na vitrine
        </label>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancelar</button>
          <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">Cadastrar produto</button>
        </div>
      </form>
    </AdminModal>
  );
}
