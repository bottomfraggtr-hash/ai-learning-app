import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

async function test() {
  process.env.OPENAI_API_KEY = "sk-fake-key-for-test";
  await generateObject({
    model: openai("gpt-4o-mini"),
    system: "test",
    prompt: "test",
    schema: z.object({ result: z.string() })
  });
}

test().catch(console.error);
