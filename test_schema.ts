import { onboardingProfileJsonSchema, onboardingProfileSchema } from "./lib/validators";
import { parseCommaSeparatedList } from "./lib/validators";

const form = {
  interests: "web development",
  educationLevel: "",
  backgroundSummary: "",
  hoursPerWeek: "6",
  learningGoals: "",
  selfRatedLevel: "beginner" as const,
  knownLanguages: "html, css, javascript",
  knownFrameworks: "",
  knownDatabases: "",
  preferredStack: "nextjs, typescript, postgresql",
  targetRole: "Full-stack web developer",
};

const payload = {
  interests: parseCommaSeparatedList(form.interests),
  educationLevel: form.educationLevel.trim(),
  backgroundSummary: form.backgroundSummary.trim(),
  hoursPerWeek: Number(form.hoursPerWeek),
  learningGoals: parseCommaSeparatedList(form.learningGoals),
  selfRatedLevel: form.selfRatedLevel,
  knownLanguages: parseCommaSeparatedList(form.knownLanguages),
  knownFrameworks: parseCommaSeparatedList(form.knownFrameworks),
  knownDatabases: parseCommaSeparatedList(form.knownDatabases),
  preferredStack: parseCommaSeparatedList(form.preferredStack),
  targetRole: form.targetRole.trim(),
};

console.log("Payload:", JSON.stringify(payload, null, 2));

const baseParsed = onboardingProfileJsonSchema.safeParse(payload);
if (!baseParsed.success) {
  console.log("baseParsed ERROR:", baseParsed.error.flatten());
} else {
  console.log("baseParsed OK");
  const parsed = onboardingProfileSchema.safeParse(baseParsed.data);
  if (!parsed.success) {
    console.log("parsed ERROR:", parsed.error.flatten());
  } else {
    console.log("parsed OK");
  }
}
