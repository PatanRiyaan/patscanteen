// Profile page — shows the logged-in student's details + order history.
// 👉 To add editable fields, extend the form and call a future updateUser() in auth.tsx.
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/menu";
import { Blobs } from "@/components/Blobs";
import { Navbar } from "@/components/Navbar";
import { Mail, Home as HomeIcon, IdCard, Phone, ShieldCheck, Receipt } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Pat's Canteen" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { orders } = useCart();
  const nav = useNavigate();

  useEffect(() => { if (!user) nav({ to: "/" }); }, [user, nav]);

  // Filter only the current user's orders. Memoised to avoid re-renders.
  const myOrders = useMemo(
    () => (user ? orders.filter((o) => o.userEmail === user.email) : []),
    [orders, user],
  );

  if (!user) return null;

  return (
    <div className="relative min-h-screen pb-20">
      <Blobs />
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
        {/* Header card with avatar + identity */}
        <section className="rounded-3xl border border-border bg-card shadow-card p-6 flex items-center gap-5 animate-fade-up">
          <div className="w-20 h-20 rounded-2xl gradient-brand grid place-items-center text-primary-foreground text-2xl font-extrabold shadow-glow shrink-0">
            {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight truncate">{user.name}</h1>
            <p className="text-sm text-muted-foreground truncate">{user.studentId}</p>
            {user.isAdmin && (
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full gradient-brand text-primary-foreground font-bold">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            )}
          </div>
        </section>

        {/* Details grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field icon={<Mail className="w-4 h-4" />}     label="Email"   value={user.email} />
          <Field icon={<Phone className="w-4 h-4" />}    label="Phone"   value={user.phone ?? "—"} />
          <Field icon={<HomeIcon className="w-4 h-4" />} label="Hostel"  value={user.hostel} />
          <Field icon={<IdCard className="w-4 h-4" />}   label="Room"    value={user.roomNo} />
        </section>

        {/* Order history */}
        <section>
          <h2 className="flex items-center gap-2 text-lg font-bold mb-3">
            <Receipt className="w-5 h-5 text-primary" /> Order history
          </h2>
          {myOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
              You haven't placed any orders yet.
              <div className="mt-3">
                <Link to="/dashboard" className="text-primary font-semibold">Browse the menu →</Link>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {myOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
                  <div className="min-w-0">
                    <div className="font-semibold">{o.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(o.placedAt).toLocaleString()} • {o.lines.length} item(s)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{o.grand}</div>
                    <StatusPill status={o.status} />
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

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
      <span className="grid place-items-center w-9 h-9 rounded-xl bg-muted text-primary">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-semibold truncate">{value}</div>
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: "preparing" | "ready" | "delivered" }) {
  const cls =
    status === "delivered" ? "bg-primary/15 text-primary"
    : status === "ready"   ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
    :                        "bg-muted text-muted-foreground";
  return (
    <span className={"inline-block mt-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold " + cls}>
      {status}
    </span>
  );
}
