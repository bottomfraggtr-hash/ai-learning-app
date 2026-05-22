import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/dal";
import { evaluationSubmissionSchema } from "@/lib/validators";
import { evaluateSubmission } from "@/lib/services/evaluator";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const user = await getApiUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsedBody = evaluationSubmissionSchema.parse(body);

    const result = await evaluateSubmission(user.id, parsedBody.stepId, parsedBody.submission);

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
