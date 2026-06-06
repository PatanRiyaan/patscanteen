// Payment portal — pick a method and "pay". This is a demo: no real gateway is called.
// On confirm we record the order via cart.placeOrder() and route to /bill.
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/menu";
import { Blobs } from "@/components/Blobs";
import { Navbar } from "@/components/Navbar";
import { CreditCard, Smartphone, Wallet, Lock, Loader2 } from "lucide-react";

export const Route = createFileRoute("/payment")({
  head: () => ({ meta: [{ title: "Payment — Pat's Canteen" }] }),
  component: PaymentPage,
});

type Method = "UPI" | "Card" | "Mess account";

function PaymentPage() {
  const { user } = useAuth();
  const { lines, total, placeOrder } = useCart();
  const nav = useNavigate();

  const [method, setMethod] = useState<Method>("UPI");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!user) nav({ to: "/" }); }, [user, nav]);
  // If the cart was cleared (e.g. refresh after order), send back to menu.
  useEffect(() => { if (lines.length === 0 && !busy) nav({ to: "/dashboard" }); }, [lines.length, busy, nav]);

  if (!user) return null;

  const tax = Math.round(total * 0.05);
  const serviceFee = lines.length ? 10 : 0;
  const grand = total + tax + serviceFee;

  const pay = async () => {
    setBusy(true);
    // Fake gateway delay so the UX feels real.
    await new Promise((r) => setTimeout(r, 900));
    const order = placeOrder({
      userEmail: user.email,
      userName: user.name,
      hostel: user.hostel,
      roomNo: user.roomNo,
      lines: lines.slice(),
      subtotal: total,
      tax,
      serviceFee,
      grand,
      paymentMethod: method,
    });
    // Pass order id through query so /bill can show the exact receipt.
    nav({ to: "/bill", search: { id: order.id } });
  };

  return (
    <div className="relative min-h-screen pb-20">
      <Blobs />
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Payment</h1>
        <p className="text-muted-foreground mt-1">Choose how you'd like to pay.</p>

        {/* Method selection */}
        <section className="mt-6 grid sm:grid-cols-3 gap-3">
          <MethodCard active={method === "UPI"}          onClick={() => setMethod("UPI")}          icon={<Smartphone className="w-5 h-5" />} title="UPI"          sub="GPay, PhonePe…" />
          <MethodCard active={method === "Card"}         onClick={() => setMethod("Card")}         icon={<CreditCard className="w-5 h-5" />} title="Card"         sub="Visa / Master / Rupay" />
          <MethodCard active={method === "Mess account"} onClick={() => setMethod("Mess account")} icon={<Wallet className="w-5 h-5" />}     title="Mess account" sub="Charge to hostel bill" />
        </section>

        {/* Dummy method-specific input */}
        <section className="mt-5 rounded-2xl border border-border bg-card p-5">
          {method === "UPI" && (
            <Field label="UPI ID" placeholder="yourname@upi" defaultValue={user.email.split("@")[0] + "@upi"} />
          )}
          {method === "Card" && (
            <div className="grid sm:grid-cols-3 gap-3">
              <Field className="sm:col-span-3" label="Card number" placeholder="4242 4242 4242 4242" />
              <Field label="Expiry" placeholder="MM/YY" />
              <Field label="CVV" placeholder="123" />
              <Field label="Name on card" placeholder={user.name} />
            </div>
          )}
          {method === "Mess account" && (
            <p className="text-sm text-muted-foreground">
              ₹{grand} will be added to <b>{user.name}</b>'s monthly mess bill ({user.studentId}).
            </p>
          )}
        </section>

        {/* Summary */}
        <section className="mt-5 rounded-2xl border border-border bg-card shadow-card p-5 space-y-2">
          <Row label="Subtotal" value={`₹${total}`} />
          <Row label="GST (5%)" value={`₹${tax}`} />
          <Row label="Service fee" value={`₹${serviceFee}`} />
          <div className="border-t border-border my-2" />
          <Row label="Grand total" value={`₹${grand}`} bold />
        </section>

        <button
          disabled={busy}
          onClick={pay}
          className="mt-6 w-full h-12 rounded-xl gradient-brand text-primary-foreground font-semibold shadow-glow hover:opacity-95 active:scale-[0.99] transition inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {busy
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
            : <><Lock className="w-4 h-4" /> Pay ₹{grand}</>}
        </button>
        <p className="mt-2 text-xs text-center text-muted-foreground">
          🔒 Demo only — no real charge is made.
        </p>
      </main>
    </div>
  );
}

function MethodCard({
  active, onClick, icon, title, sub,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <button
      onClick={onClick}
      className={
        "text-left p-4 rounded-2xl border transition " +
        (active
          ? "border-primary bg-primary/5 shadow-glow"
          : "border-border bg-card hover:bg-muted")
      }
    >
      <span className="grid place-items-center w-9 h-9 rounded-xl gradient-brand text-primary-foreground">{icon}</span>
      <div className="mt-3 font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </button>
  );
}

function Field({
  label, placeholder, defaultValue, className = "",
}: { label: string; placeholder?: string; defaultValue?: string; className?: string }) {
  return (
    <div className={"flex flex-col " + className}>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</label>
      <input
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
      />
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
