import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { produtos as initialProdutos, type Produto } from '../data';

function computeStatus(estoque: number, estoqueMinimo: number): Produto['status'] {
  if (estoque === 0) return 'zerado';
  if (estoque < estoqueMinimo) return 'baixo';
  return 'ok';
}

interface ProdutosContextValue {
  produtos: Produto[];
  addProduto: (produto: Omit<Produto, 'id' | 'status'>) => void;
  removerProduto: (id: number) => void;
  atualizarEstoque: (id: number, novaQtd: number) => void;
  toggleVitrine: (id: number) => void;
  estoqueBaixo: number;
  semEstoque: number;
  alertasCount: number;
}

const ProdutosContext = createContext<ProdutosContextValue | null>(null);

export function ProdutosProvider({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = useState<Produto[]>(initialProdutos);

  const addProduto = (produto: Omit<Produto, 'id' | 'status'>) => {
    setProdutos((prev) => {
      const id = Math.max(0, ...prev.map((item) => item.id)) + 1;
      return [...prev, { ...produto, id, status: computeStatus(produto.estoque, produto.estoqueMinimo) }];
    });
  };

  const removerProduto = (id: number) => {
    setProdutos((prev) => prev.filter((produto) => produto.id !== id));
  };

  const atualizarEstoque = (id: number, novaQtd: number) => {
    const qty = Math.max(0, novaQtd);
    setProdutos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, estoque: qty, status: computeStatus(qty, p.estoqueMinimo) } : p
      )
    );
  };

  const toggleVitrine = (id: number) => {
    setProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, naVitrine: !p.naVitrine } : p)));
  };

  const estoqueBaixo = useMemo(() => produtos.filter((p) => p.status === 'baixo').length, [produtos]);
  const semEstoque = useMemo(() => produtos.filter((p) => p.status === 'zerado').length, [produtos]);
  const alertasCount = estoqueBaixo + semEstoque;

  return (
    <ProdutosContext.Provider value={{ produtos, addProduto, removerProduto, atualizarEstoque, toggleVitrine, estoqueBaixo, semEstoque, alertasCount }}>
      {children}
    </ProdutosContext.Provider>
  );
}

export function useProdutos() {
  const ctx = useContext(ProdutosContext);
  if (!ctx) throw new Error('useProdutos must be inside ProdutosProvider');
  return ctx;
}
