import { z } from "zod";

const commaSeparatedString = z
  .string()
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );

export const signupInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().trim().toLowerCase(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[a-zA-Z]/, "Password must include at least one letter.")
    .regex(/[0-9]/, "Password must include at least one number."),
});

export const loginInputSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(128),
});

export const onboardingProfileSchema = z.object({
  primaryInterest: z.string().trim().min(2).max(100),
  interests: z.array(z.string().trim().min(2)).min(1).max(6),
  educationLevel: z.string().trim().min(2).max(80),
  backgroundSummary: z.string().trim().min(20).max(1200),
  hoursPerWeek: z.number().int().min(1).max(40),
  learningGoals: z.array(z.string().trim().min(2)).min(1).max(6),
  selfRatedLevel: z.enum(["beginner", "early-intermediate", "intermediate"]),
  knownLanguages: z.array(z.string().trim().min(1)).max(8),
  knownFrameworks: z.array(z.string().trim().min(1)).max(8),
  knownDatabases: z.array(z.string().trim().min(1)).max(8),
  preferredStack: z.array(z.string().trim().min(1)).max(6),
  targetRole: z.string().trim().max(80),
});

export const onboardingProfileJsonSchema = z.object({
  primaryInterest: z.string(),
  interests: z.array(z.string()).default([]),
  educationLevel: z.string(),
  backgroundSummary: z.string(),
  hoursPerWeek: z.number(),
  learningGoals: z.array(z.string()).default([]),
  selfRatedLevel: z.string(),
  knownLanguages: z.array(z.string()).default([]),
  knownFrameworks: z.array(z.string()).default([]),
  knownDatabases: z.array(z.string()).default([]),
  preferredStack: z.array(z.string()).default([]),
  targetRole: z.string(),
});

export const onboardingProfileFormSchema = z.object({
  primaryInterest: z.string().trim(),
  interests: commaSeparatedString,
  educationLevel: z.string().trim(),
  backgroundSummary: z.string().trim(),
  hoursPerWeek: z.coerce.number().int(),
  learningGoals: commaSeparatedString,
  selfRatedLevel: z.string().trim(),
  knownLanguages: commaSeparatedString,
  knownFrameworks: commaSeparatedString,
  knownDatabases: commaSeparatedString,
  preferredStack: commaSeparatedString,
  targetRole: z.string().trim(),
});

export const assessmentGenerateSchema = z.object({
  refresh: z.boolean().optional(),
});

export const assessmentAnswerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().trim().min(2).max(1200),
});

export const assessmentSubmitSchema = z.object({
  attemptId: z.string().min(1),
  answers: z.array(assessmentAnswerSchema).min(3).max(8),
});

export const roadmapGenerationSchema = z.object({
  goal: z.string().trim().min(3).max(160).optional(),
  hoursPerWeek: z.number().int().min(1).max(40).optional(),
});

export const studyBuddyInputSchema = z.object({
  message: z.string().min(2).max(1500),
});

export function parseCommaSeparatedList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const evaluationSubmissionSchema = z.object({
  stepId: z.string().min(1),
  submission: z.string().trim().min(1).max(5000),
});

export const refactoringCoachInputSchema = z.object({
  code: z.string().trim().min(10).max(5000),
  language: z.string().trim().min(1).max(50),
  focusArea: z.string().trim().max(200).optional(),
});
