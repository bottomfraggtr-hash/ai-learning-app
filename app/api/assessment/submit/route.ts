import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/dal";
import { submitAssessmentForUser } from "@/lib/services/personalization";
import { assessmentSubmitSchema } from "@/lib/validators";

function normalizeAssessmentError(error: unknown) {
  if (error instanceof Error && error.name === "AiConfigurationError") {
    return NextResponse.json(
      {
        error: "Add OPENAI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY before scoring assessments.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : "Unable to submit the assessment.",
    },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = assessmentSubmitSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await submitAssessmentForUser(user.id, parsed.data.attemptId, parsed.data.answers);
    return NextResponse.json(result);
  } catch (error) {
    console.error("ASSESSMENT SUBMIT ERROR:", error);
    return normalizeAssessmentError(error);
  }
}
