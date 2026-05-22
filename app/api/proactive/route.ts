import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiUser } from "@/lib/dal";
import { getDashboardSnapshot } from "@/lib/services/progress";
import { getLatestRoadmapForUser } from "@/lib/services/personalization";
import { generateProactiveSuggestion } from "@/lib/services/proactive-agent";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let chatHistory: { role: string; text: string }[] = [];
  try {
    const json = await request.json();
    const parsed = z.object({
      chatHistory: z.array(z.object({ role: z.string(), text: z.string() })).optional()
    }).safeParse(json);
    if (parsed.success && parsed.data.chatHistory) {
      chatHistory = parsed.data.chatHistory;
    }
  } catch {
    // Ignore error if body is empty or invalid
  }

  try {
    const progress = await getDashboardSnapshot(user.id, user.onboardingCompletedAt);
    const roadmap = await getLatestRoadmapForUser(user.id);

    const suggestion = await generateProactiveSuggestion(
      user.learnerProfile,
      progress,
      roadmap,
      chatHistory
    );

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error("Proactive route error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}
