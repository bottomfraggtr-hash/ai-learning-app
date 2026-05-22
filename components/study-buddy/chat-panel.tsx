"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

const starterPrompts = [
  "Help me plan a 7-day Prisma learning sprint.",
  "Explain server components vs client components simply.",
  "What should I build next for my chosen stack?",
  "Walk me through setting up a Next.js API route.",
];

export function ChatPanel() {
  const [message, setMessage] = useState("");
  const [provider, setProvider] = useState<string>("fallback");
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      role: "assistant",
      text: "Ask a study question, a project blocker, or a planning question. I'll respond through the app route layer.",
    },
  ]);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, isPending]);

  async function sendMessage(nextMessage: string) {
    setTurns((prev) => [...prev, { role: "user", text: nextMessage }]);
    setMessage("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: nextMessage }),
        });

        const data = (await res.json()) as {
          reply?: string;
          provider?: string;
          error?: string;
        };

        if (!res.ok || !data.reply || !data.provider) {
          throw new Error(data.error ?? "Route failed.");
        }

        setProvider(data.provider);
        setTurns((prev) => [...prev, { role: "assistant", text: data.reply! }]);
      } catch {
        setProvider("fallback");
        setTurns((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "The server route failed. We can debug it together if you want.",
          },
        ]);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!message.trim() || isPending) return;
      void sendMessage(message.trim());
    }
  }

  return (
    <div
      className="grid gap-0 lg:grid-cols-[240px_1fr]"
      style={{ height: "calc(100vh - 13rem)" }}
    >
      <aside
        className="hidden flex-col lg:flex"
        style={{
          borderRight: "1px solid var(--color-line-subtle)",
          paddingRight: "1.5rem",
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-dim)" }}
        >
          Quick prompts
        </p>
        <div className="mt-4 flex flex-col gap-1">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              disabled={isPending}
              className="prompt-btn rounded-lg px-3 py-2.5 text-left text-sm leading-5"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div
          className="mt-auto pt-4"
          style={{ borderTop: "1px solid var(--color-line-subtle)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--color-accent)" }}
            />
            <span className="text-xs" style={{ color: "var(--color-dim)" }}>
              {provider}
            </span>
          </div>
        </div>
      </aside>

      <section
        className="flex flex-col"
        style={{ paddingLeft: "1.5rem" }}
      >
        <div className="flex-1 overflow-y-auto space-y-6 pb-6 pr-1">
          {turns.map((turn, i) => (
            <div
              key={`${turn.role}-${i}`}
              className={`flex gap-3 ${turn.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {turn.role === "assistant" && (
                <div
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{
                    background: "var(--color-accent-subtle)",
                    color: "var(--color-accent)",
                  }}
                >
                  S
                </div>
              )}
              <div
                className={`max-w-[80%] text-sm leading-7 ${
                  turn.role === "user" ? "rounded-2xl px-4 py-2.5 font-medium" : ""
                }`}
                style={
                  turn.role === "user"
                    ? {
                        background: "var(--color-accent)",
                        color: "var(--color-accent-fg)",
                      }
                    : { color: "var(--color-text)" }
                }
              >
                {turn.role === "assistant" ? (
                  <div className="[&>p]:mb-2 [&>p:last-child]:mb-0 [&>h3]:mt-3 [&>h3]:mb-1 [&>h3]:font-semibold [&>ul]:ml-4 [&>ul]:list-disc [&>ul>li]:mb-1 [&>ol]:ml-4 [&>ol]:list-decimal [&>ol>li]:mb-1">
                    <ReactMarkdown>{turn.text}</ReactMarkdown>
                  </div>
                ) : (
                  turn.text
                )}
              </div>
            </div>
          ))}

          {isPending && (
            <div className="flex gap-3">
              <div
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  background: "var(--color-accent-subtle)",
                  color: "var(--color-accent)",
                }}
              >
                S
              </div>
              <div className="flex items-center gap-1.5 pt-2.5">
                {[0, 0.15, 0.3].map((delay, idx) => (
                  <span
                    key={idx}
                    className="h-1.5 w-1.5 rounded-full animate-pulse"
                    style={{
                      background: "var(--color-dim)",
                      animationDelay: `${delay}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form
          className="pt-4"
          style={{ borderTop: "1px solid var(--color-line-subtle)" }}
          onSubmit={(e) => {
            e.preventDefault();
            if (!message.trim() || isPending) return;
            void sendMessage(message.trim());
          }}
        >
          <div className="flex gap-3 items-end">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your roadmap, a bug, or what to learn next..."
              rows={2}
              className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none transition"
              style={{
                border: "1px solid var(--color-line)",
                background: "var(--color-surface)",
                color: "var(--color-text)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-accent)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-line)";
              }}
            />
            <button
              type="submit"
              disabled={isPending || !message.trim()}
              className="shrink-0 rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-accent-fg)",
              }}
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-xs" style={{ color: "var(--color-dim)" }}>
            Enter to send · Shift+Enter for new line
          </p>
        </form>
      </section>
    </div>
  );
}
