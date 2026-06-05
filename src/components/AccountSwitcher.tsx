// Account switcher — dropdown listing all dummy accounts so the student
// can hop between profiles without logging out.
// Tweak the trigger styling or dropdown layout here.
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Check, ChevronDown, UserCog } from "lucide-react";

export function AccountSwitcher() {
  const { user, accounts, switchAccount } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch account"
        aria-expanded={open}
        className="flex items-center gap-1.5 h-10 px-2.5 rounded-xl border border-border bg-card hover:bg-muted transition"
      >
        <UserCog className="w-4 h-4" />
        <ChevronDown className={"w-3.5 h-3.5 transition " + (open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-card p-2 z-40 animate-fade-up">
          <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            Switch account
          </div>
          <ul className="max-h-80 overflow-auto">
            {accounts.map((a) => {
              const active = a.email === user.email;
              return (
                <li key={a.email}>
                  <button
                    onClick={() => {
                      if (!active) switchAccount(a.email);
                      setOpen(false);
                    }}
                    className={
                      "w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition " +
                      (active ? "bg-muted" : "hover:bg-muted")
                    }
                  >
                    <div className="w-9 h-9 rounded-lg gradient-brand grid place-items-center text-primary-foreground text-xs font-bold shrink-0">
                      {a.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{a.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {a.hostel} • {a.roomNo}
                      </div>
                    </div>
                    {active && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="px-3 py-2 text-[11px] text-muted-foreground border-t border-border mt-1">
            Demo accounts — password for all: <b>canteen123</b>
          </div>
        </div>
      )}
    </div>
  );
}
