import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/dal";
import { generateRoadmapDraft, getRoadmap } from "@/lib/services/roadmap";
import { roadmapGenerationSchema } from "@/lib/validators";

function normalizeRoadmapError(error: unknown) {
  if (error instanceof Error && error.name === "AiConfigurationError") {
    return NextResponse.json(
      {
        error: "Add OPENAI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY before generating roadmaps.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : "Unable to generate the roadmap.",
    },
    { status: 400 },
  );
}

export async function GET() {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const roadmap = await getRoadmap(user.id, user.onboardingCompletedAt);
  return NextResponse.json(roadmap);
}

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = roadmapGenerationSchema.safeParse({
    goal: json.goal,
    hoursPerWeek: json.hoursPerWeek ? Number(json.hoursPerWeek) : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const roadmap = await generateRoadmapDraft(user.id, user.onboardingCompletedAt, parsed.data);
    return NextResponse.json(roadmap);
  } catch (error) {
    return normalizeRoadmapError(error);
  }
}
