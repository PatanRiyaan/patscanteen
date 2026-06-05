// Dashboard — randomised menu split into Food and Beverages.
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { Blobs } from "@/components/Blobs";
import { Navbar } from "@/components/Navbar";
import { MenuCard } from "@/components/MenuCard";
import { FOOD, BEVERAGES, shuffle, useCart } from "@/lib/menu";
import { UtensilsCrossed, CupSoda, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Menu — Pat's Canteen" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { count, total } = useCart();
  const nav = useNavigate();

  // Bounce to landing if not logged in.
  useEffect(() => { if (!user) nav({ to: "/" }); }, [user, nav]);

  // Randomise once per mount — useMemo keeps it stable on re-render.
  const food = useMemo(() => shuffle(FOOD), []);
  const drinks = useMemo(() => shuffle(BEVERAGES), []);

  if (!user) return null;

  return (
    <div className="relative min-h-screen pb-32">
      <Blobs />
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Greeting */}
        <section className="animate-fade-up">
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            {user.hostel} • Room {user.roomNo}
          </p>
        </section>

        {/* FOOD */}
        <Section
          icon={<UtensilsCrossed className="w-4 h-4" />}
          title="Food"
          count={food.length}
        >
          <Grid>{food.map((i) => <MenuCard key={i.id} item={i} />)}</Grid>
        </Section>

        {/* BEVERAGES */}
        <Section
          icon={<CupSoda className="w-4 h-4" />}
          title="Beverages"
          count={drinks.length}
        >
          <Grid>{drinks.map((i) => <MenuCard key={i.id} item={i} />)}</Grid>
        </Section>
      </main>

      {/* Sticky checkout bar — only shows when the cart has items */}
      {count > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[min(640px,calc(100%-2rem))] animate-fade-up">
          <Link
            to="/order"
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card/90 backdrop-blur-xl shadow-glow px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-10 h-10 rounded-xl gradient-brand text-primary-foreground font-bold">
                {count}
              </span>
              <div>
                <div className="text-xs text-muted-foreground">Your order</div>
                <div className="font-semibold">₹{total}</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Review <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}

function Section({
  icon, title, count, children,
}: { icon: React.ReactNode; title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <header className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <span className="grid place-items-center w-8 h-8 rounded-lg gradient-brand text-primary-foreground">
            {icon}
          </span>
          {title}
        </h2>
        <span className="text-xs px-2.5 py-1 rounded-full border border-border bg-card text-muted-foreground">
          {count} items
        </span>
      </header>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
}
