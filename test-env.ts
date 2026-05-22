import { config } from "dotenv";
config();
import { evaluateSubmission } from "./lib/services/evaluator";
import { generateProactiveSuggestion } from "./lib/services/proactive-agent";
import { getCodeReview } from "./lib/services/refactoring-coach";

async function main() {
  console.log("Checking environment...");
  console.log("OPENAI_API_KEY:", !!process.env.OPENAI_API_KEY);
  console.log("GOOGLE_GENERATIVE_AI_API_KEY:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}

main().catch(console.error);
