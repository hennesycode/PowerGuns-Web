"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: number;
  name: string;
  title: string;
  slug: string;
  mainImageUrl: string;
  price: number;
  finalPrice: number;
  discountType: string;
  discountValue: number | null;
  durationMinutes: number;
}

const CART_KEY = "powerguns_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

let globalCart: CartItem[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

export function addToCart(item: CartItem) {
  if (globalCart.some((c) => c.id === item.id)) {
    toast.info("Este servicio ya está en tu carrito");
    return;
  }
  globalCart = [...globalCart, item];
  saveCart(globalCart);
  notify();
  toast.success("Servicio agregado al carrito");
}

export function removeFromCart(id: number) {
  globalCart = globalCart.filter((c) => c.id !== id);
  saveCart(globalCart);
  notify();
}

export function clearCart() {
  globalCart = [];
  saveCart(globalCart);
  notify();
}

export function getCartSnapshot(): CartItem[] {
  return globalCart;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    const loaded = loadCart();
    globalCart = loaded;
    return loaded;
  });

  useEffect(() => {
    const listener = () => setItems([...globalCart]);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const add = useCallback((item: CartItem) => addToCart(item), []);
  const remove = useCallback((id: number) => removeFromCart(id), []);
  const clear = useCallback(() => clearCart(), []);
  const count = items.length;

  return { items, add, remove, clear, count };
}
