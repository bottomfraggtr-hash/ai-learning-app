import { generateObject } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAiModel } from "@/lib/services/personalization";

const evaluationOutcomeSchema = z.object({
  isPassing: z.boolean(),
  feedback: z.string().min(10).max(1000),
  confidenceScore: z.number().int().min(0).max(100),
});

export async function evaluateSubmission(userId: string, stepId: string, submission: string) {
  const step = await prisma.roadmapStep.findFirst({
    where: {
      id: stepId,
      roadmap: {
        userId,
      },
    },
    include: {
      roadmap: true,
    },
  });

  if (!step) {
    throw new Error("Roadmap step not found or unauthorized.");
  }

  const { model } = getAiModel();

  const result = await generateObject({
    model,
    schema: evaluationOutcomeSchema,
    system: "You are an expert programming instructor evaluating a student's code submission or answer. Provide constructive feedback, a boolean indicating if it passes the step requirements, and your confidence score (0-100).",
    prompt: JSON.stringify({
      task: "Evaluate student submission for a roadmap step",
      stepTitle: step.title,
      stepDescription: step.description,
      submission: submission,
    }),
  });

  const { isPassing, feedback, confidenceScore } = result.object;

  const evaluationResult = await prisma.evaluationResult.create({
    data: {
      userId,
      stepId,
      submission,
      isPassing,
      feedback,
      confidenceScore,
    },
  });

  if (isPassing && step.status !== "done") {
    await prisma.roadmapStep.update({
      where: { id: stepId },
      data: { status: "done" },
    });
  }

  return evaluationResult;
}
