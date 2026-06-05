// Menu data + tiny in-memory cart store (zustand-free, low memory).
// 👉 To add / edit menu items, change the FOOD and BEVERAGE arrays below.
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Item = {
  id: string;
  name: string;
  price: number;          // INR
  image: string;          // remote URL — kept off-bundle to save memory
  category: "food" | "beverage";
  tag?: string;           // e.g. "Spicy", "Chef's pick"
};

// Images use Unsplash's hot-linked CDN (no bundle weight).
const img = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const FOOD: Item[] = [
  { id: "f1", name: "Paneer Butter Masala", price: 140, category: "food", tag: "Chef's pick",
    image: img("photo-1631452180519-c014fe946bc7") },
  { id: "f2", name: "Veg Biryani",          price: 120, category: "food",
    image: img("photo-1563379091339-03b21ab4a4f8") },
  { id: "f3", name: "Masala Dosa",          price: 80,  category: "food", tag: "South Indian",
    image: img("photo-1668236543090-82eba5ee5976") },
  { id: "f4", name: "Chole Bhature",        price: 90,  category: "food", tag: "Spicy",
    image: img("photo-1626777553635-bb96845c5b3e") },
  { id: "f5", name: "Veg Thali",            price: 150, category: "food", tag: "Full meal",
    image: img("photo-1626500155086-46c5727f1e8b") },
  { id: "f6", name: "Pav Bhaji",            price: 100, category: "food",
    image: img("photo-1606491956689-2ea866880c84") },
  { id: "f7", name: "Hakka Noodles",        price: 110, category: "food",
    image: img("photo-1585032226651-759b368d7246") },
  { id: "f8", name: "Veg Sandwich",         price: 60,  category: "food",
    image: img("photo-1528735602780-2552fd46c7af") },
];

export const BEVERAGES: Item[] = [
  { id: "b1", name: "Masala Chai",     price: 20, category: "beverage", tag: "Hostel favourite",
    image: img("photo-1571934811356-5cc061b6821f") },
  { id: "b2", name: "Filter Coffee",   price: 30, category: "beverage",
    image: img("photo-1509042239860-f550ce710b93") },
  { id: "b3", name: "Cold Coffee",     price: 60, category: "beverage", tag: "Iced",
    image: img("photo-1461023058943-07fcbe16d735") },
  { id: "b4", name: "Mango Lassi",     price: 50, category: "beverage",
    image: img("photo-1571805341302-f857805e1a4c") },
  { id: "b5", name: "Fresh Lime Soda", price: 40, category: "beverage",
    image: img("photo-1556881286-fc6915169721") },
  { id: "b6", name: "Hot Chocolate",   price: 70, category: "beverage",
    image: img("photo-1542990253-0b8be07d6b8d") },
];

// Fisher-Yates shuffle — used so the menu order is randomised on each load.
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Cart store ----------
export type CartLine = { item: Item; qty: number };

type CartCtx = {
  lines: CartLine[];
  add: (i: Item) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const api = useMemo<CartCtx>(() => {
    const add = (i: Item) =>
      setLines((prev) => {
        const ex = prev.find((l) => l.item.id === i.id);
        return ex
          ? prev.map((l) => (l.item.id === i.id ? { ...l, qty: l.qty + 1 } : l))
          : [...prev, { item: i, qty: 1 }];
      });
    const remove = (id: string) => setLines((p) => p.filter((l) => l.item.id !== id));
    const setQty = (id: string, qty: number) =>
      setLines((p) =>
        qty <= 0
          ? p.filter((l) => l.item.id !== id)
          : p.map((l) => (l.item.id === id ? { ...l, qty } : l)),
      );
    const clear = () => setLines([]);
    const total = lines.reduce((s, l) => s + l.qty * l.item.price, 0);
    const count = lines.reduce((s, l) => s + l.qty, 0);
    return { lines, add, remove, setQty, clear, total, count };
  }, [lines]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used inside <CartProvider>");
  return v;
}
