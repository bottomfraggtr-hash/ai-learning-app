import { proactiveSuggestionSchema } from "./lib/services/proactive-agent";

try {
  const badSuggestion = {
    type: "encouragement",
    message: "A".repeat(301), // over 300 characters
  };
  proactiveSuggestionSchema.parse(badSuggestion);
  console.log("BAD SUGGESTION PASSED VALIDATION (message length)");
} catch (e) {
  console.log("BAD SUGGESTION FAILED VALIDATION (Safe: message length)");
}

try {
  const badType = {
    type: "insult",
    message: "You suck.",
  };
  proactiveSuggestionSchema.parse(badType);
  console.log("BAD TYPE PASSED VALIDATION");
} catch (e) {
  console.log("BAD TYPE FAILED VALIDATION (Safe: type)");
}
