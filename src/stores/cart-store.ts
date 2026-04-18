import { create } from "zustand";
import { persist } from "zustand/middleware";
import { INITIAL_CART, productById, type CartLine } from "@/lib/data";

type CartState = {
  lines: CartLine[];
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: INITIAL_CART,
      add: (id, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.id === id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.id === id ? { ...l, qty: l.qty + qty } : l,
              ),
            };
          }
          return { lines: [...state.lines, { id, qty }] };
        }),
      setQty: (id, qty) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (l.id === id ? { ...l, qty } : l))
            .filter((l) => l.qty > 0),
        })),
      remove: (id) =>
        set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "farmlink-cart" },
  ),
);

export const selectCartCount = (s: CartState) =>
  s.lines.reduce((n, l) => n + l.qty, 0);

export const selectCartSubtotal = (s: CartState) =>
  s.lines.reduce((sum, l) => {
    const p = productById(l.id);
    return sum + (p ? p.price * l.qty : 0);
  }, 0);
