import { redirect } from "next/navigation";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentUser } from "@/lib/dal";
import { getSignedInDestination } from "@/lib/navigation";

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getSignedInDestination(user.onboardingCompletedAt));
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl px-6 py-16 sm:px-10 lg:px-12">
      <div className="grid w-full gap-16 lg:grid-cols-[1fr_420px] lg:gap-24">
        <div className="flex flex-col justify-center">
          <Link
            href="/"
            className="nav-link mb-10 inline-flex w-fit items-center gap-2 text-sm"
          >
            <span style={{ color: "var(--color-dim)" }}>←</span>
            Back to home
          </Link>
          <p className="text-sm font-medium" style={{ color: "var(--color-accent-dim)" }}>
            Get started
          </p>
          <h1
            className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
            style={{ color: "var(--color-text)" }}
          >
            Create your account, then we'll build your roadmap.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-7" style={{ color: "var(--color-muted)" }}>
            After signup you'll complete a short onboarding assessment. We use that to generate a personalized web-dev learning path.
          </p>
          <div className="mt-8 space-y-3">
            {["Real Postgres-backed profile", "AI-generated assessment and roadmap", "Course picks matched to your stack"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm" style={{ color: "var(--color-muted)" }}>
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: "var(--color-accent)" }}
                />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-xl p-8"
          style={{
            border: "1px solid var(--color-line-subtle)",
            background: "var(--color-surface)",
          }}
        >
          <SignupForm />
        </div>
      </div>
    </main>
  );
}
