import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/dal";
import { getSignedInDestination } from "@/lib/navigation";

export default async function LoginPage() {
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
            Welcome back
          </p>
          <h1
            className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
            style={{ color: "var(--color-text)" }}
          >
            Sign in to continue your learning plan.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-7" style={{ color: "var(--color-muted)" }}>
            Your roadmap, assessment results, and recommendations are waiting.
          </p>
        </div>

        <div
          className="rounded-xl p-8"
          style={{
            border: "1px solid var(--color-line-subtle)",
            background: "var(--color-surface)",
          }}
        >
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
