import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/dal";
import { getCodeReview } from "@/lib/services/refactoring-coach";
import { refactoringCoachInputSchema } from "@/lib/validators";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = refactoringCoachInputSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { code, language, focusArea } = parsed.data;

  try {
    const { review, provider } = await getCodeReview(code, language, focusArea, {
      level: user.learnerProfile?.selfRatedLevel ?? undefined,
      preferredStack: user.learnerProfile?.preferredStack ?? [],
    });

    // Save to Prisma
    await prisma.codeReviewAttempt.create({
      data: {
        originalCode: code,
        language: language,
        focusArea: focusArea,
        reviewSummary: review.reviewSummary,
        comments: review.comments,
        refactoredCode: review.refactoredCode,
        conceptsToLearn: review.conceptsToLearn,
        userId: user.id,
      },
    });

    return NextResponse.json({ review, provider });
  } catch (error) {
    console.error("Refactoring Coach Error:", error);
    return NextResponse.json(
      { error: "Failed to generate code review." },
      { status: 500 }
    );
  }
}
