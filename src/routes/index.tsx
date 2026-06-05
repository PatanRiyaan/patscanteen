// Landing page + login/register on a single screen.
// Anonymous visitors see the hero + auth form. Logged-in users are bounced to /dashboard.
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Blobs } from "@/components/Blobs";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, UtensilsCrossed, Sparkles, Clock, Wallet } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pat's Canteen — Hostel food, on tap" },
      { name: "description", content: "Order food and beverages from Pat's Canteen, designed for hostel students." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, login, register } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [err, setErr] = useState("");

  // If already logged in, skip the landing page.
  useEffect(() => { if (user) nav({ to: "/dashboard" }); }, [user, nav]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "");
    const password = String(f.get("password") || "");

    const res = mode === "login"
      ? login(email, password)
      : register({
          email, password,
          name: String(f.get("name") || ""),
          roomNo: String(f.get("room") || ""),
          hostel: String(f.get("hostel") || ""),
          studentId: String(f.get("sid") || ""),
        });

    if (!res.ok) setErr(res.error || "Something went wrong");
    else nav({ to: "/dashboard" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Blobs />

      {/* Floating theme toggle */}
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="fixed top-4 right-4 z-20 grid place-items-center w-10 h-10 rounded-xl border border-border bg-card/70 backdrop-blur hover:bg-muted transition"
      >
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
        {/* Hero */}
        <section className="animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/70 backdrop-blur text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Made for hostel students
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Pat's <span className="bg-clip-text text-transparent gradient-brand">Canteen</span>,
            <br /> served fresh.
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-md">
            Skip the queue. Order chai, biryani, and everything in between — straight from your room.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
            <Feature icon={<Clock className="w-4 h-4" />} label="5 min pickup" />
            <Feature icon={<Wallet className="w-4 h-4" />} label="Mess-bill payment" />
            <Feature icon={<UtensilsCrossed className="w-4 h-4" />} label="Fresh daily" />
          </div>

          <div className="mt-8 hidden lg:block text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Demo login →</span>{" "}
            student@pats.edu / canteen123
          </div>
        </section>

        {/* Auth card */}
        <section className="animate-fade-up">
          <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-xl shadow-card p-6 sm:p-8">
            {/* Mode tabs */}
            <div className="flex p-1 rounded-xl bg-muted mb-6">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setErr(""); }}
                  className={
                    "flex-1 h-9 rounded-lg text-sm font-semibold transition " +
                    (mode === m
                      ? "gradient-brand text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {m === "login" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              {mode === "register" && (
                <>
                  <Field name="name" label="Full name" placeholder="Aarav Sharma" required />
                  <div className="grid grid-cols-2 gap-3">
                    <Field name="sid" label="Student ID" placeholder="PAT20260…" required />
                    <Field name="room" label="Room no." placeholder="B-204" required />
                  </div>
                  <Field name="hostel" label="Hostel" placeholder="Tagore Hostel" required />
                </>
              )}
              <Field name="email" type="email" label="Email" placeholder="you@pats.edu" required />
              <Field name="password" type="password" label="Password" placeholder="••••••••" required />

              {err && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{err}</p>
              )}

              <button
                type="submit"
                className="w-full h-11 rounded-xl gradient-brand text-primary-foreground font-semibold shadow-glow hover:opacity-95 active:scale-[0.99] transition"
              >
                {mode === "login" ? "Sign in" : "Create account"}
              </button>

              <p className="text-xs text-center text-muted-foreground pt-2 lg:hidden">
                Demo: <b>student@pats.edu</b> / <b>canteen123</b>
              </p>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            By continuing you agree to the canteen's house rules.{" "}
            <Link to="/" className="underline">Learn more</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

/* ---------- tiny presentational helpers ---------- */
function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/70 backdrop-blur p-3 text-center">
      <div className="mx-auto mb-1 w-7 h-7 grid place-items-center rounded-lg gradient-brand text-primary-foreground">
        {icon}
      </div>
      <div className="text-xs font-medium">{label}</div>
    </div>
  );
}

function Field({
  name, label, type = "text", placeholder, required,
}: {
  name: string; label: string; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full h-11 rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
      />
    </label>
  );
}
