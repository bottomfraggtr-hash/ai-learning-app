import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/dal";
import { getCareerTracks } from "@/lib/services/career";

export async function GET() {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const careers = await getCareerTracks(user.id, user.onboardingCompletedAt);
  return NextResponse.json(careers);
}
