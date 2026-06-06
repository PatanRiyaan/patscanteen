// Menu + Cart + Orders store (no external state lib — keeps memory small).
//
// 👉 Edit DEFAULT_FOOD / DEFAULT_BEVERAGES below to change the seed menu.
//    At runtime, admins can add / remove items from /admin and the changes
//    are saved to localStorage so they persist on refresh.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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

// Seed data — broken Unsplash IDs were removed so every card shows an image.
export const DEFAULT_FOOD: Item[] = [
  { id: "f1", name: "Paneer Butter Masala", price: 140, category: "food", tag: "Chef's pick",
    image: img("photo-1631452180519-c014fe946bc7") },
  { id: "f2", name: "Veg Biryani",          price: 120, category: "food",
    image: img("photo-1563379091339-03b21ab4a4f8") },
  { id: "f3", name: "Masala Dosa",          price: 80,  category: "food", tag: "South Indian",
    image: img("photo-1668236543090-82eba5ee5976") },
  { id: "f6", name: "Pav Bhaji",            price: 100, category: "food",
    image: img("photo-1606491956689-2ea866880c84") },
  { id: "f7", name: "Hakka Noodles",        price: 110, category: "food",
    image: img("photo-1585032226651-759b368d7246") },
  { id: "f8", name: "Veg Sandwich",         price: 60,  category: "food",
    image: img("photo-1528735602780-2552fd46c7af") },
];

export const DEFAULT_BEVERAGES: Item[] = [
  { id: "b1", name: "Masala Chai",     price: 20, category: "beverage", tag: "Hostel favourite",
    image: img("photo-1571934811356-5cc061b6821f") },
  { id: "b2", name: "Filter Coffee",   price: 30, category: "beverage",
    image: img("photo-1509042239860-f550ce710b93") },
  { id: "b3", name: "Cold Coffee",     price: 60, category: "beverage", tag: "Iced",
    image: img("photo-1461023058943-07fcbe16d735") },
  { id: "b5", name: "Fresh Lime Soda", price: 40, category: "beverage",
    image: img("photo-1556881286-fc6915169721") },
];

// ---------- Order / delivery types ----------
export type CartLine = { item: Item; qty: number };

export type OrderStatus = "preparing" | "ready" | "delivered";
export type Order = {
  id: string;            // e.g. PC-123456
  userEmail: string;
  userName: string;
  hostel: string;
  roomNo: string;
  lines: CartLine[];
  subtotal: number;
  tax: number;
  serviceFee: number;
  grand: number;
  placedAt: number;      // epoch ms
  status: OrderStatus;
  paymentMethod: string; // "UPI" | "Card" | "Mess account"
};

// ---------- Context ----------
type Ctx = {
  // Menu
  food: Item[];
  beverages: Item[];
  addItem: (it: Omit<Item, "id">) => void;
  removeItem: (id: string) => void;

  // Cart
  lines: CartLine[];
  add: (i: Item) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;

  // Orders / deliveries
  orders: Order[];
  placeOrder: (o: Omit<Order, "id" | "placedAt" | "status">) => Order;
  setOrderStatus: (id: string, status: OrderStatus) => void;
};

const Ctx = createContext<Ctx | null>(null);
const LS_FOOD = "pats_food";
const LS_BEV  = "pats_bev";
const LS_ORDERS = "pats_orders";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Menu state (admin-editable)
  const [food, setFood] = useState<Item[]>(() => load(LS_FOOD, DEFAULT_FOOD));
  const [beverages, setBev] = useState<Item[]>(() => load(LS_BEV, DEFAULT_BEVERAGES));

  // Cart state (session only)
  const [lines, setLines] = useState<CartLine[]>([]);

  // Orders state (persisted so the admin/profile pages survive a refresh)
  const [orders, setOrders] = useState<Order[]>(() => load(LS_ORDERS, []));

  // Persist menu + orders.
  useEffect(() => { localStorage.setItem(LS_FOOD, JSON.stringify(food)); }, [food]);
  useEffect(() => { localStorage.setItem(LS_BEV, JSON.stringify(beverages)); }, [beverages]);
  useEffect(() => { localStorage.setItem(LS_ORDERS, JSON.stringify(orders)); }, [orders]);

  // ---- Menu actions ----
  const addItem = useCallback((it: Omit<Item, "id">) => {
    const id = (it.category === "food" ? "f" : "b") + Date.now().toString(36);
    const next: Item = { ...it, id };
    if (it.category === "food") setFood((p) => [...p, next]);
    else setBev((p) => [...p, next]);
  }, []);
  const removeItem = useCallback((id: string) => {
    setFood((p) => p.filter((i) => i.id !== id));
    setBev((p) => p.filter((i) => i.id !== id));
    setLines((p) => p.filter((l) => l.item.id !== id));
  }, []);

  // ---- Cart actions ----
  const add = useCallback((i: Item) =>
    setLines((prev) => {
      const ex = prev.find((l) => l.item.id === i.id);
      return ex
        ? prev.map((l) => (l.item.id === i.id ? { ...l, qty: l.qty + 1 } : l))
        : [...prev, { item: i, qty: 1 }];
    }), []);
  const remove = useCallback((id: string) =>
    setLines((p) => p.filter((l) => l.item.id !== id)), []);
  const setQty = useCallback((id: string, qty: number) =>
    setLines((p) =>
      qty <= 0
        ? p.filter((l) => l.item.id !== id)
        : p.map((l) => (l.item.id === id ? { ...l, qty } : l))), []);
  const clear = useCallback(() => setLines([]), []);

  // ---- Orders ----
  const placeOrder: Ctx["placeOrder"] = useCallback((o) => {
    const order: Order = {
      ...o,
      id: "PC-" + Math.floor(100000 + Math.random() * 900000),
      placedAt: Date.now(),
      status: "preparing",
    };
    setOrders((p) => [order, ...p]);
    return order;
  }, []);
  const setOrderStatus = useCallback((id: string, status: OrderStatus) =>
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, status } : o))), []);

  const value = useMemo<Ctx>(() => {
    const total = lines.reduce((s, l) => s + l.qty * l.item.price, 0);
    const count = lines.reduce((s, l) => s + l.qty, 0);
    return {
      food, beverages, addItem, removeItem,
      lines, add, remove, setQty, clear, total, count,
      orders, placeOrder, setOrderStatus,
    };
  }, [food, beverages, lines, orders, addItem, removeItem, add, remove, setQty, clear, placeOrder, setOrderStatus]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used inside <CartProvider>");
  return v;
}
