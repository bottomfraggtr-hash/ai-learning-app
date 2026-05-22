import { generateObject } from "ai";
import { z } from "zod";
import { getAiModel } from "./personalization";

export const RefactoringReviewSchema = z.object({
  reviewSummary: z.string().describe("Overall impression and main areas for improvement"),
  comments: z.array(z.object({
    lineStart: z.number().int().min(1),
    lineEnd: z.number().int().min(1),
    severity: z.enum(["low", "medium", "high", "nitpick"]),
    issue: z.string().describe("Description of the problem"),
    suggestion: z.string().describe("How to fix it")
  }).refine(data => data.lineStart <= data.lineEnd, {
    message: "lineStart must be less than or equal to lineEnd"
  })).max(10),
  refactoredCode: z.string().describe("The fully refactored version of the code"),
  conceptsToLearn: z.array(z.string()).max(3)
});

export type RefactoringReview = z.infer<typeof RefactoringReviewSchema>;

function buildFallbackReview(code: string): RefactoringReview {
  return {
    reviewSummary: "Fallback summary: Could not generate a review due to missing API keys.",
    comments: [],
    refactoredCode: code,
    conceptsToLearn: []
  };
}

export async function getCodeReview(
  code: string,
  language: string,
  focusArea?: string,
  context?: {
    level?: string;
    preferredStack?: string[];
  }
): Promise<{ review: RefactoringReview; provider: string }> {
  const system = `You are an expert Senior Engineer and a supportive Code Refactoring Coach.
The learner's self-rated level is: ${context?.level || "unknown"}.
Their preferred stack is: ${context?.preferredStack?.join(", ") || "unknown"}.
Review their submitted ${language} code. Focus on: ${focusArea || "general best practices, clean code, and performance"}.
Provide line-specific feedback (line numbers should correspond to the exact lines in their submitted code).
If their submitted code is too short or doesn't have many issues, provide positive reinforcement and minor nitpicks. Keep the review tailored to their level. Do not overcomplicate the feedback for junior developers.`;

  const prompt = `Please review the following code:
\`\`\`${language}
${code}
\`\`\``;

  try {
    const { model, provider } = getAiModel();

    const result = await generateObject({
      model,
      system,
      prompt,
      schema: RefactoringReviewSchema,
    });

    return {
      review: result.object,
      provider,
    };
  } catch {
    return {
      review: buildFallbackReview(code),
      provider: "fallback",
    };
  }
}
