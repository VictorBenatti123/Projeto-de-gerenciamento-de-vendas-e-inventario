import { createContext, useContext, type ReactNode } from 'react';
import { vendas, type Venda } from '../data';
import { usePersistentState } from '../utils/storage';

export type FormaPagamento = 'cartao' | 'pix' | 'boleto' | 'outro';

export interface ItemPedido {
  produtoId: number;
  sku: string;
  nome: string;
  categoria: string;
  quantidade: number;
  precoUnitario: number;
  subtotal?: number;
}

export interface Pedido extends Venda {
  clienteId?: string;
  email?: string;
  telefone?: string;
  parcelas?: number;
  enderecoEntrega?: {
    cep: string; logradouro: string; numero: string; complemento: string;
    bairro: string; cidade: string; estado: string;
  };
  origem: 'site' | 'admin';
  formaPagamento?: FormaPagamento;
  finalCartao?: string;
  itensDetalhados?: ItemPedido[];
  createdAt?: string;
}

type NovoPedido = Omit<Pedido, 'id'>;

interface PedidosContextValue {
  pedidos: Pedido[];
  adicionarPedido: (pedido: NovoPedido) => Pedido;
  atualizarStatusPedido: (id: number, status: Venda['status']) => void;
}

const PedidosContext = createContext<PedidosContextValue | null>(null);
const pedidosIniciais: Pedido[] = vendas.map((venda) => ({
  ...venda,
  origem: 'admin',
  formaPagamento: 'outro',
}));

export function PedidosProvider({ children }: { children: ReactNode }) {
  const [pedidos, setPedidos] = usePersistentState<Pedido[]>('slm.pedidos.v1', pedidosIniciais);

  const adicionarPedido = (pedido: NovoPedido) => {
    const novoPedido: Pedido = {
      ...pedido,
      createdAt: pedido.createdAt ?? new Date().toISOString(),
      id: Math.max(0, ...pedidos.map((item) => item.id)) + 1,
    };
    setPedidos((current) => [novoPedido, ...current]);
    return novoPedido;
  };

  const atualizarStatusPedido = (id: number, status: Venda['status']) => {
    setPedidos((current) => current.map((pedido) => pedido.id === id ? { ...pedido, status } : pedido));
  };

  return (
    <PedidosContext.Provider value={{ pedidos, adicionarPedido, atualizarStatusPedido }}>
      {children}
    </PedidosContext.Provider>
  );
}

export function usePedidos() {
  const context = useContext(PedidosContext);
  if (!context) throw new Error('usePedidos must be inside PedidosProvider');
  return context;
}
