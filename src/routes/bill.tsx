// Final printable bill — pulled from the orders store (set by /payment).
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/menu";
import { Blobs } from "@/components/Blobs";
import { Navbar } from "@/components/Navbar";
import { Printer, CheckCircle2, Home } from "lucide-react";

export const Route = createFileRoute("/bill")({
  head: () => ({ meta: [{ title: "Bill — Pat's Canteen" }] }),
  // Read ?id=PC-xxxxxx so refreshing the page still shows the same receipt.
  validateSearch: (s: Record<string, unknown>) => ({ id: (s.id as string) || "" }),
  component: Bill,
});

function Bill() {
  const { user } = useAuth();
  const { orders, clear } = useCart();
  const { id } = Route.useSearch();
  const nav = useNavigate();

  useEffect(() => { if (!user) nav({ to: "/" }); }, [user, nav]);
  // Clear the cart once we've successfully landed on a real bill.
  useEffect(() => { if (id) clear(); }, [id, clear]);

  if (!user) return null;

  // Latest order = either the one matching ?id= or the most recent of mine.
  const order =
    orders.find((o) => o.id === id) ??
    orders.find((o) => o.userEmail === user.email);

  if (!order) {
    return (
      <div className="relative min-h-screen">
        <Blobs />
        <Navbar />
        <main className="mx-auto max-w-md px-6 py-20 text-center">
          <h1 className="text-2xl font-bold">No bill to show</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Place an order from the menu first.
          </p>
          <Link to="/dashboard" className="mt-6 inline-block h-10 px-5 leading-10 rounded-xl gradient-brand text-primary-foreground font-semibold shadow-glow">
            Browse menu
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20">
      <Blobs />
      <div className="no-print"><Navbar /></div>

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        {/* Confirmation banner — hidden when printing */}
        <div className="no-print rounded-2xl border border-border bg-card shadow-card p-4 flex items-center gap-3 animate-fade-up">
          <span className="grid place-items-center w-10 h-10 rounded-xl gradient-brand text-primary-foreground">
            <CheckCircle2 className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <div className="font-semibold">Order placed & paid via {order.paymentMethod}!</div>
            <div className="text-sm text-muted-foreground">Pick up at the canteen counter when ready.</div>
          </div>
        </div>

        {/* The actual receipt */}
        <article className="mt-6 rounded-2xl bg-card border border-border shadow-card p-6 sm:p-8 print:shadow-none print:border-0">
          <header className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Pat's Canteen</h1>
              <p className="text-xs text-muted-foreground">Hostel Block A • Campus Square</p>
            </div>
            <div className="text-right text-xs">
              <div className="font-semibold">Order #{order.id}</div>
              <div className="text-muted-foreground">{new Date(order.placedAt).toLocaleString()}</div>
            </div>
          </header>

          {/* Student details */}
          <section className="grid grid-cols-2 gap-3 py-4 text-sm border-b border-border">
            <Detail label="Name" value={user.name} />
            <Detail label="Student ID" value={user.studentId} />
            <Detail label="Hostel" value={user.hostel} />
            <Detail label="Room" value={user.roomNo} />
            <Detail label="Email" value={user.email} className="col-span-2" />
          </section>

          {/* Line items */}
          <section className="py-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 font-medium">Item</th>
                  <th className="py-2 font-medium text-center">Qty</th>
                  <th className="py-2 font-medium text-right">Price</th>
                  <th className="py-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.lines.map((l) => (
                  <tr key={l.item.id} className="border-b border-border/60">
                    <td className="py-2">{l.item.name}</td>
                    <td className="py-2 text-center">{l.qty}</td>
                    <td className="py-2 text-right">₹{l.item.price}</td>
                    <td className="py-2 text-right font-medium">₹{l.item.price * l.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Totals */}
          <section className="space-y-1 text-sm">
            <Row label="Subtotal" value={`₹${order.subtotal}`} />
            <Row label="GST (5%)" value={`₹${order.tax}`} />
            <Row label="Service fee" value={`₹${order.serviceFee}`} />
            <Row label="Payment" value={order.paymentMethod} />
            <div className="border-t border-border my-2" />
            <Row label="Grand total" value={`₹${order.grand}`} bold />
          </section>

          <footer className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-foreground">
            Thank you, {user.name.split(" ")[0]}! Status: <b className="uppercase">{order.status}</b>.
          </footer>
        </article>

        {/* Action buttons */}
        <div className="no-print mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => window.print()}
            className="h-12 rounded-xl gradient-brand text-primary-foreground font-semibold shadow-glow hover:opacity-95 active:scale-[0.99] transition inline-flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print bill
          </button>
          <Link
            to="/dashboard"
            className="h-12 rounded-xl border border-border bg-card font-semibold hover:bg-muted transition inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Back to menu
          </Link>
        </div>
      </main>
    </div>
  );
}

function Detail({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={"flex justify-between " + (bold ? "text-base font-bold" : "")}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
