import Link from "next/link";

const features = [
  {
    label: "Dashboard",
    href: "/dashboard",
    description: "Progress snapshots, next actions, and learning momentum in one focused view.",
  },
  {
    label: "Roadmap",
    href: "/roadmap",
    description: "A personalized learning path generated from your onboarding answers and assessment results.",
  },
  {
    label: "Study Buddy",
    href: "/study-buddy",
    description: "A server-side AI chat aware of your target role and current stack.",
  },
  {
    label: "Recommendations",
    href: "/recommendations",
    description: "Database-backed courses and practice blocks matched to your profile.",
  },
];

const stackItems = [
  "App Router pages with protected server components",
  "Prisma-backed user, learner profile, and assessment models",
  "AI-generated roadmaps and scoring with explicit setup states",
  "Course catalog with per-learner recommendation engine",
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-12">
        <div className="max-w-3xl">
          <p
            className="mb-5 text-sm font-medium"
            style={{ color: "var(--color-accent-dim)" }}
          >
            AI Learning Studio
          </p>
          <h1
            className="text-5xl font-semibold tracking-tight leading-[1.08] sm:text-6xl"
            style={{ color: "var(--color-text)" }}
          >
            Build real skills.
            <br />
            Track real progress.
          </h1>
          <p
            className="mt-6 max-w-xl text-lg leading-8"
            style={{ color: "var(--color-muted)" }}
          >
            Saved accounts, Postgres-backed profiles, AI-generated assessments, and a roadmap
            tuned to the stack you actually want to learn.
          </p>
          <div className="mt-10 flex items-center gap-5">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-lg px-6 py-3 text-sm font-semibold transition hover:opacity-90"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-accent-fg)",
              }}
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium transition"
              style={{ color: "var(--color-muted)" }}
            >
              Already have one? Sign in
            </Link>
          </div>
        </div>

        <div className="mt-24" style={{ borderTop: "1px solid var(--color-line-subtle)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-0 overflow-hidden rounded-xl" style={{ border: "1px solid var(--color-line-subtle)" }}>
            {features.map(({ label, href, description }, i) => (
              <Link
                key={label}
                href={href}
                className="feature-cell p-8"
                style={{
                  borderRight: i < features.length - 1 ? "1px solid var(--color-line-subtle)" : undefined,
                }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-accent)" }}
                >
                  {label}
                </span>
                <p
                  className="mt-3 text-sm leading-6"
                  style={{ color: "var(--color-muted)" }}
                >
                  {description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <p
              className="mb-5 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-dim)" }}
            >
              What's inside
            </p>
            <div className="space-y-3">
              {stackItems.map((item, i) => (
                <div
                  key={item}
                  className="flex items-start gap-4 text-sm leading-6"
                  style={{ color: "var(--color-muted)" }}
                >
                  <span
                    className="mt-0.5 shrink-0 text-xs font-mono"
                    style={{ color: "var(--color-dim)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl p-8"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-line-subtle)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-dim)" }}
            >
              Get started
            </p>
            <p
              className="mt-4 text-sm leading-7"
              style={{ color: "var(--color-muted)" }}
            >
              Create an account, complete the onboarding assessment, and the platform generates
              a personalized roadmap, course recommendations, and career direction based on your
              actual starting point.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Link
                href="/signup"
                className="rounded-lg px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-accent-fg)",
                }}
              >
                Create account
              </Link>
              <Link
                href="/study-buddy"
                className="text-sm"
                style={{ color: "var(--color-muted)" }}
              >
                Try Study Buddy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
