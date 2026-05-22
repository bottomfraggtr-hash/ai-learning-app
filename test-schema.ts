import { z } from "zod";
import { RefactoringReviewSchema } from "./lib/services/refactoring-coach";

try {
  const badReview = {
    reviewSummary: "This code is bad.",
    comments: [
      {
        lineStart: -5,
        lineEnd: 2,
        severity: "high",
        issue: "Out of bounds.",
        suggestion: "Fix it.",
      },
      {
        lineStart: 10,
        lineEnd: 5,
        severity: "low",
        issue: "End before start.",
        suggestion: "Reverse.",
      }
    ],
    refactoredCode: "console.log('test')",
    conceptsToLearn: ["bounds"]
  };

  RefactoringReviewSchema.parse(badReview);
  console.log("BAD REVIEW PASSED VALIDATION (Vulnerability: Missing constraints on lineStart/lineEnd)");
} catch (e) {
  console.log("BAD REVIEW FAILED VALIDATION (Safe)");
}
