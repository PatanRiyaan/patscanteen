// Final printable bill — summarises order with student details from dummy account.
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/menu";
import { Blobs } from "@/components/Blobs";
import { Navbar } from "@/components/Navbar";
import { Printer, CheckCircle2, Home } from "lucide-react";

export const Route = createFileRoute("/bill")({
  head: () => ({ meta: [{ title: "Bill — Pat's Canteen" }] }),
  component: Bill,
});

function Bill() {
  const { user } = useAuth();
  const { lines, total, clear } = useCart();
  const nav = useNavigate();

  // Snapshot the order once when entering the page, so the user can
  // start a fresh cart from the dashboard without losing this bill.
  const snapshot = useMemo(() => ({
    lines: lines.slice(),
    total,
    when: new Date(),
    orderNo: "PC-" + Math.floor(100000 + Math.random() * 900000),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  useEffect(() => { if (!user) nav({ to: "/" }); }, [user, nav]);
  if (!user) return null;

  const tax = Math.round(snapshot.total * 0.05);
  const serviceFee = snapshot.lines.length ? 10 : 0;
  const grand = snapshot.total + tax + serviceFee;

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
            <div className="font-semibold">Order placed!</div>
            <div className="text-sm text-muted-foreground">Pick up at the canteen counter when ready.</div>
          </div>
        </div>

        {/* The actual receipt */}
        <article className="mt-6 rounded-2xl bg-card border border-border shadow-card p-6 sm:p-8 print:shadow-none print:border-0">
          {/* Header */}
          <header className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Pat's Canteen</h1>
              <p className="text-xs text-muted-foreground">Hostel Block A • Campus Square</p>
            </div>
            <div className="text-right text-xs">
              <div className="font-semibold">Order #{snapshot.orderNo}</div>
              <div className="text-muted-foreground">
                {snapshot.when.toLocaleString()}
              </div>
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
                {snapshot.lines.map((l) => (
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
            <Row label="Subtotal" value={`₹${snapshot.total}`} />
            <Row label="GST (5%)" value={`₹${tax}`} />
            <Row label="Service fee" value={`₹${serviceFee}`} />
            <div className="border-t border-border my-2" />
            <Row label="Grand total" value={`₹${grand}`} bold />
          </section>

          <footer className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-foreground">
            Thank you, {user.name.split(" ")[0]}! Bill payable via mess account.
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
            onClick={() => clear()}
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
