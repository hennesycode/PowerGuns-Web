"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export interface CartItem {
  id: number;
  name: string;
  title: string;
  slug: string;
  mainImageUrl: string;
  price: number;
  finalPrice: number;
  durationMinutes: number;
  quantity: number;
  hours: number;
}

interface CouponState {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountAmount: number;
  message: string;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  hydrated: boolean;
  coupon: CouponState | null;
  couponCode: string;
  couponLoading: boolean;
  couponError: string;
  subtotal: number;
  discount: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity" | "hours">, options?: { silent?: boolean }) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  updateItemConfig: (id: number, config: Partial<Pick<CartItem, "quantity" | "hours">>) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCouponCode: (code: string) => void;
  applyCoupon: () => Promise<void>;
  clearCoupon: () => void;
}

const CART_KEY = "powerguns_cart";
const COUPON_KEY = "powerguns_coupon";

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

function loadCoupon(): CouponState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COUPON_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCoupon(coupon: CouponState | null) {
  if (typeof window === "undefined") return;
  if (coupon) localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
  else localStorage.removeItem(COUPON_KEY);
}

function normalizeItems(items: CartItem[]) {
  return items.map((item) => ({ ...item, durationMinutes: item.durationMinutes || 60, quantity: item.quantity || 1, hours: item.hours || 1 }));
}

function getNextItems(items: CartItem[], item: Omit<CartItem, "quantity" | "hours">) {
  const existing = items.find((i) => i.id === item.id);
  if (existing) {
    return items.map((i) => i.id === item.id ? { ...i, ...item } : i);
  }
  return [...items, { ...item, quantity: 1, hours: 1 }];
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [coupon, setCoupon] = useState<CouponState | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Hydrate persisted cart after mount to keep server/client HTML aligned.
  useEffect(() => {
    const storedCoupon = loadCoupon();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(normalizeItems(loadCart()));
    setCoupon(storedCoupon);
    setCouponCode(storedCoupon?.code ?? "");
    setHydrated(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) saveCoupon(coupon);
  }, [coupon, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity" | "hours">, options?: { silent?: boolean }) => {
    setItems((prev) => {
      const next = getNextItems(prev, item);
      saveCart(next);
      return next;
    });
    if (!options?.silent) setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, qty: number) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    );
  }, []);

  const updateItemConfig = useCallback((id: number, config: Partial<Pick<CartItem, "quantity" | "hours">>) => {
    setItems((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      return {
        ...item,
        ...(config.quantity !== undefined ? { quantity: Math.max(1, Math.min(20, config.quantity)) } : {}),
        ...(config.hours !== undefined ? { hours: Math.max(1, Math.min(8, config.hours)) } : {}),
      };
    }));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
    setCouponCode("");
    setCouponError("");
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const clearCoupon = useCallback(() => {
    setCoupon(null);
    setCouponCode("");
    setCouponError("");
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.finalPrice * i.quantity * i.hours, 0);
  const discount = coupon
    ? Math.min(
        subtotal,
        coupon.discountType === "percentage"
          ? Math.round(subtotal * (coupon.discountValue / 100))
          : coupon.discountValue,
      )
    : 0;
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      setCouponError("Ingresa un código de cupón");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/public/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal,
          items: items.map((i) => ({ serviceId: i.id, quantity: i.quantity, hours: i.hours })),
        }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon(data);
        setCouponError("");
      } else {
        setCoupon(null);
        setCouponError(data.message || "Cupón inválido");
      }
    } catch {
      setCouponError("Error al validar cupón. Intenta de nuevo.");
    } finally {
      setCouponLoading(false);
    }
  }, [couponCode, items, subtotal]);

  const value: CartContextValue = {
    items,
    isOpen,
    hydrated,
    coupon,
    couponCode,
    couponLoading,
    couponError,
    subtotal,
    discount,
    total,
    addItem,
    removeItem,
    updateQuantity,
    updateItemConfig,
    clearCart,
    openCart,
    closeCart,
    setCouponCode,
    applyCoupon,
    clearCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext must be used within CartProvider");
  return ctx;
}
