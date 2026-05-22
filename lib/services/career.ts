import type { CareerState } from "@/lib/types";
import { getCareerSuggestionsForUser } from "@/lib/services/personalization";

export async function getCareerTracks(userId: string, onboardingCompletedAt: Date | null): Promise<CareerState> {
  if (!onboardingCompletedAt) {
    return {
      status: "onboarding-required",
      items: [],
    };
  }

  const items = await getCareerSuggestionsForUser(userId);

  if (items.length === 0) {
    return {
      status: "empty",
      items: [],
    };
  }

  return {
    status: "ready",
    items,
  };
}
