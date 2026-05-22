import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { PageShell } from "@/components/ui/page-shell";
import { getCurrentUser } from "@/lib/dal";
import { getSignedInDestination } from "@/lib/navigation";

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getSignedInDestination(user.onboardingCompletedAt));
  }

  return (
    <PageShell
      eyebrow="Sign Up"
      title="Create your account, then we’ll shape the learning path around you."
      description="The account step stays short. Right after signup, you’ll answer onboarding questions, take an AI-generated assessment, and receive a personalized web-development roadmap."
    >
      <section className="mx-auto w-full max-w-xl rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
        <SignupForm />
      </section>
    </PageShell>
  );
}
