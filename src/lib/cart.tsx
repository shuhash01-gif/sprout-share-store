import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { products, type Product } from "@/data/products";
import { bn, shippingFor } from "@/lib/shop";

const STORAGE_KEY = "healthio-cart";

export type CartLine = { product: Product; qty: number };

type CartValue = {
  cart: Record<string, number>;
  lines: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  add: (product: Product, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw) as Record<string, number>);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ product: products.find((p) => p.id === id)!, qty }))
        .filter((l) => Boolean(l.product)),
    [cart],
  );

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.qty * l.product.price, 0);
  const shipping = shippingFor(subtotal, count);

  const setQty = useCallback((id: string, qty: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    if (qty > product.stock) {
      toast.error(`${product.name} — সর্বোচ্চ ${bn(product.stock)}টি অর্ডার করা যাবে`);
      qty = product.stock;
    }
    setCart((c) => {
      if (qty <= 0) {
        const { [id]: _drop, ...rest } = c;
        return rest;
      }
      return { ...c, [id]: qty };
    });
  }, []);

  const add = useCallback((product: Product, qty = 1) => {
    if (product.stock <= 0) {
      toast.error(`${product.name} এখন স্টকে নেই`);
      return;
    }
    setCart((c) => {
      const next = (c[product.id] ?? 0) + qty;
      if (next > product.stock) {
        toast.error(`${product.name} — সর্বোচ্চ ${bn(product.stock)}টি অর্ডার করা যাবে`);
        return { ...c, [product.id]: product.stock };
      }
      toast.success(`${product.name} ব্যাগে যোগ হয়েছে`);
      return { ...c, [product.id]: next };
    });
  }, []);

  const clear = useCallback(() => setCart({}), []);

  const value: CartValue = {
    cart,
    lines,
    count,
    subtotal,
    shipping,
    total: subtotal + shipping,
    add,
    setQty,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
