import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Produto } from '../data';
import { useProdutos } from './ProdutosContext';

export interface CartItem {
  produto: Produto;
  quantidade: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (produto: Produto, quantidade?: number) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, quantidade: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { produtos } = useProdutos();
  const [storedItems, setStoredItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (produto: Produto, quantidade = 1) => {
    setStoredItems((prev) => {
      const existing = prev.find((i) => i.produto.id === produto.id);
      if (existing) {
        return prev.map((i) =>
          i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + quantidade } : i
        );
      }
      return [...prev, { produto, quantidade }];
    });
    setIsOpen(true);
  };

  const removeItem = (id: number) => {
    setStoredItems((prev) => prev.filter((i) => i.produto.id !== id));
  };

  const updateQty = (id: number, quantidade: number) => {
    if (quantidade <= 0) return removeItem(id);
    setStoredItems((prev) => prev.map((i) => (i.produto.id === id ? { ...i, quantidade } : i)));
  };

  const clearCart = () => setStoredItems([]);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const items = storedItems
    .map((item) => {
      const produtoAtualizado = produtos.find((produto) => produto.id === item.produto.id);
      return produtoAtualizado ? { ...item, produto: produtoAtualizado } : null;
    })
    .filter((item): item is CartItem => item !== null);
  const total = items.reduce((s, i) => s + i.produto.preco * i.quantidade, 0);
  const count = items.reduce((s, i) => s + i.quantidade, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count, isOpen, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
