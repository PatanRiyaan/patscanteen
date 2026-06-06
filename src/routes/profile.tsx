// Profile page — view + edit student info, plus order history.
// 👉 Add more editable fields by extending the `form` state and the inputs below.
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/menu";
import { Blobs } from "@/components/Blobs";
import { Navbar } from "@/components/Navbar";
import { Mail, Home as HomeIcon, IdCard, Phone, ShieldCheck, Receipt, Pencil, Save, X } from "lucide-react";
import {
  profileSchema,
  formatPhone, formatStudentId, formatRoom, formatHostel,
} from "@/lib/validation";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Pat's Canteen" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { orders } = useCart();
  const nav = useNavigate();

  useEffect(() => { if (!user) nav({ to: "/" }); }, [user, nav]);

  // Edit mode state.
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", hostel: "", roomNo: "", studentId: "",
  });

  // Reset form whenever we open the editor or switch accounts.
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        phone: user.phone ?? "",
        hostel: user.hostel,
        roomNo: user.roomNo,
        studentId: user.studentId,
      });
    }
  }, [user, editing]);

  const myOrders = useMemo(
    () => (user ? orders.filter((o) => o.userEmail === user.email) : []),
    [orders, user],
  );

  if (!user) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: form.name.trim() || user.name,
      phone: form.phone.trim() || undefined,
      hostel: form.hostel.trim() || user.hostel,
      roomNo: form.roomNo.trim() || user.roomNo,
      studentId: form.studentId.trim() || user.studentId,
    });
    setEditing(false);
  };

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
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border bg-card hover:bg-muted transition text-sm font-semibold"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}
        </section>

        {/* Details — view or edit */}
        {editing ? (
          <form
            onSubmit={save}
            className="rounded-2xl border border-border bg-card shadow-card p-5 grid sm:grid-cols-2 gap-3 animate-fade-up"
          >
            <Input label="Full name"  value={form.name}      onChange={(v) => setForm({ ...form, name: v })} />
            <Input label="Phone"      value={form.phone}     onChange={(v) => setForm({ ...form, phone: v })} placeholder="+91 …" />
            <Input label="Hostel"     value={form.hostel}    onChange={(v) => setForm({ ...form, hostel: v })} />
            <Input label="Room no."   value={form.roomNo}    onChange={(v) => setForm({ ...form, roomNo: v })} />
            <Input label="Student ID" value={form.studentId} onChange={(v) => setForm({ ...form, studentId: v })} className="sm:col-span-2" />
            <Input label="Email (read-only)" value={user.email} onChange={() => {}} disabled className="sm:col-span-2" />

            <div className="sm:col-span-2 flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-border bg-card hover:bg-muted text-sm font-semibold"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl gradient-brand text-primary-foreground shadow-glow text-sm font-semibold"
              >
                <Save className="w-4 h-4" /> Save changes
              </button>
            </div>
          </form>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field icon={<Mail className="w-4 h-4" />}     label="Email"      value={user.email} />
            <Field icon={<Phone className="w-4 h-4" />}    label="Phone"      value={user.phone ?? "—"} />
            <Field icon={<HomeIcon className="w-4 h-4" />} label="Hostel"     value={user.hostel} />
            <Field icon={<IdCard className="w-4 h-4" />}   label="Room"       value={user.roomNo} />
            <Field icon={<IdCard className="w-4 h-4" />}   label="Student ID" value={user.studentId} />
          </section>
        )}

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

function Input({
  label, value, onChange, placeholder, disabled, className = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; className?: string;
}) {
  return (
    <div className={"flex flex-col " + className}>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-10 rounded-xl border border-border bg-background px-3 text-sm disabled:opacity-60"
      />
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
