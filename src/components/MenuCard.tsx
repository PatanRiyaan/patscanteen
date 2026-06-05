// Interactive menu item card.
// Hover effect (skew + shine) comes from the `menu-card` utility in styles.css.
import { Plus, Minus } from "lucide-react";
import type { Item } from "@/lib/menu";
import { useCart } from "@/lib/menu";

export function MenuCard({ item }: { item: Item }) {
  const { lines, add, setQty } = useCart();
  const line = lines.find((l) => l.item.id === item.id);

  return (
    <div className="menu-card rounded-2xl bg-card border border-border shadow-card animate-fade-up">
      {/* Image — lazy-loaded to keep memory low */}
      <div className="relative h-40 overflow-hidden rounded-t-2xl bg-muted">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
        {item.tag && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold gradient-brand text-primary-foreground shadow-glow">
            {item.tag}
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{item.name}</h3>
          <span className="font-bold text-primary whitespace-nowrap">₹{item.price}</span>
        </div>

        <div className="mt-4">
          {!line ? (
            <button
              onClick={() => add(item)}
              className="w-full h-10 rounded-xl gradient-brand text-primary-foreground font-semibold shadow-glow hover:opacity-95 active:scale-[0.98] transition"
            >
              Add to order
            </button>
          ) : (
            <div className="flex items-center justify-between h-10 rounded-xl border border-border bg-muted px-1">
              <button
                onClick={() => setQty(item.id, line.qty - 1)}
                className="w-8 h-8 grid place-items-center rounded-lg hover:bg-background transition"
                aria-label="Decrease"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold">{line.qty}</span>
              <button
                onClick={() => setQty(item.id, line.qty + 1)}
                className="w-8 h-8 grid place-items-center rounded-lg hover:bg-background transition"
                aria-label="Increase"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
