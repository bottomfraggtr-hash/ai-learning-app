import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import type { StudyBuddyResponse } from "@/lib/types";

function buildFallbackReply(message: string, context?: { preferredStack?: string[] }) {
  const stackNote =
    context?.preferredStack?.length
      ? ` based on your ${context.preferredStack.join(", ")} path`
      : "";

  return `Here is a grounded next step for "${message}"${stackNote}: break it into one concept to learn, one small feature to ship, and one reflection note to capture after practice.`;
}

export async function getStudyBuddyReply(
  message: string,
  context?: {
    name?: string;
    targetRole?: string | null;
    profileSummary?: string | null;
    preferredStack?: string[];
    primaryInterest?: string;
  },
): Promise<StudyBuddyResponse> {
  const domain = context?.primaryInterest ?? "web-development";
  const system = `You are a calm study buddy for a ${domain} learner.
Learner name: ${context?.name ?? "there"}.
Target role: ${context?.targetRole ?? "not set"}.
Preferred stack: ${context?.preferredStack?.join(", ") || "not set"}.
Learner profile summary: ${context?.profileSummary ?? "not available"}.
Be practical, encouraging, specific, and concise.`;

  if (process.env.OPENAI_API_KEY) {
    try {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        system,
        prompt: message,
      });

      return {
        reply: result.text,
        provider: "openai",
      };
    } catch {
      // Fall back below.
    }
  }

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      const result = await generateText({
        model: google("gemini-2.5-flash"),
        system,
        prompt: message,
      });

      return {
        reply: result.text,
        provider: "google",
      };
    } catch {
      // Fall back below.
    }
  }

  return {
    reply: buildFallbackReply(message, context),
    provider: "fallback",
  };
}
