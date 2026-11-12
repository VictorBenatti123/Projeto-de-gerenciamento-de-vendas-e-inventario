import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { produtos as initialProdutos, type Produto } from '../data';
import { readStoredValue, usePersistentState } from '../utils/storage';

function computeStatus(estoque: number, estoqueMinimo: number): Produto['status'] {
  if (estoque <= 0) return 'zerado';
  if (estoque < estoqueMinimo) return 'baixo';
  return 'ok';
}

export interface MovimentacaoEstoque {
  id: number;
  produtoId: number;
  produtoNome: string;
  tipo: 'entrada' | 'saida' | 'venda' | 'estorno';
  quantidade: number;
  estoqueAnterior: number;
  estoqueAtual: number;
  motivo: string;
  data: string;
  pedidoId?: number;
}

interface ItemSaida {
  produtoId: number;
  quantidade: number;
}

interface ResultadoMovimentacao {
  ok: boolean;
  error?: string;
}

const ESTORNOS_KEY = 'slm.estornos-pedidos.v1';

function preservarHistoricoEstornos(movements: MovimentacaoEstoque[]) {
  const estornos = movements.filter((movement) => movement.tipo === 'estorno');
  const demais = movements.filter((movement) => movement.tipo !== 'estorno').slice(0, 500);
  return [...estornos, ...demais];
}

interface ProdutosContextValue {
  produtos: Produto[];
  movimentacoes: MovimentacaoEstoque[];
  addProduto: (produto: Omit<Produto, 'id' | 'status'>) => void;
  removerProduto: (id: number) => void;
  atualizarEstoque: (id: number, novaQtd: number) => boolean;
  registrarSaida: (itens: ItemSaida[], motivo: string, permitirSemEstoque?: boolean) => ResultadoMovimentacao;
  registrarEstorno: (itens: ItemSaida[], pedidoId: number) => ResultadoMovimentacao;
  toggleVitrine: (id: number) => void;
  estoqueBaixo: number;
  semEstoque: number;
  alertasCount: number;
}

const ProdutosContext = createContext<ProdutosContextValue | null>(null);

export function ProdutosProvider({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = usePersistentState<Produto[]>('slm.produtos.v1', initialProdutos);
  const [movimentacoes, setMovimentacoes] = usePersistentState<MovimentacaoEstoque[]>('slm.movimentacoes-estoque.v1', []);
  const [estornosRegistrados, setEstornosRegistrados] = usePersistentState<number[]>(
    ESTORNOS_KEY,
    movimentacoes.filter((movement) => movement.tipo === 'estorno' && movement.pedidoId !== undefined)
      .map((movement) => movement.pedidoId as number)
  );

  const addProduto = (produto: Omit<Produto, 'id' | 'status'>) => {
    setProdutos((current) => {
      const id = Math.max(0, ...current.map((item) => item.id)) + 1;
      return [...current, { ...produto, id, status: computeStatus(produto.estoque, produto.estoqueMinimo) }];
    });
  };

  const removerProduto = (id: number) => {
    setProdutos((current) => current.filter((produto) => produto.id !== id));
  };

  const atualizarEstoque = (id: number, novaQtd: number) => {
    const product = produtos.find((item) => item.id === id);
    if (!product) return false;
    const quantity = Math.max(0, Math.floor(novaQtd));
    const delta = quantity - product.estoque;
    if (delta === 0) return true;
    setProdutos((current) => current.map((item) =>
      item.id === id ? { ...item, estoque: quantity, status: computeStatus(quantity, item.estoqueMinimo) } : item
    ));
    const movement: MovimentacaoEstoque = {
      id: Math.max(0, ...movimentacoes.map((item) => item.id)) + 1,
      produtoId: id,
      produtoNome: product.nome,
      tipo: delta > 0 ? 'entrada' : 'saida',
      quantidade: Math.abs(delta),
      estoqueAnterior: product.estoque,
      estoqueAtual: quantity,
      motivo: 'Ajuste manual no painel de estoque',
      data: new Date().toISOString(),
    };
    setMovimentacoes((current) => preservarHistoricoEstornos([movement, ...current]));
    return true;
  };

  const registrarSaida = (itens: ItemSaida[], motivo: string, permitirSemEstoque = false): ResultadoMovimentacao => {
    const quantities = new Map<number, number>();
    for (const item of itens) {
      if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) {
        return { ok: false, error: 'A quantidade de cada produto deve ser um número inteiro positivo.' };
      }
      quantities.set(item.produtoId, (quantities.get(item.produtoId) ?? 0) + item.quantidade);
    }

    for (const [produtoId, quantity] of quantities) {
      const product = produtos.find((item) => item.id === produtoId);
      if (!product) return { ok: false, error: 'Um produto do pedido não existe mais no catálogo.' };
      if (!permitirSemEstoque && product.estoque < quantity) {
        return {
          ok: false,
          error: 'Estoque insuficiente para ' + product.nome + '. Disponível: ' + product.estoque + '; solicitado: ' + quantity + '.',
        };
      }
    }

    const movements: MovimentacaoEstoque[] = [];
    const nextProducts = produtos.map((product) => {
      const quantity = quantities.get(product.id);
      if (!quantity) return product;
      const nextStock = Math.max(0, product.estoque - quantity);
      movements.push({
        id: Math.max(0, ...movimentacoes.map((item) => item.id), ...movements.map((item) => item.id)) + 1,
        produtoId: product.id,
        produtoNome: product.nome,
        tipo: 'venda',
        quantidade: quantity,
        estoqueAnterior: product.estoque,
        estoqueAtual: nextStock,
        motivo: nextStock === 0 && quantity > product.estoque
          ? motivo + ' (saldo pendente de ' + (quantity - product.estoque) + ' unidade(s))'
          : motivo,
        data: new Date().toISOString(),
      });
      return { ...product, estoque: nextStock, status: computeStatus(nextStock, product.estoqueMinimo) };
    });
    setProdutos(nextProducts);
    setMovimentacoes((current) => preservarHistoricoEstornos([...movements, ...current]));
    return { ok: true };
  };

  const registrarEstorno = (itens: ItemSaida[], pedidoId: number): ResultadoMovimentacao => {
    const ledgerAtual = readStoredValue<number[]>(ESTORNOS_KEY, estornosRegistrados);
    const jaEstornado = ledgerAtual.includes(pedidoId)
      || estornosRegistrados.includes(pedidoId)
      || movimentacoes.some((movement) => movement.tipo === 'estorno' && movement.pedidoId === pedidoId);
    if (jaEstornado) return { ok: false, error: 'O estoque deste pedido já foi estornado.' };
    if (!Number.isInteger(pedidoId) || pedidoId <= 0) return { ok: false, error: 'Identificador de pedido inválido para estorno.' };
    const quantities = new Map<number, number>();
    for (const item of itens) {
      if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) return { ok: false, error: 'Quantidade inválida para estorno.' };
      quantities.set(item.produtoId, (quantities.get(item.produtoId) ?? 0) + item.quantidade);
    }
    for (const id of quantities.keys()) {
      if (!produtos.some((product) => product.id === id)) return { ok: false, error: 'Não foi possível localizar um produto do pedido para estorno.' };
    }
    const movements: MovimentacaoEstoque[] = [];
    const nextProducts = produtos.map((product) => {
      const quantity = quantities.get(product.id);
      if (!quantity) return product;
      const nextStock = product.estoque + quantity;
      movements.push({
        id: Math.max(0, ...movimentacoes.map((item) => item.id), ...movements.map((item) => item.id)) + 1,
        produtoId: product.id, produtoNome: product.nome, tipo: 'estorno', quantidade: quantity,
        estoqueAnterior: product.estoque, estoqueAtual: nextStock,
        motivo: 'Estorno do pedido #' + pedidoId, data: new Date().toISOString(), pedidoId,
      });
      return { ...product, estoque: nextStock, status: computeStatus(nextStock, product.estoqueMinimo) };
    });
    const nextLedger = [...new Set([...ledgerAtual, pedidoId])];
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ESTORNOS_KEY, JSON.stringify(nextLedger));
      }
    } catch {
      return { ok: false, error: 'Não foi possível registrar a proteção contra estorno duplicado no armazenamento local.' };
    }
    setEstornosRegistrados(nextLedger);
    setProdutos(nextProducts);
    setMovimentacoes((current) => preservarHistoricoEstornos([...movements, ...current]));
    return { ok: true };
  };

  const toggleVitrine = (id: number) => {
    setProdutos((current) => current.map((product) =>
      product.id === id ? { ...product, naVitrine: !product.naVitrine } : product
    ));
  };

  const estoqueBaixo = useMemo(() => produtos.filter((product) => product.status === 'baixo').length, [produtos]);
  const semEstoque = useMemo(() => produtos.filter((product) => product.status === 'zerado').length, [produtos]);
  const alertasCount = estoqueBaixo + semEstoque;

  return (
    <ProdutosContext.Provider value={{
      produtos, movimentacoes, addProduto, removerProduto, atualizarEstoque, registrarSaida, registrarEstorno,
      toggleVitrine, estoqueBaixo, semEstoque, alertasCount,
    }}>
      {children}
    </ProdutosContext.Provider>
  );
}

export function useProdutos() {
  const context = useContext(ProdutosContext);
  if (!context) throw new Error('useProdutos must be inside ProdutosProvider');
  return context;
}
