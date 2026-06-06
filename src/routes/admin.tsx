// Admin portal — add / remove menu items and update delivery status.
// Only users with `isAdmin: true` (see auth.tsx) can view this page.
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCart, type Item, type OrderStatus } from "@/lib/menu";
import { Blobs } from "@/components/Blobs";
import { Navbar } from "@/components/Navbar";
import { StatusPill } from "./profile";
import { Plus, Trash2, ShieldAlert, Package, Truck, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Pat's Canteen" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = useAuth();
  const { food, beverages, addItem, removeItem, orders, setOrderStatus } = useCart();
  const nav = useNavigate();

  useEffect(() => { if (!user) nav({ to: "/" }); }, [user, nav]);

  if (!user) return null;

  // Block non-admins with a friendly message instead of a hard redirect.
  if (!user.isAdmin) {
    return (
      <div className="relative min-h-screen">
        <Blobs />
        <Navbar />
        <main className="mx-auto max-w-md px-6 py-20 text-center">
          <ShieldAlert className="w-10 h-10 mx-auto text-destructive" />
          <h1 className="mt-3 text-2xl font-bold">Admin only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in as <b>student@pats.edu</b> (the demo admin) to manage the canteen.
          </p>
          <Link to="/dashboard" className="mt-6 inline-block h-10 px-5 leading-10 rounded-xl gradient-brand text-primary-foreground font-semibold shadow-glow">
            Back to menu
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20">
      <Blobs />
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
        <header className="animate-fade-up">
          <p className="text-sm text-muted-foreground">Admin portal</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage canteen</h1>
        </header>

        {/* Add new item */}
        <AddItemForm onAdd={addItem} />

        {/* Menu lists */}
        <div className="grid md:grid-cols-2 gap-6">
          <ItemList title="Food" items={food} onRemove={removeItem} />
          <ItemList title="Beverages" items={beverages} onRemove={removeItem} />
        </div>

        {/* Deliveries */}
        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold mb-3">
            <Truck className="w-5 h-5 text-primary" /> Deliveries
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {orders.length} total
            </span>
          </h2>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
              No orders yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {orders.map((o) => (
                <li key={o.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="font-bold">{o.id} <span className="text-muted-foreground font-normal">• {o.userName}</span></div>
                      <div className="text-xs text-muted-foreground">
                        {o.hostel} • Room {o.roomNo} • {new Date(o.placedAt).toLocaleString()}
                      </div>
                      <div className="text-xs mt-1 text-muted-foreground truncate">
                        {o.lines.map((l) => `${l.qty}× ${l.item.name}`).join(", ")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{o.grand}</div>
                      <StatusPill status={o.status} />
                    </div>
                  </div>

                  {/* Status controls */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBtn current={o.status} value="preparing" onClick={() => setOrderStatus(o.id, "preparing")} icon={<Package className="w-3.5 h-3.5" />} />
                    <StatusBtn current={o.status} value="ready"     onClick={() => setOrderStatus(o.id, "ready")}     icon={<Truck className="w-3.5 h-3.5" />} />
                    <StatusBtn current={o.status} value="delivered" onClick={() => setOrderStatus(o.id, "delivered")} icon={<CheckCheck className="w-3.5 h-3.5" />} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function StatusBtn({
  current, value, onClick, icon,
}: { current: OrderStatus; value: OrderStatus; onClick: () => void; icon: React.ReactNode }) {
  const active = current === value;
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold capitalize transition " +
        (active ? "gradient-brand text-primary-foreground shadow-glow" : "border border-border bg-card hover:bg-muted")
      }
    >
      {icon} {value}
    </button>
  );
}

function ItemList({
  title, items, onRemove,
}: { title: string; items: Item[]; onRemove: (id: string) => void }) {
  return (
    <section>
      <h2 className="font-bold mb-2">{title} <span className="text-xs text-muted-foreground">({items.length})</span></h2>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-2 pr-3">
            <img src={it.image} alt={it.name} loading="lazy" className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{it.name}</div>
              <div className="text-xs text-muted-foreground">₹{it.price}</div>
            </div>
            <button
              onClick={() => onRemove(it.id)}
              aria-label="Remove"
              className="w-9 h-9 grid place-items-center rounded-lg text-destructive hover:bg-destructive/10 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AddItemForm({ onAdd }: { onAdd: (it: Omit<Item, "id">) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState<"food" | "beverage">("food");
  const [tag, setTag] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !image) return;
    onAdd({
      name: name.trim(),
      price: Number(price),
      image: image.trim(),
      category,
      tag: tag.trim() || undefined,
    });
    setName(""); setPrice(""); setImage(""); setTag("");
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-card shadow-card p-5 grid sm:grid-cols-6 gap-3 animate-fade-up"
    >
      <Input className="sm:col-span-2" label="Name"  value={name}  onChange={setName}  placeholder="Aloo Paratha" />
      <Input className="sm:col-span-1" label="Price (₹)" type="number" value={price} onChange={setPrice} placeholder="80" />
      <div className="sm:col-span-1 flex flex-col">
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as "food" | "beverage")}
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
        >
          <option value="food">Food</option>
          <option value="beverage">Beverage</option>
        </select>
      </div>
      <Input className="sm:col-span-2" label="Tag (optional)" value={tag} onChange={setTag} placeholder="Chef's pick" />
      <Input className="sm:col-span-5" label="Image URL" value={image} onChange={setImage} placeholder="https://images.unsplash.com/..." />
      <button
        type="submit"
        className="sm:col-span-1 h-10 rounded-xl gradient-brand text-primary-foreground font-semibold shadow-glow inline-flex items-center justify-center gap-1 self-end"
      >
        <Plus className="w-4 h-4" /> Add
      </button>
    </form>
  );
}

function Input({
  label, value, onChange, placeholder, type = "text", className = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; className?: string;
}) {
  return (
    <div className={"flex flex-col " + className}>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
      />
    </div>
  );
}
