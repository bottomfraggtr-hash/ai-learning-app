import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/dal";
import { saveLearnerProfile } from "@/lib/services/personalization";
import { onboardingProfileJsonSchema, onboardingProfileSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.onboardingCompletedAt) {
    return NextResponse.json({ error: "Onboarding is already complete." }, { status: 409 });
  }

  const json = await request.json();
  const baseParsed = onboardingProfileJsonSchema.safeParse(json);

  if (!baseParsed.success) {
    return NextResponse.json({ error: baseParsed.error.flatten() }, { status: 400 });
  }

  const parsed = onboardingProfileSchema.safeParse(baseParsed.data);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const profile = await saveLearnerProfile(user.id, {
    ...parsed.data,
  });

  return NextResponse.json(profile);
}
