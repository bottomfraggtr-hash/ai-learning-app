import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/dal";
import { getStudyBuddyReply } from "@/lib/services/study-buddy";
import { studyBuddyInputSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = studyBuddyInputSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const reply = await getStudyBuddyReply(parsed.data.message, {
    name: user.name,
    targetRole: user.learnerProfile?.targetRole ?? null,
    profileSummary: user.learnerProfile?.profileSummary ?? null,
    preferredStack: user.learnerProfile?.preferredStack ?? [],
    primaryInterest: user.learnerProfile?.primaryInterest ?? undefined,
  });
  return NextResponse.json(reply);
}
