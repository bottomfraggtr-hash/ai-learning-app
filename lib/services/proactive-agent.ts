import { generateObject } from "ai";
import { z } from "zod";
import { getAiModel } from "./personalization";
import type { DashboardSnapshot, LearningRoadmap } from "@/lib/types";

export const proactiveSuggestionSchema = z.object({
  type: z.enum(["encouragement", "mini-challenge", "resource", "review"]),
  message: z.string().max(300),
  actionLabel: z.string().optional(),
  actionUrl: z.string().optional(),
}).refine(data => !data.actionLabel || data.actionUrl, {
  message: "actionUrl is required if actionLabel is provided",
  path: ["actionUrl"]
});

export type ProactiveSuggestion = z.infer<typeof proactiveSuggestionSchema>;

export async function generateProactiveSuggestion(
  profile: { targetRole?: string; preferredStack?: string[]; primaryInterest?: string } | null | undefined,
  progress: DashboardSnapshot,
  roadmap: LearningRoadmap | null | undefined,
  chatHistory: { role: string; text: string }[] = []
): Promise<ProactiveSuggestion> {
  const domain = profile?.primaryInterest ?? "web-development";
  const system = `You are a proactive study buddy for a ${domain} learner.
Review the user's progress snapshot, active roadmap steps, and recent chat history.
If focus is low, offer a review. If they are on a streak, encourage them.
Provide a short, actionable tip.
Keep the message concise (max 300 characters).`;

  let profileData = "Not available";
  if (profile) {
    profileData = JSON.stringify({
      targetRole: profile.targetRole,
      preferredStack: profile.preferredStack,
    });
  }

  let activeSteps = "Not available";
  if (roadmap && roadmap.steps) {
    const steps = roadmap.steps.filter((s) => s.status === "active");
    if (steps.length > 0) {
      activeSteps = JSON.stringify(steps);
    }
  }

  const prompt = `
User Profile: ${profileData}
Progress Snapshot: ${JSON.stringify(progress)}
Active Roadmap Steps: ${activeSteps}
Recent Chat History: ${JSON.stringify(chatHistory.slice(-5))}

Generate a proactive suggestion based on this data.`;

  const fallback: ProactiveSuggestion = {
    type: "encouragement",
    message: "Keep up the great work! You're making progress every day.",
  };

  if (progress.status === "ready") {
    if (progress.focusScore < 50) {
      fallback.type = "review";
      fallback.message = "Your focus seems a bit low. Want to review some foundational concepts?";
    } else if (progress.streak > 2) {
      fallback.type = "encouragement";
      fallback.message = `You're on a ${progress.streak}-day streak! Keep building momentum.`;
    }
  }

  try {
    const { model } = getAiModel();
    const result = await generateObject({
      model,
      schema: proactiveSuggestionSchema,
      system,
      prompt,
    });
    return result.object;
  } catch {
    // Fall back below.
  }

  return fallback;
}
