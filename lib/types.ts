export type StepStatus = "todo" | "active" | "done";

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  week: number;
  estimatedHours: number;
  status: StepStatus;
  resourceTitle?: string | null;
  resourceUrl?: string | null;
}

export interface LearningRoadmap {
  id: string;
  title: string;
  goal: string;
  summary: string;
  status: "draft" | "active" | "complete";
  domain: string;
  targetRole: string;
  preferredStack: string[];
  steps: RoadmapStep[];
}

export interface RoadmapContext {
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
}

export interface LearnerProfile extends RoadmapContext {
  id: string;
  readinessScore: number | null;
  confidenceScore: number | null;
  paceScore: number | null;
  supportNeedScore: number | null;
  profileSummary: string | null;
  assessmentStatus: "not_started" | "pending" | "completed";
  assessmentProvider: string | null;
  lastAssessmentAt: string | null;
}

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  focus: string;
  expectedLength: "short" | "medium";
}

export interface AssessmentAnswer {
  questionId: string;
  answer: string;
}

export interface AssessmentResult {
  readinessScore: number;
  confidenceScore: number;
  paceScore: number;
  supportNeedScore: number;
  profileSummary: string;
  focusScore: number;
  nextAction: string;
  provider: "google" | "openai";
}

export interface CourseRecommendation {
  id: string;
  title: string;
  provider: string;
  topic: string;
  level: string;
  duration: string;
  reason: string;
  url: string;
}

export interface PersonalizedRecommendation extends CourseRecommendation {
  sortOrder: number;
}

export interface CareerTrack {
  id: string;
  role: string;
  fitScore: number;
  summary: string;
  growthSignal: string;
  nextSkills: string[];
}

export type DashboardSnapshot =
  | {
      status: "onboarding-required";
      nextAction: string;
    }
  | {
      status: "ready";
      streak: number;
      completedSteps: number;
      weeklyHours: number;
      focusScore: number;
      nextAction: string;
    };

export type LearningRoadmapState =
  | {
      status: "onboarding-required";
      roadmap: null;
    }
  | {
      status: "empty";
      roadmap: null;
    }
  | {
      status: "ready";
      roadmap: LearningRoadmap;
    };

export type RecommendationsState =
  | {
      status: "onboarding-required";
      items: PersonalizedRecommendation[];
    }
  | {
      status: "empty";
      items: PersonalizedRecommendation[];
    }
  | {
      status: "ready";
      items: PersonalizedRecommendation[];
    };

export type CareerState =
  | {
      status: "onboarding-required";
      items: CareerTrack[];
    }
  | {
      status: "empty";
      items: CareerTrack[];
    }
  | {
      status: "ready";
      items: CareerTrack[];
    };

export interface PendingAssessmentAttempt {
  id: string;
  provider: string;
  status: "pending" | "completed";
  questions: AssessmentQuestion[];
}

export interface OnboardingState {
  profile: LearnerProfile | null;
  pendingAssessment: PendingAssessmentAttempt | null;
  aiReady: boolean;
}

export interface AuthenticatedUserSummary {
  id: string;
  name: string;
  email: string;
  onboardingCompletedAt: string | null;
}

export interface StudyBuddyResponse {
  reply: string;
  provider: "fallback" | "google" | "openai";
}
