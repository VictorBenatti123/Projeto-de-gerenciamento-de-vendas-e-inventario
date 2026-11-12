import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Produto } from '../data';
import { useProdutos } from './ProdutosContext';
import { readStoredValue, usePersistentState } from '../utils/storage';

export interface CartItem {
  produto: Produto;
  quantidade: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (produto: Produto, quantidade?: number) => boolean;
  removeItem: (id: number) => void;
  updateQty: (id: number, quantidade: number) => boolean;
  clearCart: () => void;
  beginBuyNow: (produto: Produto, quantidade?: number) => boolean;
  buyNowItems: CartItem[] | null;
  clearBuyNow: () => void;
  total: number;
  count: number;
  isOpen: boolean;
  notice: string | null;
  permiteSemEstoque: boolean;
  clearNotice: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = 'slm.cart.v1';
const SETTINGS_KEY = 'slm.configuracoes.v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const { produtos } = useProdutos();
  const [storedItems, setStoredItems] = usePersistentState<CartItem[]>(CART_KEY, []);
  const [buyNowItems, setBuyNowItems] = useState<CartItem[] | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const allowsBackorder = () =>
    readStoredValue<{ permitirVendaSemEstoque?: boolean }>(SETTINGS_KEY, {}).permitirVendaSemEstoque === true;
  const permiteSemEstoque = allowsBackorder();

  const addItem = (produto: Produto, quantidade = 1) => {
    const existing = storedItems.find((item) => item.produto.id === produto.id);
    const nextQuantity = (existing?.quantidade ?? 0) + Math.max(1, Math.floor(quantidade));
    if (!allowsBackorder() && nextQuantity > produto.estoque) {
      setNotice('Estoque insuficiente. Disponível: ' + produto.estoque + ' unidade(s).');
      setIsOpen(true);
      return false;
    }
    setNotice(null);
    setStoredItems((current) => {
      const found = current.some((item) => item.produto.id === produto.id);
      return found
        ? current.map((item) => item.produto.id === produto.id ? { ...item, quantidade: nextQuantity } : item)
        : [...current, { produto, quantidade: nextQuantity }];
    });
    setIsOpen(true);
    return true;
  };

  const removeItem = (id: number) => {
    setStoredItems((current) => current.filter((item) => item.produto.id !== id));
    setNotice(null);
  };

  const updateQty = (id: number, quantidade: number) => {
    if (quantidade <= 0) {
      removeItem(id);
      return true;
    }
    const product = produtos.find((item) => item.id === id);
    if (!product) {
      setNotice('Este produto não está mais disponível no catálogo.');
      return false;
    }
    if (!allowsBackorder() && quantidade > product.estoque) {
      setNotice('Quantidade maior que o estoque disponível (' + product.estoque + ').');
      return false;
    }
    setNotice(null);
    setStoredItems((current) => current.map((item) =>
      item.produto.id === id ? { ...item, quantidade: Math.floor(quantidade) } : item
    ));
    return true;
  };

  const clearCart = () => {
    setStoredItems([]);
    setNotice(null);
  };
  const beginBuyNow = (produto: Produto, quantidade = 1) => {
    const currentProduct = produtos.find((item) => item.id === produto.id);
    const requestedQuantity = Math.max(1, Math.floor(quantidade));
    if (!currentProduct) {
      setNotice('Este produto não está mais disponível no catálogo.');
      return false;
    }
    if (!allowsBackorder() && requestedQuantity > currentProduct.estoque) {
      setNotice('Estoque insuficiente. Disponível: ' + currentProduct.estoque + ' unidade(s).');
      return false;
    }
    setBuyNowItems([{ produto: currentProduct, quantidade: requestedQuantity }]);
    setNotice(null);
    setIsOpen(false);
    return true;
  };
  const clearBuyNow = () => setBuyNowItems(null);
  const clearNotice = () => setNotice(null);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const items = storedItems
    .map((item) => {
      const product = produtos.find((candidate) => candidate.id === item.produto.id);
      return product ? { ...item, produto: product } : null;
    })
    .filter((item): item is CartItem => item !== null);
  const currentBuyNowItems = buyNowItems?.map((item) => {
    const product = produtos.find((candidate) => candidate.id === item.produto.id);
    return product ? { ...item, produto: product } : null;
  }).filter((item): item is CartItem => item !== null) ?? null;
  const total = items.reduce((sum, item) => sum + item.produto.preco * item.quantidade, 0);
  const count = items.reduce((sum, item) => sum + item.quantidade, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart, beginBuyNow,
      buyNowItems: currentBuyNowItems, clearBuyNow, total, count,
      isOpen, notice, permiteSemEstoque, clearNotice, openCart, closeCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be inside CartProvider');
  return context;
}
