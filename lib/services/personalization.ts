import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getCatalogMatches } from "@/lib/services/course-catalog";
import type {
  AssessmentAnswer,
  AssessmentQuestion,
  AssessmentResult,
  CareerTrack,
  LearnerProfile,
  LearningRoadmap,
  OnboardingState,
  PersonalizedRecommendation,
  RoadmapContext,
} from "@/lib/types";

class AiConfigurationError extends Error {
  constructor() {
    super("AI setup is required before generating assessments and personalized plans.");
    this.name = "AiConfigurationError";
  }
}

const assessmentQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string().min(10).max(240),
  focus: z.string().min(2).max(80),
  expectedLength: z.enum(["short", "medium"]),
});

const generatedAssessmentSchema = z.object({
  questions: z.array(assessmentQuestionSchema).min(5).max(8),
});

const generatedRoadmapSchema = z.object({
  title: z.string().min(2).max(140),
  goal: z.string().min(2).max(220),
  summary: z.string().min(2).max(1000),
  steps: z
    .array(
      z.object({
        title: z.string().min(2).max(120),
        description: z.string().min(2).max(1000),
        week: z.number().int().min(1).max(24),
        estimatedHours: z.number().int().min(1).max(40),
        resourceSlug: z.string().optional(),
        resourceTitle: z.string().optional(),
        resourceUrl: z.string().url().optional(),
      }),
    )
    .min(4)
    .max(8),
});

const generatedAssessmentOutcomeSchema = z.object({
  readinessScore: z.number().int().min(0).max(100),
  confidenceScore: z.number().int().min(0).max(100),
  paceScore: z.number().int().min(0).max(100),
  supportNeedScore: z.number().int().min(0).max(100),
  profileSummary: z.string().min(2).max(1000),
  focusScore: z.number().int().min(0).max(100),
  nextAction: z.string().min(2).max(500),
  roadmap: generatedRoadmapSchema,
  recommendations: z
    .array(
      z.object({
        slug: z.string().optional(),
        title: z.string().optional(),
        provider: z.string().optional(),
        topic: z.string().optional(),
        level: z.string().optional(),
        duration: z.string().optional(),
        url: z.string().url().optional(),
        reason: z.string().min(2).max(500),
      }),
    )
    .min(3)
    .max(6),
  careers: z
    .array(
      z.object({
        role: z.string().min(2).max(120),
        fitScore: z.number().int().min(0).max(100),
        summary: z.string().min(2).max(1000),
        growthSignal: z.string().min(2).max(500),
        nextSkills: z.array(z.string().min(2).max(80)).min(2).max(10),
      }),
    )
    .min(2)
    .max(4),
});

const regeneratedRoadmapSchema = z.object({
  roadmap: generatedRoadmapSchema,
  focusScore: z.number().int().min(0).max(100),
  nextAction: z.string().min(2).max(500),
});

export function getAiModel() {
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: "openai" as const,
      model: openai("gpt-4o-mini"),
    };
  }

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      provider: "google" as const,
      model: google("gemini-2.5-flash"),
    };
  }

  throw new AiConfigurationError();
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function serializeLearnerProfile(profile: {
  id: string;
  primaryInterest: string;
  interests: string[];
  educationLevel: string;
  backgroundSummary: string;
  hoursPerWeek: number;
  learningGoals: string[];
  selfRatedLevel: string;
  knownLanguages: string[];
  knownFrameworks: string[];
  knownDatabases: string[];
  preferredStack: string[];
  targetRole: string;
  readinessScore: number | null;
  confidenceScore: number | null;
  paceScore: number | null;
  supportNeedScore: number | null;
  profileSummary: string | null;
  assessmentStatus: string;
  assessmentProvider: string | null;
  lastAssessmentAt: Date | null;
}): LearnerProfile {
  return {
    id: profile.id,
    primaryInterest: profile.primaryInterest,
    interests: profile.interests,
    educationLevel: profile.educationLevel,
    backgroundSummary: profile.backgroundSummary,
    hoursPerWeek: profile.hoursPerWeek,
    learningGoals: profile.learningGoals,
    selfRatedLevel: profile.selfRatedLevel,
    knownLanguages: profile.knownLanguages,
    knownFrameworks: profile.knownFrameworks,
    knownDatabases: profile.knownDatabases,
    preferredStack: profile.preferredStack,
    targetRole: profile.targetRole,
    readinessScore: profile.readinessScore,
    confidenceScore: profile.confidenceScore,
    paceScore: profile.paceScore,
    supportNeedScore: profile.supportNeedScore,
    profileSummary: profile.profileSummary,
    assessmentStatus: (profile.assessmentStatus as LearnerProfile["assessmentStatus"]) ?? "not_started",
    assessmentProvider: profile.assessmentProvider,
    lastAssessmentAt: profile.lastAssessmentAt?.toISOString() ?? null,
  };
}

function mapRoadmap(roadmap: {
  id: string;
  title: string;
  goal: string;
  summary: string;
  status: string;
  domain: string;
  targetRole: string;
  preferredStack: string[];
  steps: Array<{
    id: string;
    title: string;
    description: string;
    week: number;
    estimatedHours: number;
    status: string;
    resourceTitle: string | null;
    resourceUrl: string | null;
  }>;
}): LearningRoadmap {
  return {
    id: roadmap.id,
    title: roadmap.title,
    goal: roadmap.goal,
    summary: roadmap.summary,
    status: roadmap.status as LearningRoadmap["status"],
    domain: roadmap.domain,
    targetRole: roadmap.targetRole,
    preferredStack: roadmap.preferredStack,
    steps: roadmap.steps.map((step) => ({
      id: step.id,
      title: step.title,
      description: step.description,
      week: step.week,
      estimatedHours: step.estimatedHours,
      status: step.status as LearningRoadmap["steps"][number]["status"],
      resourceTitle: step.resourceTitle,
      resourceUrl: step.resourceUrl,
    })),
  };
}

async function getRequiredProfile(userId: string) {
  const profile = await prisma.learnerProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!profile) {
    throw new Error("Complete your onboarding profile before requesting an assessment.");
  }

  return profile;
}

function buildRoadmapContext(profile: LearnerProfile): RoadmapContext {
  return {
    primaryInterest: profile.primaryInterest,
    interests: profile.interests,
    educationLevel: profile.educationLevel,
    backgroundSummary: profile.backgroundSummary,
    hoursPerWeek: profile.hoursPerWeek,
    learningGoals: profile.learningGoals,
    selfRatedLevel: profile.selfRatedLevel,
    knownLanguages: profile.knownLanguages,
    knownFrameworks: profile.knownFrameworks,
    knownDatabases: profile.knownDatabases,
    preferredStack: profile.preferredStack,
    targetRole: profile.targetRole,
  };
}

export function isPersonalizationAiReady() {
  return Boolean(process.env.OPENAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}

export async function saveLearnerProfile(userId: string, input: RoadmapContext) {
  const profile = await prisma.learnerProfile.upsert({
    where: {
      userId,
    },
    update: {
      primaryInterest: input.primaryInterest,
      interests: input.interests,
      educationLevel: input.educationLevel,
      backgroundSummary: input.backgroundSummary,
      hoursPerWeek: input.hoursPerWeek,
      learningGoals: input.learningGoals,
      selfRatedLevel: input.selfRatedLevel,
      knownLanguages: input.knownLanguages,
      knownFrameworks: input.knownFrameworks,
      knownDatabases: input.knownDatabases,
      preferredStack: input.preferredStack,
      targetRole: input.targetRole,
      readinessScore: null,
      confidenceScore: null,
      paceScore: null,
      supportNeedScore: null,
      profileSummary: null,
      assessmentStatus: "not_started",
      assessmentProvider: null,
      lastAssessmentAt: null,
    },
    create: {
      userId,
      primaryInterest: input.primaryInterest,
      interests: input.interests,
      educationLevel: input.educationLevel,
      backgroundSummary: input.backgroundSummary,
      hoursPerWeek: input.hoursPerWeek,
      learningGoals: input.learningGoals,
      selfRatedLevel: input.selfRatedLevel,
      knownLanguages: input.knownLanguages,
      knownFrameworks: input.knownFrameworks,
      knownDatabases: input.knownDatabases,
      preferredStack: input.preferredStack,
      targetRole: input.targetRole,
    },
  });

  await prisma.assessmentAttempt.deleteMany({
    where: {
      userId,
      status: "pending",
    },
  });

  return serializeLearnerProfile(profile);
}

export async function getOnboardingState(userId: string): Promise<OnboardingState> {
  const [profile, attempt] = await Promise.all([
    prisma.learnerProfile.findUnique({
      where: {
        userId,
      },
    }),
    prisma.assessmentAttempt.findFirst({
      where: {
        userId,
        status: "pending",
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    profile: profile ? serializeLearnerProfile(profile) : null,
    pendingAssessment: attempt
      ? {
          id: attempt.id,
          provider: attempt.provider,
          status: attempt.status as "pending" | "completed",
          questions: attempt.questions as unknown as AssessmentQuestion[],
        }
      : null,
    aiReady: isPersonalizationAiReady(),
  };
}

export async function generateAssessmentForUser(userId: string, refresh = false) {
  const profileRecord = await getRequiredProfile(userId);
  const profile = serializeLearnerProfile(profileRecord);

  if (!refresh) {
    const existingAttempt = await prisma.assessmentAttempt.findFirst({
      where: {
        userId,
        status: "pending",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingAttempt) {
      return {
        id: existingAttempt.id,
        provider: existingAttempt.provider,
        status: "pending" as const,
        questions: existingAttempt.questions as unknown as AssessmentQuestion[],
      };
    }
  }

  const { model, provider } = getAiModel();

  const result = await generateObject({
    model,
    schema: generatedAssessmentSchema,
    system:
      `You create short onboarding assessments for learners studying ${profile.primaryInterest}. Keep the questions practical, domain-aware, encouraging, and suitable for adult self-learners. Return JSON only.`,
    prompt: JSON.stringify({
      task: "Generate 5 to 8 assessment questions for the learner profile.",
      learnerProfile: buildRoadmapContext(profile),
      instructions: [
        "Focus on the learner's selected stack and known tools.",
        "Use open-ended questions that reveal real understanding.",
        "Mix concept questions with small build or debugging questions.",
        "Keep each prompt under 240 characters.",
      ],
    }),
  });

  await prisma.assessmentAttempt.deleteMany({
    where: {
      userId,
      status: "pending",
    },
  });

  const createdAttempt = await prisma.assessmentAttempt.create({
      data: {
        userId,
        learnerProfileId: profileRecord.id,
        provider,
        status: "pending",
        questions: result.object.questions as unknown as Prisma.InputJsonValue,
      },
    });

  await prisma.learnerProfile.update({
    where: {
      userId,
    },
    data: {
      assessmentStatus: "pending",
      assessmentProvider: provider,
    },
  });

  return {
    id: createdAttempt.id,
    provider,
    status: "pending" as const,
    questions: result.object.questions,
  };
}

export async function submitAssessmentForUser(userId: string, attemptId: string, answers: AssessmentAnswer[]) {
  const [profileRecord, attempt] = await Promise.all([
    getRequiredProfile(userId),
    prisma.assessmentAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
      },
    }),
  ]);

  if (!attempt) {
    throw new Error("Assessment attempt not found.");
  }

  if (attempt.status !== "pending") {
    throw new Error("This assessment has already been submitted.");
  }

  const profile = serializeLearnerProfile(profileRecord);
  const catalogMatches = await getCatalogMatches(profile, 8);
  const { model, provider } = getAiModel();

  const result = await generateObject({
    model,
    schema: generatedAssessmentOutcomeSchema,
    system:
      `You score assessments and create personalized study plans for learners studying ${profile.primaryInterest}. Be realistic, encouraging, and specific. Return JSON only.`,
    prompt: JSON.stringify({
      task: "Score the learner and produce a personalized learning plan.",
      learnerProfile: buildRoadmapContext(profile),
      assessmentQuestions: attempt.questions,
      learnerAnswers: answers,
      availableCourseCatalog: catalogMatches.map((item) => ({
        slug: item.slug,
        title: item.title,
        topic: item.topic,
        level: item.level,
        duration: item.duration,
        summary: item.summary,
        stackTags: item.stackTags,
        url: item.url,
      })),
      instructions: [
        "Use continuous scores, not rigid labels.",
        "CRITICAL: If the user answers 'I don't know', 'nothing', or shows no knowledge, their readinessScore, confidenceScore, and career fitScores MUST be very low (0-20). Do NOT artificially inflate scores just to be encouraging.",
        "Base career fitScores strictly on their current demonstrated knowledge, not their future potential.",
        "Favor a roadmap that fits the learner's weekly hours and current confidence.",
        "If the provided catalog has relevant courses, use those slugs for recommendations. If the catalog is irrelevant or empty for this field, generate your own recommendations providing title, url, provider, and topic.",
        "Return 2 to 4 career directions relevant to the profile.",
        "CRITICAL: Every step in the roadmap MUST include an actual, real-world URL (resourceUrl) to a high-quality, free resource (e.g., Wikipedia, Khan Academy, official documentation, or open-source repositories). Do not use placeholder URLs.",
      ],
    }),
  });

  const scoring = {
    readinessScore: clampScore(result.object.readinessScore),
    confidenceScore: clampScore(result.object.confidenceScore),
    paceScore: clampScore(result.object.paceScore),
    supportNeedScore: clampScore(result.object.supportNeedScore),
    focusScore: clampScore(result.object.focusScore),
  };

  const catalogBySlug = new Map(catalogMatches.map((item) => [item.slug, item]));
  const selectedRecommendations = result.object.recommendations
    .map((item, index) => {
      if (item.slug) {
        const match = catalogBySlug.get(item.slug);
        if (match) {
          return {
            id: `${match.slug}-${index}`,
            title: match.title,
            provider: match.provider,
            topic: match.topic,
            level: match.level,
            duration: match.duration,
            reason: item.reason,
            url: match.url,
            sortOrder: index,
            courseCatalogItemId: match.id,
          };
        }
      }

      if (item.title && item.url) {
        return {
          id: `custom-${index}`,
          title: item.title,
          provider: item.provider ?? "Web Resource",
          topic: item.topic ?? profile.primaryInterest,
          level: item.level ?? "Beginner",
          duration: item.duration ?? "Self-paced",
          reason: item.reason,
          url: item.url,
          sortOrder: index,
          courseCatalogItemId: null,
        };
      }

      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const fallbackRecommendations =
    selectedRecommendations.length > 0
      ? selectedRecommendations
      : [];

  const roadmapData = result.object.roadmap;
  const sortedSteps = [...roadmapData.steps].sort((left, right) => left.week - right.week);

  await prisma.$transaction(async (tx) => {
    await Promise.all([
      tx.roadmap.deleteMany({ where: { userId } }),
      tx.courseRecommendation.deleteMany({ where: { userId } }),
      tx.careerProfile.deleteMany({ where: { userId } }),
      tx.progressSnapshot.deleteMany({ where: { userId } }),
    ]);

    await tx.assessmentAttempt.update({
      where: {
        id: attemptId,
      },
      data: {
        provider,
        status: "completed",
        answers: answers as unknown as Prisma.InputJsonValue,
        scoring: result.object as unknown as Prisma.InputJsonValue,
        summary: result.object.profileSummary,
        completedAt: new Date(),
      },
    });

    await tx.learnerProfile.update({
      where: {
        userId,
      },
      data: {
        readinessScore: scoring.readinessScore,
        confidenceScore: scoring.confidenceScore,
        paceScore: scoring.paceScore,
        supportNeedScore: scoring.supportNeedScore,
        profileSummary: result.object.profileSummary,
        assessmentStatus: "completed",
        assessmentProvider: provider,
        lastAssessmentAt: new Date(),
      },
    });

    await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        onboardingCompletedAt: new Date(),
      },
    });

    await tx.roadmap.create({
      data: {
        userId,
        assessmentAttemptId: attemptId,
        title: roadmapData.title,
        goal: roadmapData.goal,
        summary: roadmapData.summary,
        status: "active",
        domain: profile.primaryInterest,
        targetRole: profile.targetRole,
        preferredStack: profile.preferredStack,
        generationSource: provider,
        steps: {
          create: sortedSteps.map((step) => {
            const resourceMatch = step.resourceSlug ? catalogBySlug.get(step.resourceSlug) : null;

            return {
              title: step.title,
              description: step.description,
              week: step.week,
              estimatedHours: step.estimatedHours,
              status: step.week === sortedSteps[0]?.week ? "active" : "todo",
              resourceTitle: step.resourceTitle ?? resourceMatch?.title ?? null,
              resourceUrl: step.resourceUrl ?? resourceMatch?.url ?? null,
            };
          }),
        },
      },
    });

    if (fallbackRecommendations.length > 0) {
      await tx.courseRecommendation.createMany({
        data: fallbackRecommendations.map((item) => ({
          title: item.title,
          provider: item.provider,
          topic: item.topic,
          level: item.level,
          duration: item.duration,
          reason: item.reason,
          url: item.url,
          sortOrder: item.sortOrder,
          userId,
          courseCatalogItemId: item.courseCatalogItemId,
        })),
      });
    }

    if (result.object.careers.length > 0) {
      await tx.careerProfile.createMany({
        data: result.object.careers.map((career) => ({
          role: career.role,
          fitScore: career.fitScore,
          summary: career.summary,
          growthSignal: career.growthSignal,
          nextSkills: career.nextSkills,
          userId,
        })),
      });
    }

    await tx.progressSnapshot.create({
      data: {
        userId,
        streak: 0,
        completedSteps: 0,
        weeklyHours: profile.hoursPerWeek,
        focusScore: scoring.focusScore,
        nextAction: result.object.nextAction,
      },
    });
  });

  const finalRoadmap = await prisma.roadmap.findFirst({
    where: {
      userId,
    },
    include: {
      steps: {
        orderBy: {
          week: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    result: {
      readinessScore: scoring.readinessScore,
      confidenceScore: scoring.confidenceScore,
      paceScore: scoring.paceScore,
      supportNeedScore: scoring.supportNeedScore,
      profileSummary: result.object.profileSummary,
      focusScore: scoring.focusScore,
      nextAction: result.object.nextAction,
      provider,
    } satisfies AssessmentResult,
    roadmap: finalRoadmap ? mapRoadmap(finalRoadmap) : null,
  };
}

export async function regenerateRoadmapForUser(userId: string, overrides?: { goal?: string; hoursPerWeek?: number }) {
  const [profileRecord, latestAssessment] = await Promise.all([
    getRequiredProfile(userId),
    prisma.assessmentAttempt.findFirst({
      where: {
        userId,
        status: "completed",
      },
      orderBy: {
        completedAt: "desc",
      },
    }),
  ]);

  if (!latestAssessment) {
    throw new Error("Complete an assessment before generating a roadmap.");
  }

  const profile = serializeLearnerProfile(profileRecord);
  const catalogMatches = await getCatalogMatches(profile, 8);
  const { model, provider } = getAiModel();

  const result = await generateObject({
    model,
    schema: regeneratedRoadmapSchema,
    system:
      `You refresh personalized learning roadmaps for learners studying ${profile.primaryInterest}. Keep the roadmap realistic, domain-aware, and matched to weekly availability. Return JSON only.`,
    prompt: JSON.stringify({
      task: "Refresh the learner roadmap using their stored profile and prior assessment summary.",
      learnerProfile: {
        ...buildRoadmapContext(profile),
        hoursPerWeek: overrides?.hoursPerWeek ?? profile.hoursPerWeek,
        goalOverride: overrides?.goal ?? null,
        profileSummary: profile.profileSummary,
      },
      lastAssessmentSummary: latestAssessment.summary,
      catalogMatches: catalogMatches.map((item) => ({
        slug: item.slug,
        title: item.title,
        topic: item.topic,
        level: item.level,
        summary: item.summary,
        url: item.url,
      })),
      instructions: [
        "CRITICAL: Every step in the roadmap MUST include an actual, real-world URL (resourceUrl) to a high-quality, free learning resource (e.g., Wikipedia, Khan Academy, official documentation, or open-source repositories). Do not use placeholder URLs."
      ],
    }),
  });

  const catalogBySlug = new Map(catalogMatches.map((item) => [item.slug, item]));
  const sortedSteps = [...result.object.roadmap.steps].sort((left, right) => left.week - right.week);

  await prisma.$transaction(async (tx) => {
    await tx.roadmap.deleteMany({
      where: {
        userId,
      },
    });

    await tx.progressSnapshot.deleteMany({
      where: {
        userId,
      },
    });

    await tx.roadmap.create({
      data: {
        userId,
        assessmentAttemptId: latestAssessment.id,
        title: result.object.roadmap.title,
        goal: overrides?.goal ?? result.object.roadmap.goal,
        summary: result.object.roadmap.summary,
        status: "active",
        domain: profile.primaryInterest,
        targetRole: profile.targetRole,
        preferredStack: profile.preferredStack,
        generationSource: provider,
        steps: {
          create: sortedSteps.map((step) => {
            const match = step.resourceSlug ? catalogBySlug.get(step.resourceSlug) : null;

            return {
              title: step.title,
              description: step.description,
              week: step.week,
              estimatedHours: step.estimatedHours,
              status: step.week === sortedSteps[0]?.week ? "active" : "todo",
              resourceTitle: step.resourceTitle ?? match?.title ?? null,
              resourceUrl: step.resourceUrl ?? match?.url ?? null,
            };
          }),
        },
      },
    });

    await tx.progressSnapshot.create({
      data: {
        userId,
        streak: 0,
        completedSteps: 0,
        weeklyHours: overrides?.hoursPerWeek ?? profile.hoursPerWeek,
        focusScore: clampScore(result.object.focusScore),
        nextAction: result.object.nextAction,
      },
    });
  });

  const roadmap = await prisma.roadmap.findFirst({
    where: {
      userId,
    },
    include: {
      steps: {
        orderBy: {
          week: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!roadmap) {
    throw new Error("Roadmap generation failed.");
  }

  return mapRoadmap(roadmap);
}

export async function getLatestRoadmapForUser(userId: string) {
  const roadmap = await prisma.roadmap.findFirst({
    where: {
      userId,
    },
    include: {
      steps: {
        orderBy: {
          week: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return roadmap ? mapRoadmap(roadmap) : null;
}

export async function getRecommendationListForUser(userId: string): Promise<PersonalizedRecommendation[]> {
  const recommendations = await prisma.courseRecommendation.findMany({
    where: {
      userId,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return recommendations.map((item) => ({
    id: item.id,
    title: item.title,
    provider: item.provider,
    topic: item.topic,
    level: item.level,
    duration: item.duration,
    reason: item.reason,
    url: item.url,
    sortOrder: item.sortOrder,
  }));
}

export async function getCareerSuggestionsForUser(userId: string): Promise<CareerTrack[]> {
  const careers = await prisma.careerProfile.findMany({
    where: {
      userId,
    },
    orderBy: {
      fitScore: "desc",
    },
  });

  return careers.map((item) => ({
    id: item.id,
    role: item.role,
    fitScore: item.fitScore,
    summary: item.summary,
    growthSignal: item.growthSignal,
    nextSkills: item.nextSkills,
  }));
}
