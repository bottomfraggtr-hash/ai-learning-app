export function getSignedInDestination(onboardingCompletedAt: Date | string | null) {
  return onboardingCompletedAt ? "/dashboard" : "/onboarding";
}
