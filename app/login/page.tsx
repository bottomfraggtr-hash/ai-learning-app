import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { PageShell } from "@/components/ui/page-shell";
import { getCurrentUser } from "@/lib/dal";
import { getSignedInDestination } from "@/lib/navigation";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getSignedInDestination(user.onboardingCompletedAt));
  }

  return (
    <PageShell
      eyebrow="Login"
      title="Sign back in to continue your learning plan."
      description="Use your email and password to reach your personalized roadmap, recommendations, and AI-guided study flow."
    >
      <section className="mx-auto w-full max-w-xl rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
        <LoginForm />
      </section>
    </PageShell>
  );
}
