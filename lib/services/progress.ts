import { prisma } from "@/lib/db";
import type { DashboardSnapshot } from "@/lib/types";

export async function getDashboardSnapshot(userId: string, onboardingCompletedAt: Date | null): Promise<DashboardSnapshot> {
  if (!onboardingCompletedAt) {
    return {
      status: "onboarding-required",
      nextAction: "Complete onboarding to generate your first assessment, roadmap, and course plan.",
    };
  }

  const snapshot = await prisma.progressSnapshot.findFirst({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!snapshot) {
    return {
      status: "ready",
      streak: 0,
      completedSteps: 0,
      weeklyHours: 0,
      focusScore: 0,
      nextAction: "Generate your first roadmap refresh when you want to rebalance the plan.",
    };
  }

  return {
    status: "ready",
    streak: snapshot.streak,
    completedSteps: snapshot.completedSteps,
    weeklyHours: snapshot.weeklyHours,
    focusScore: snapshot.focusScore,
    nextAction: snapshot.nextAction,
  };
}
