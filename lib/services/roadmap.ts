import type { LearningRoadmapState } from "@/lib/types";
import { getLatestRoadmapForUser, regenerateRoadmapForUser } from "@/lib/services/personalization";

export async function getRoadmap(userId: string, onboardingCompletedAt: Date | null): Promise<LearningRoadmapState> {
  if (!onboardingCompletedAt) {
    return {
      status: "onboarding-required",
      roadmap: null,
    };
  }

  const roadmap = await getLatestRoadmapForUser(userId);

  if (!roadmap) {
    return {
      status: "empty",
      roadmap: null,
    };
  }

  return {
    status: "ready",
    roadmap,
  };
}

export async function generateRoadmapDraft(
  userId: string,
  onboardingCompletedAt: Date | null,
  input?: { goal?: string; hoursPerWeek?: number },
) {
  if (!onboardingCompletedAt) {
    throw new Error("Complete onboarding before generating a roadmap.");
  }

  return regenerateRoadmapForUser(userId, input);
}
