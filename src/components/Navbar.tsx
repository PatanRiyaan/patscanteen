// Top navigation bar — used on dashboard/order/bill pages.
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/menu";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, ShoppingBag, LogOut, UtensilsCrossed, User, Shield } from "lucide-react";
import { AccountSwitcher } from "@/components/AccountSwitcher";

export function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <span className="grid place-items-center w-9 h-9 rounded-xl gradient-brand shadow-glow">
            <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
          </span>
          <span>
            Pat's <span className="text-primary">Canteen</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Dark-mode toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid place-items-center w-10 h-10 rounded-xl border border-border bg-card hover:bg-muted transition"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Cart shortcut */}
          <Link
            to="/order"
            className="relative grid place-items-center w-10 h-10 rounded-xl border border-border bg-card hover:bg-muted transition"
          >
            <ShoppingBag className="w-4 h-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-[10px] grid place-items-center gradient-brand text-primary-foreground font-bold">
                {count}
              </span>
            )}
          </Link>

          {/* Profile */}
          <Link
            to="/profile"
            aria-label="Profile"
            className="grid place-items-center w-10 h-10 rounded-xl border border-border bg-card hover:bg-muted transition"
          >
            <User className="w-4 h-4" />
          </Link>

          {/* Admin (only shown to admin accounts) */}
          {user?.isAdmin && (
            <Link
              to="/admin"
              aria-label="Admin"
              className="grid place-items-center w-10 h-10 rounded-xl border border-border bg-card hover:bg-muted transition"
            >
              <Shield className="w-4 h-4 text-primary" />
            </Link>
          )}

          {/* Quick-switch between dummy accounts */}
          <AccountSwitcher />

          {/* User chip */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl border border-border bg-card">
              <div className="w-7 h-7 rounded-lg gradient-brand grid place-items-center text-primary-foreground text-xs font-bold">
                {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <span className="text-sm font-medium">{user.name.split(" ")[0]}</span>
              <button
                onClick={() => { logout(); nav({ to: "/" }); }}
                aria-label="Log out"
                className="ml-1 grid place-items-center w-7 h-7 rounded-lg hover:bg-muted transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
