// Floating chatbot — "Patty" helps students decide what to order.
// Two flows:
//   1) Free chat ("What's the best pick today?")
//   2) "Don't know what to order, we got you!" → asks budget → recommends from items ≤ budget.
// Each assistant reply may include a list of suggested item IDs. We render an
// "Order this combo" button that drops them into the cart and jumps to /order.
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { Bot, X, Send, Sparkles, Loader2, MessageCircle, ShoppingBag } from "lucide-react";
import { useCart, type Item } from "@/lib/menu";
import { recommendOrder } from "@/lib/ai.functions";

type Msg = {
  role: "user" | "assistant";
  content: string;
  picks?: Item[];   // resolved menu items for "Order combo" CTA
  total?: number;
};

export function Chatbot() {
  const { food, beverages, add, clear } = useCart();
  const callAi = useServerFn(recommendOrder);
  const nav = useNavigate();

  const [open, setOpen] = useState(false);
  // Modes: chat | budget (waiting for a number)
  const [mode, setMode] = useState<"chat" | "budget">("chat");
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hey there! I'm **Patty** 🍱 — ask me _\"What's the best pick today?\"_ or tap the helper button below.",
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, busy]);

  const menu: Item[] = [...food, ...beverages];

  // Send a turn to the model and append the reply (+ resolved picks).
  const ask = async (newMessages: Msg[], budgetArg?: number) => {
    setBusy(true);
    try {
      // Strip non-API fields from history before sending.
      const apiMessages = newMessages.map(({ role, content }) => ({ role, content }));
      const { reply, pickIds } = await callAi({
        data: { messages: apiMessages, menu, budget: budgetArg },
      });
      const picks = pickIds
        .map((id) => menu.find((m) => m.id === id))
        .filter((x): x is Item => Boolean(x));
      const total = picks.reduce((s, p) => s + p.price, 0);
      setMessages([
        ...newMessages,
        { role: "assistant", content: reply, picks, total: picks.length ? total : undefined },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, I hit a snag. Try again in a moment." },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");

    if (mode === "budget") {
      const parsed = parseInt(text.replace(/[^\d]/g, ""), 10);
      const next: Msg[] = [...messages, { role: "user", content: text }];
      setMessages(next);
      if (!parsed || parsed < 10) {
        setMessages([
          ...next,
          { role: "assistant", content: "Please share a budget in ₹ (e.g. 150)." },
        ]);
        return;
      }
      setMode("chat");
      setBudget(parsed);
      await ask(
        [...next, { role: "user", content: `Pick the best combo for ₹${parsed}.` }],
        parsed,
      );
      return;
    }

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    await ask(next, budget);
  };

  const todaysPick = async () => {
    if (busy) return;
    const next: Msg[] = [
      ...messages,
      { role: "user", content: "What's the best pick today?" },
    ];
    setMessages(next);
    await ask(next, budget);
  };

  const helpMeChoose = () => {
    if (busy) return;
    setMode("budget");
    setMessages((p) => [
      ...p,
      { role: "user", content: "Don't know what to order, we got you!" },
      {
        role: "assistant",
        content:
          "Awesome — what's your budget today? Just type an amount in ₹ (e.g. **120** or **₹200**).",
      },
    ]);
  };

  // One-tap: replace cart with Patty's suggested combo and go to /order.
  const orderCombo = (picks: Item[]) => {
    clear();
    picks.forEach((p) => add(p));
    setOpen(false);
    nav({ to: "/order" });
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chatbot"
          className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-40 grid place-items-center w-14 h-14 rounded-2xl gradient-brand text-primary-foreground shadow-glow hover:scale-105 active:scale-95 transition animate-fade-up"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div className="fixed inset-x-2 bottom-2 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[380px] z-40 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-glow flex flex-col max-h-[80vh] animate-fade-up">
          <header className="flex items-center gap-2 p-3 border-b border-border">
            <span className="grid place-items-center w-9 h-9 rounded-xl gradient-brand text-primary-foreground">
              <Bot className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-bold leading-tight">Patty</div>
              <div className="text-[11px] text-muted-foreground">
                {budget ? `Budget set: ₹${budget}` : "Your canteen pal"}
              </div>
            </div>
            {budget && (
              <button
                onClick={() => setBudget(undefined)}
                className="text-[10px] font-semibold px-2 h-7 rounded-md border border-border hover:bg-muted"
              >
                Clear ₹
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
              className="w-9 h-9 grid place-items-center rounded-lg hover:bg-muted transition"
            >
              <X className="w-4 h-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed " +
                    (m.role === "user"
                      ? "gradient-brand text-primary-foreground"
                      : "bg-muted text-foreground")
                  }
                >
                  {m.role === "assistant" ? (
                    <>
                      <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                      {m.picks && m.picks.length > 0 && (
                        <div className="mt-2 rounded-xl border border-border bg-card/80 p-2">
                          <ul className="text-xs space-y-0.5">
                            {m.picks.map((p) => (
                              <li key={p.id} className="flex justify-between gap-3">
                                <span className="truncate">• {p.name}</span>
                                <span className="font-semibold">₹{p.price}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border text-xs">
                            <span className="text-muted-foreground">Total</span>
                            <b>₹{m.total}</b>
                          </div>
                          <button
                            onClick={() => orderCombo(m.picks!)}
                            className="mt-2 w-full inline-flex items-center justify-center gap-1.5 h-8 rounded-lg gradient-brand text-primary-foreground text-xs font-bold shadow-glow"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" /> Order this combo
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Patty is thinking…
              </div>
            )}
          </div>

          <div className="px-3 pt-2 flex flex-wrap gap-2 border-t border-border">
            <button
              onClick={helpMeChoose}
              disabled={busy}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 h-8 rounded-full gradient-brand text-primary-foreground shadow-glow disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" /> Don't know what to order, we got you!
            </button>
            <button
              onClick={todaysPick}
              disabled={busy}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 h-8 rounded-full border border-border bg-card hover:bg-muted disabled:opacity-50"
            >
              Best pick today
            </button>
          </div>

          <form onSubmit={submit} className="p-3 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "budget" ? "Your budget in ₹…" : "Ask Patty anything…"}
              className="flex-1 h-10 rounded-xl border border-border bg-background px-3 text-sm"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="grid place-items-center w-10 h-10 rounded-xl gradient-brand text-primary-foreground shadow-glow disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
