import { createContext, useContext, useState, type ReactNode } from 'react';
import { vendas, type Venda } from '../data';

export type FormaPagamento = 'cartao' | 'pix' | 'boleto' | 'outro';

export interface Pedido extends Venda {
  clienteId?: string;
  email?: string;
  origem: 'site' | 'admin';
  formaPagamento?: FormaPagamento;
  finalCartao?: string;
}

type NovoPedido = Omit<Pedido, 'id'>;

interface PedidosContextValue {
  pedidos: Pedido[];
  adicionarPedido: (pedido: NovoPedido) => void;
}

const PedidosContext = createContext<PedidosContextValue | null>(null);

const pedidosIniciais: Pedido[] = vendas.map((venda) => ({
  ...venda,
  origem: 'admin',
  formaPagamento: 'outro',
}));

export function PedidosProvider({ children }: { children: ReactNode }) {
  const [pedidos, setPedidos] = useState(pedidosIniciais);

  const adicionarPedido = (pedido: NovoPedido) => {
    setPedidos((current) => {
      const novoPedido = {
        ...pedido,
        id: Math.max(0, ...current.map((item) => item.id)) + 1,
      };
      return [novoPedido, ...current];
    });
  };

  return (
    <PedidosContext.Provider value={{ pedidos, adicionarPedido }}>
      {children}
    </PedidosContext.Provider>
  );
}

export function usePedidos() {
  const context = useContext(PedidosContext);
  if (!context) throw new Error('usePedidos must be inside PedidosProvider');
  return context;
}
