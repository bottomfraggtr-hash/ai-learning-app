import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { PageShell } from "@/components/ui/page-shell";
import { requireUser } from "@/lib/dal";
import { getOnboardingState } from "@/lib/services/personalization";

export default async function OnboardingPage() {
  const user = await requireUser();

  if (user.onboardingCompletedAt) {
    redirect("/dashboard");
  }

  const onboardingState = await getOnboardingState(user.id);

  return (
    <PageShell
      eyebrow="Onboarding"
      title="Let’s map your current level before we generate the right learning path."
      description="This flow stores your interests, background, preferred stack, and assessment results in the database so the roadmap, recommendations, and dashboard are all based on real data."
    >
      <OnboardingWizard initialState={onboardingState} />
    </PageShell>
  );
}
