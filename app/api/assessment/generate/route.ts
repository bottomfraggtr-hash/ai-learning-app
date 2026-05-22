import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/dal";
import { generateAssessmentForUser } from "@/lib/services/personalization";
import { assessmentGenerateSchema } from "@/lib/validators";

function normalizeAssessmentError(error: unknown) {
  if (error instanceof Error && error.name === "AiConfigurationError") {
    return NextResponse.json(
      {
        error: "Add OPENAI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY before generating assessments.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : "Unable to generate the assessment.",
    },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = assessmentGenerateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const assessment = await generateAssessmentForUser(user.id, parsed.data.refresh ?? false);
    return NextResponse.json(assessment);
  } catch (error) {
    return normalizeAssessmentError(error);
  }
}
