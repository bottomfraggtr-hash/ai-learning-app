import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/dal";
import { getDashboardSnapshot } from "@/lib/services/progress";

export async function GET() {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getDashboardSnapshot(user.id, user.onboardingCompletedAt);
  return NextResponse.json(snapshot);
}
