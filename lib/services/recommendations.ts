import type { RecommendationsState } from "@/lib/types";
import { getRecommendationListForUser } from "@/lib/services/personalization";

export async function getRecommendations(userId: string, onboardingCompletedAt: Date | null): Promise<RecommendationsState> {
  if (!onboardingCompletedAt) {
    return {
      status: "onboarding-required",
      items: [],
    };
  }

  const items = await getRecommendationListForUser(userId);

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
