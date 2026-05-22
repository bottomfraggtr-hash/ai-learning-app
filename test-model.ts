import { getCodeReview } from "./lib/services/refactoring-coach";
import { openai } from "@ai-sdk/openai";

async function test() {
  process.env.OPENAI_API_KEY = "sk-fake-key-for-test";
  try {
    const res = await getCodeReview("console.log('test');", "javascript");
    console.log("Result:", res.provider);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
