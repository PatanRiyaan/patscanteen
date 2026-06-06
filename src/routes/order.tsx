// Order review page — edit quantities and confirm.
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/menu";
import { Blobs } from "@/components/Blobs";
import { Navbar } from "@/components/Navbar";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/order")({
  head: () => ({ meta: [{ title: "Your Order — Pat's Canteen" }] }),
  component: OrderPage,
});

function OrderPage() {
  const { user } = useAuth();
  const { lines, setQty, remove, total } = useCart();
  const nav = useNavigate();

  useEffect(() => { if (!user) nav({ to: "/" }); }, [user, nav]);
  if (!user) return null;

  // Charges — tweak here if you want different fees.
  const tax = Math.round(total * 0.05);
  const serviceFee = lines.length ? 10 : 0;
  const grand = total + tax + serviceFee;

  return (
    <div className="relative min-h-screen pb-20">
      <Blobs />
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Your order</h1>
        <p className="text-muted-foreground mt-1">Review your items before checkout.</p>

        {lines.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <ul className="mt-6 space-y-3">
              {lines.map((l) => (
                <li
                  key={l.item.id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card shadow-card animate-fade-up"
                >
                  <img
                    src={l.item.image}
                    alt={l.item.name}
                    loading="lazy"
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{l.item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ₹{l.item.price} × {l.qty} = <b className="text-foreground">₹{l.item.price * l.qty}</b>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-xl border border-border bg-muted p-1">
                    <button
                      onClick={() => setQty(l.item.id, l.qty - 1)}
                      className="w-7 h-7 grid place-items-center rounded-lg hover:bg-background transition"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm">{l.qty}</span>
                    <button
                      onClick={() => setQty(l.item.id, l.qty + 1)}
                      className="w-7 h-7 grid place-items-center rounded-lg hover:bg-background transition"
                      aria-label="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(l.item.id)}
                    aria-label="Remove"
                    className="w-9 h-9 grid place-items-center rounded-xl hover:bg-destructive/10 text-destructive transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="mt-6 rounded-2xl border border-border bg-card shadow-card p-5 space-y-2">
              <Row label="Subtotal" value={`₹${total}`} />
              <Row label="GST (5%)" value={`₹${tax}`} />
              <Row label="Service fee" value={`₹${serviceFee}`} />
              <div className="border-t border-border my-2" />
              <Row label="Grand total" value={`₹${grand}`} bold />
            </div>

            <button
              onClick={() => nav({ to: "/payment" })}
              className="mt-6 w-full h-12 rounded-xl gradient-brand text-primary-foreground font-semibold shadow-glow hover:opacity-95 active:scale-[0.99] transition inline-flex items-center justify-center gap-2"
            >
              Proceed to payment <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}
      </main>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={"flex justify-between " + (bold ? "text-lg font-bold" : "text-sm")}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 rounded-3xl border border-dashed border-border bg-card/60 backdrop-blur p-10 text-center">
      <div className="mx-auto w-14 h-14 grid place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-glow">
        <ShoppingBag className="w-6 h-6" />
      </div>
      <h2 className="mt-4 font-bold text-lg">Your tray is empty</h2>
      <p className="mt-1 text-sm text-muted-foreground">Head back to the menu and grab something tasty.</p>
      <Link
        to="/dashboard"
        className="inline-block mt-5 h-10 px-5 leading-10 rounded-xl gradient-brand text-primary-foreground font-semibold shadow-glow"
      >
        Browse menu
      </Link>
    </div>
  );
}
