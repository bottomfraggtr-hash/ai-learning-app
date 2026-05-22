import { z } from "zod";
import { evaluationSubmissionSchema, refactoringCoachInputSchema } from "./lib/validators";
import { RefactoringReviewSchema } from "./lib/services/refactoring-coach";
import { proactiveSuggestionSchema } from "./lib/services/proactive-agent";

function runTests() {
  console.log("Testing evaluationSubmissionSchema...");
  const res1 = evaluationSubmissionSchema.safeParse({ stepId: "123", submission: "   \n   " });
  if (!res1.success) {
    console.log("Empty submission (whitespace):", res1.success, res1.error.issues);
  } else {
    console.log("Empty submission (whitespace):", res1.success, "");
  }

  console.log("Testing RefactoringReviewSchema...");
  const res2 = RefactoringReviewSchema.safeParse({
    reviewSummary: "test",
    comments: [{
      lineStart: -1,
      lineEnd: -5,
      severity: "high",
      issue: "bad line numbers",
      suggestion: "fix them"
    }],
    refactoredCode: "code",
    conceptsToLearn: []
  });
  console.log("Negative line numbers allowed:", res2.success);

  const res3 = RefactoringReviewSchema.safeParse({
    reviewSummary: "test",
    comments: [{
      lineStart: 10,
      lineEnd: 5,
      severity: "low",
      issue: "inverted",
      suggestion: "fix"
    }],
    refactoredCode: "code",
    conceptsToLearn: []
  });
  console.log("Inverted line numbers allowed:", res3.success);

  console.log("Testing proactiveSuggestionSchema...");
  const res4 = proactiveSuggestionSchema.safeParse({
    type: "resource",
    message: "Here is a great resource",
    actionLabel: "Click Here"
  });
  console.log("Action label without URL allowed:", res4.success);
}
runTests();
