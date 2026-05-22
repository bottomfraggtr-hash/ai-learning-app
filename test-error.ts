import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

async function test() {
  process.env.OPENAI_API_KEY = "sk-fake-key-for-test";
  try {
    await generateObject({
      model: openai("gpt-4o-mini"),
      system: "test",
      prompt: "test",
      schema: z.object({ result: z.string() })
    });
  } catch (e) {
    if (e instanceof Error) {
      console.log("Error instance caught! Message length:", e.message.length);
      console.log("Error message:", e.message);
    }
  }
}

test();
