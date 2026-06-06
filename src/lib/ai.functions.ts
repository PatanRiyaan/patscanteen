// AI chatbot server function — calls Lovable AI Gateway with the user's
// messages plus the current menu as context.
// 👉 Tweak the SYSTEM prompt to change the assistant's personality.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  category: z.enum(["food", "beverage"]),
  tag: z.string().optional(),
});

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
  menu: z.array(ItemSchema).min(1).max(60),
  budget: z.number().int().min(0).max(5000).optional(),
});

const SYSTEM = `You are "Patty", the friendly recommendation bot for Pat's Canteen — a hostel canteen for students in India. You help students decide what to order.

Rules:
- Be concise and warm. Use 2-4 short sentences, then a bullet list of recommended items.
- Only ever recommend items from the MENU JSON given to you. Never invent items.
- Show prices in ₹ and respect the student's budget when given (sum of recommended items must be ≤ budget).
- When asked for "best pick today", suggest 1-2 highlight items (prefer ones tagged "Chef's pick" or "Hostel favourite").
- When budget is given, suggest a balanced combo (usually 1 food + 1 beverage) that fits the budget and explain why.
- Mention the total cost at the end when recommending a combo.
- Markdown bullets allowed, no images.
- IMPORTANT: At the very end of your reply, append a machine-readable line of the form: <PICKS>id1,id2,id3</PICKS> listing the IDs of items you recommended (only IDs from the menu). This line will be hidden from the user.`;

export const recommendOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { reply: "Sorry, the recommendation service isn't configured.", pickIds: [] as string[] };
    }

    // If the user gave a budget, only show items that individually fit it —
    // this keeps the prompt small AND prevents over-budget suggestions.
    const visibleMenu = data.budget
      ? data.menu.filter((i) => i.price <= data.budget!)
      : data.menu;

    if (data.budget && visibleMenu.length === 0) {
      return {
        reply: `Nothing on the menu is under ₹${data.budget} right now — try bumping the budget a bit.`,
        pickIds: [],
      };
    }

    const menuText = visibleMenu
      .map((i) => `- [${i.id}] ${i.name} (${i.category}, ₹${i.price}${i.tag ? `, ${i.tag}` : ""})`)
      .join("\n");

    const contextLine = data.budget
      ? `The student's budget is ₹${data.budget}. Every recommendation must be in the menu above and the total of your picks must be ≤ ₹${data.budget}.`
      : "";

    const messages = [
      { role: "system" as const, content: `${SYSTEM}\n\nMENU:\n${menuText}\n\n${contextLine}` },
      ...data.messages,
    ];

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
        }),
      });

      if (res.status === 429) {
        return { reply: "Whoa, lots of orders right now! Try again in a few seconds.", pickIds: [] };
      }
      if (res.status === 402) {
        return { reply: "The recommendation service is out of credits — please ask the canteen admin to top up.", pickIds: [] };
      }
      if (!res.ok) {
        const t = await res.text();
        console.error("AI gateway error", res.status, t);
        return { reply: "Hmm, I couldn't think of anything just now. Try again?", pickIds: [] };
      }

      const json = await res.json();
      const raw: string =
        json?.choices?.[0]?.message?.content ?? "Sorry, no suggestion came through.";

      // Pull the <PICKS>…</PICKS> tag out so we can render a "Order combo" button.
      const match = raw.match(/<PICKS>([^<]*)<\/PICKS>/i);
      const validIds = new Set(visibleMenu.map((i) => i.id));
      const pickIds = match
        ? match[1].split(",").map((s) => s.trim()).filter((id) => validIds.has(id))
        : [];
      const reply = raw.replace(/<PICKS>[^<]*<\/PICKS>/i, "").trim();

      return { reply, pickIds };
    } catch (err) {
      console.error("recommendOrder failed", err);
      return { reply: "The recommendation service is unreachable right now.", pickIds: [] };
    }
  });

