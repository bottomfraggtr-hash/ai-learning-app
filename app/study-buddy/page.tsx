import { ChatPanel } from "@/components/study-buddy/chat-panel";
import { requireUser } from "@/lib/dal";

export default async function StudyBuddyPage() {
  await requireUser();

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
      <div
        className="mb-6 flex items-baseline justify-between"
        style={{ borderBottom: "1px solid var(--color-line-subtle)", paddingBottom: "1.25rem" }}
      >
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
            Study Buddy
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--color-muted)" }}>
            AI-assisted learning routed through the server. Your keys stay server-side.
          </p>
        </div>
      </div>
      <ChatPanel />
    </main>
  );
}
