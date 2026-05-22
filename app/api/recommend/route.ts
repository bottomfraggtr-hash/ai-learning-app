import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/dal";
import { getRecommendations } from "@/lib/services/recommendations";

export async function GET() {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recommendations = await getRecommendations(user.id, user.onboardingCompletedAt);
  return NextResponse.json(recommendations);
}
