"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { AssessmentQuestion, LearnerProfile, OnboardingState } from "@/lib/types";
import { assessmentSubmitSchema, onboardingProfileSchema, parseCommaSeparatedList } from "@/lib/validators";

type DomainConfig = {
  id: string;
  label: string;
  fields: {
    knownLanguages: { label: string; placeholder: string };
    knownFrameworks: { label: string; placeholder: string };
    knownDatabases: { label: string; placeholder: string };
    preferredStack: { label: string; placeholder: string };
  };
};

const DOMAIN_CONFIGS: DomainConfig[] = [
  {
    id: "Software Engineering / Web Development",
    label: "Software Engineering / Web Development",
    fields: {
      knownLanguages: { label: "Programming Languages", placeholder: "e.g. Python, TypeScript, Java" },
      knownFrameworks: { label: "Frameworks & Libraries", placeholder: "e.g. React, Spring Boot, Django" },
      knownDatabases: { label: "Databases & Cloud", placeholder: "e.g. PostgreSQL, AWS, Redis" },
      preferredStack: { label: "Preferred Stack", placeholder: "e.g. MERN, LAMP, JAMstack" },
    },
  },
  {
    id: "Data Science / AI / ML",
    label: "Data Science / AI / ML",
    fields: {
      knownLanguages: { label: "Languages & Core Tools", placeholder: "e.g. Python, R, Jupyter" },
      knownFrameworks: { label: "ML Frameworks", placeholder: "e.g. PyTorch, TensorFlow, Scikit-learn" },
      knownDatabases: { label: "Data Systems", placeholder: "e.g. Hadoop, Snowflake, Databricks" },
      preferredStack: { label: "Preferred Methodology", placeholder: "e.g. Deep Learning, NLP, Computer Vision" },
    },
  },
  {
    id: "Medicine & Healthcare",
    label: "Medicine & Healthcare",
    fields: {
      knownLanguages: { label: "Core Medical Knowledge", placeholder: "e.g. Anatomy, Pharmacology" },
      knownFrameworks: { label: "Clinical Specialties", placeholder: "e.g. Cardiology, Pediatrics" },
      knownDatabases: { label: "Medical Systems", placeholder: "e.g. EHR, Epic, Cerner" },
      preferredStack: { label: "Preferred Approach", placeholder: "e.g. Evidence-Based Medicine, Holistic" },
    },
  },
  {
    id: "Law & Legal Studies",
    label: "Law & Legal Studies",
    fields: {
      knownLanguages: { label: "Core Legal Areas", placeholder: "e.g. Contract Law, Torts, Constitutional Law" },
      knownFrameworks: { label: "Jurisdictions & Specialties", placeholder: "e.g. Corporate Law, Criminal Defense" },
      knownDatabases: { label: "Legal Research Tools", placeholder: "e.g. Westlaw, LexisNexis" },
      preferredStack: { label: "Practice Methodology", placeholder: "e.g. Litigation, Transactional, Mediation" },
    },
  },
  {
    id: "Business & Consultancy",
    label: "Business & Consultancy",
    fields: {
      knownLanguages: { label: "Core Competencies", placeholder: "e.g. Strategy, Finance, Marketing" },
      knownFrameworks: { label: "Business Frameworks", placeholder: "e.g. SWOT, Porter's 5 Forces" },
      knownDatabases: { label: "Enterprise Systems", placeholder: "e.g. Salesforce, SAP, Oracle" },
      preferredStack: { label: "Consulting Methodology", placeholder: "e.g. Agile, Lean Six Sigma" },
    },
  },
  {
    id: "Academic Research",
    label: "Academic Research",
    fields: {
      knownLanguages: { label: "Research Methodologies", placeholder: "e.g. Qualitative, Quantitative" },
      knownFrameworks: { label: "Theoretical Frameworks", placeholder: "e.g. Constructivism, Positivism" },
      knownDatabases: { label: "Research Databases & Tools", placeholder: "e.g. PubMed, JSTOR, SPSS" },
      preferredStack: { label: "Primary Focus", placeholder: "e.g. Clinical Trials, Literature Review" },
    },
  },
  {
    id: "Design & UX",
    label: "Design & UX",
    fields: {
      knownLanguages: { label: "Core Skills", placeholder: "e.g. User Research, Wireframing" },
      knownFrameworks: { label: "Design Methodologies", placeholder: "e.g. Design Thinking, Double Diamond" },
      knownDatabases: { label: "Design Tools", placeholder: "e.g. Figma, Adobe CC, Sketch" },
      preferredStack: { label: "Preferred Focus", placeholder: "e.g. UI Design, Interaction Design" },
    },
  },
  {
    id: "Other",
    label: "Other (Custom)",
    fields: {
      knownLanguages: { label: "Core Skills & Tools", placeholder: "e.g. Key tools you use" },
      knownFrameworks: { label: "Key Subjects & Frameworks", placeholder: "e.g. Important concepts in your field" },
      knownDatabases: { label: "Important Systems & Environments", placeholder: "e.g. Software or systems you use" },
      preferredStack: { label: "Preferred Methodology/Approach", placeholder: "e.g. How you approach your work" },
    },
  },
];

type WizardFormState = {
  domainCategory: string;
  primaryInterest: string;
  interests: string;
  educationLevel: string;
  backgroundSummary: string;
  hoursPerWeek: string;
  learningGoals: string;
  selfRatedLevel: "beginner" | "early-intermediate" | "intermediate";
  knownLanguages: string;
  knownFrameworks: string;
  knownDatabases: string;
  preferredStack: string;
  targetRole: string;
};

function createInitialForm(profile: LearnerProfile | null): WizardFormState {
  const isKnownDomain = profile?.primaryInterest ? DOMAIN_CONFIGS.some(d => d.id === profile.primaryInterest) : false;
  const initialDomainCategory = profile?.primaryInterest ? (isKnownDomain ? profile.primaryInterest : "Other") : "Software Engineering / Web Development";

  return {
    domainCategory: initialDomainCategory,
    primaryInterest: profile?.primaryInterest ?? "Software Engineering / Web Development",
    interests: profile?.interests.join(", ") ?? "web development",
    educationLevel: profile?.educationLevel ?? "",
    backgroundSummary: profile?.backgroundSummary ?? "",
    hoursPerWeek: profile?.hoursPerWeek ? String(profile.hoursPerWeek) : "6",
    learningGoals: profile?.learningGoals.join(", ") ?? "",
    selfRatedLevel: (profile?.selfRatedLevel as WizardFormState["selfRatedLevel"] | undefined) ?? "beginner",
    knownLanguages: profile?.knownLanguages.join(", ") ?? "html, css, javascript",
    knownFrameworks: profile?.knownFrameworks.join(", ") ?? "",
    knownDatabases: profile?.knownDatabases.join(", ") ?? "",
    preferredStack: profile?.preferredStack.join(", ") ?? "",
    targetRole: profile?.targetRole ?? "",
  };
}

function StepChip({ number, label, active }: { number: number; label: string; active: boolean }) {
  return (
    <div className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${active ? "border-emerald-300/50 bg-emerald-400/10 text-emerald-100" : "border-white/10 bg-white/5 text-slate-400"}`}>
      {number}. {label}
    </div>
  );
}

function QuestionList({
  questions,
  answers,
  setAnswer,
}: {
  questions: AssessmentQuestion[];
  answers: Record<string, string>;
  setAnswer: (questionId: string, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      {questions.map((question, index) => (
        <div key={question.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">
            Question {index + 1} · {question.focus}
          </p>
          <p className="mt-3 text-base font-medium text-white">{question.prompt}</p>
          <textarea
            value={answers[question.id] ?? ""}
            onChange={(event) => setAnswer(question.id, event.target.value)}
            rows={question.expectedLength === "medium" ? 6 : 4}
            className="mt-4 w-full rounded-[1.2rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
            placeholder="Share how you would approach this."
          />
        </div>
      ))}
    </div>
  );
}

export function OnboardingWizard({ initialState }: { initialState: OnboardingState }) {
  const router = useRouter();
  const [form, setForm] = useState<WizardFormState>(() => createInitialForm(initialState.profile));
  const [assessment, setAssessment] = useState(initialState.pendingAssessment);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeStep, setActiveStep] = useState(initialState.pendingAssessment ? 2 : 1);

  const parsedProfilePayload = useMemo(
    () => ({
      primaryInterest: form.domainCategory === "Other" ? form.primaryInterest.trim() : form.domainCategory,
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
    }),
    [form],
  );

  async function saveProfile() {
    const response = await fetch("/api/onboarding/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedProfilePayload),
    });

    const payload = (await response.json()) as { 
      error?: string | { 
        formErrors?: string[]; 
        fieldErrors?: Record<string, string[]>; 
      } 
    };

    if (!response.ok) {
      let errorMessage = "Unable to save your onboarding profile.";
      
      if (typeof payload.error === "string") {
        errorMessage = payload.error;
      } else if (payload.error) {
        if (payload.error.formErrors && payload.error.formErrors.length > 0) {
          errorMessage = payload.error.formErrors[0];
        } else if (payload.error.fieldErrors) {
          const firstField = Object.keys(payload.error.fieldErrors)[0];
          if (firstField && payload.error.fieldErrors[firstField].length > 0) {
            // e.g., "backgroundSummary: String must contain at least 20 character(s)"
            errorMessage = `${firstField}: ${payload.error.fieldErrors[firstField][0]}`;
          }
        }
      }

      throw new Error(errorMessage);
    }
  }

  function handleGenerateAssessment(refresh = false) {
    setError(null);
    setSuccess(null);

    const validationResult = onboardingProfileSchema.safeParse(parsedProfilePayload);
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      const firstField = Object.keys(fieldErrors)[0] as keyof typeof fieldErrors | undefined;
      if (firstField && fieldErrors[firstField]?.length) {
        setError(`Please check your input for ${String(firstField)}: ${fieldErrors[firstField]![0]}`);
      } else {
        setError("Please fill out all required fields.");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    startTransition(async () => {
      try {
        await saveProfile();

        const response = await fetch("/api/assessment/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh }),
        });

        const payload = (await response.json()) as {
          error?: string;
          id?: string;
          provider?: string;
          status?: "pending";
          questions?: AssessmentQuestion[];
        };

        if (!response.ok || !payload.id || !payload.questions || !payload.provider) {
          throw new Error(payload.error ?? "Unable to generate the assessment.");
        }

        setAssessment({
          id: payload.id,
          provider: payload.provider,
          status: "pending",
          questions: payload.questions,
        });
        setAnswers({});
        setActiveStep(2);
        setSuccess("Your assessment is ready. Answer it honestly so the roadmap fits your real starting point.");
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : "Unable to generate the assessment.");
      }
    });
  }

  function handleSubmitAssessment() {
    if (!assessment) {
      return;
    }

    setError(null);
    setSuccess(null);

    const formattedAnswers = assessment.questions.map((question) => ({
      questionId: question.id,
      answer: (answers[question.id] ?? "").trim(),
    }));

    const validationResult = assessmentSubmitSchema.safeParse({
      attemptId: assessment.id,
      answers: formattedAnswers,
    });

    if (!validationResult.success) {
      setError("Please ensure you have provided an answer for every question before submitting.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    startTransition(async () => {
      try {

        const response = await fetch("/api/assessment/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attemptId: assessment.id,
            answers: formattedAnswers,
          }),
        });

        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to score the assessment.");
        }

        router.push("/dashboard");
        router.refresh();
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : "Unable to submit the assessment.");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <StepChip number={1} label="Profile" active={activeStep === 1} />
        <StepChip number={2} label="Assessment" active={activeStep === 2} />
        <StepChip number={3} label="Roadmap" active={false} />
      </div>

      {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}
      {success ? <p className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{success}</p> : null}

      {!initialState.aiReady ? (
        <section className="rounded-[1.75rem] border border-amber-300/20 bg-amber-200/10 p-6">
          <h2 className="text-xl font-semibold text-white">AI setup still needed</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Add `OPENAI_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY` to finish assessment generation and personalized roadmap creation.
          </p>
        </section>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">Step 1</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Tell us where you are right now</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm text-slate-300">Primary Field of Study</label>
              <select
                value={form.domainCategory}
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    domainCategory: event.target.value,
                  }));
                }}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/40"
              >
                {DOMAIN_CONFIGS.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {form.domainCategory === "Other" && (
              <div className="sm:col-span-2">
                <label className="text-sm text-slate-300">Custom Field of Study</label>
                <input
                  value={form.primaryInterest}
                  onChange={(event) => setForm((current) => ({ ...current, primaryInterest: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
                  placeholder="e.g. Astrophysics, Culinary Arts"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="text-sm text-slate-300">Specific Interests</label>
              <input
                value={form.interests}
                onChange={(event) => setForm((current) => ({ ...current, interests: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
                placeholder="e.g. Frontend, Anatomy, Corporate Law"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Education level</label>
              <input
                value={form.educationLevel}
                onChange={(event) => setForm((current) => ({ ...current, educationLevel: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
                placeholder="College, self-taught, working professional"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Hours per week</label>
              <input
                type="number"
                min={1}
                max={40}
                value={form.hoursPerWeek}
                onChange={(event) => setForm((current) => ({ ...current, hoursPerWeek: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm text-slate-300">Background summary</label>
              <textarea
                rows={5}
                value={form.backgroundSummary}
                onChange={(event) => setForm((current) => ({ ...current, backgroundSummary: event.target.value }))}
                className="mt-2 w-full rounded-[1.4rem] border border-white/10 bg-slate-950/60 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
                placeholder="Share what you have studied, built, or struggled with so far."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm text-slate-300">Learning goals</label>
              <input
                value={form.learningGoals}
                onChange={(event) => setForm((current) => ({ ...current, learningGoals: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
                placeholder="build real apps, get freelance work, become job-ready"
              />
            </div>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">Step 2</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Shape your learning path</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm text-slate-300">Current level</label>
              <select
                value={form.selfRatedLevel}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    selfRatedLevel: event.target.value as WizardFormState["selfRatedLevel"],
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/40"
              >
                <option value="beginner">Beginner</option>
                <option value="early-intermediate">Early intermediate</option>
                <option value="intermediate">Intermediate</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-300">
                {DOMAIN_CONFIGS.find((d) => d.id === form.domainCategory)?.fields.knownLanguages.label ?? DOMAIN_CONFIGS[0].fields.knownLanguages.label}
              </label>
              <input
                value={form.knownLanguages}
                onChange={(event) => setForm((current) => ({ ...current, knownLanguages: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
                placeholder={DOMAIN_CONFIGS.find((d) => d.id === form.domainCategory)?.fields.knownLanguages.placeholder ?? DOMAIN_CONFIGS[0].fields.knownLanguages.placeholder}
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">
                {DOMAIN_CONFIGS.find((d) => d.id === form.domainCategory)?.fields.knownFrameworks.label ?? DOMAIN_CONFIGS[0].fields.knownFrameworks.label}
              </label>
              <input
                value={form.knownFrameworks}
                onChange={(event) => setForm((current) => ({ ...current, knownFrameworks: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
                placeholder={DOMAIN_CONFIGS.find((d) => d.id === form.domainCategory)?.fields.knownFrameworks.placeholder ?? DOMAIN_CONFIGS[0].fields.knownFrameworks.placeholder}
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">
                {DOMAIN_CONFIGS.find((d) => d.id === form.domainCategory)?.fields.knownDatabases.label ?? DOMAIN_CONFIGS[0].fields.knownDatabases.label}
              </label>
              <input
                value={form.knownDatabases}
                onChange={(event) => setForm((current) => ({ ...current, knownDatabases: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
                placeholder={DOMAIN_CONFIGS.find((d) => d.id === form.domainCategory)?.fields.knownDatabases.placeholder ?? DOMAIN_CONFIGS[0].fields.knownDatabases.placeholder}
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">
                {DOMAIN_CONFIGS.find((d) => d.id === form.domainCategory)?.fields.preferredStack.label ?? DOMAIN_CONFIGS[0].fields.preferredStack.label}
              </label>
              <input
                value={form.preferredStack}
                onChange={(event) => setForm((current) => ({ ...current, preferredStack: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
                placeholder={DOMAIN_CONFIGS.find((d) => d.id === form.domainCategory)?.fields.preferredStack.placeholder ?? DOMAIN_CONFIGS[0].fields.preferredStack.placeholder}
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Target Role</label>
              <input
                value={form.targetRole}
                onChange={(event) => setForm((current) => ({ ...current, targetRole: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
                placeholder="e.g. Full-stack developer, Cardiologist"
              />
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">Step 3</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Generate your assessment</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              We use your profile and preferred stack to create a short assessment, then score it into a flexible learning profile instead of a hard tier.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleGenerateAssessment(false)}
              disabled={isPending || !initialState.aiReady}
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Processing...
                </>
              ) : assessment ? (
                "Reuse saved assessment"
              ) : (
                "Save profile and create assessment"
              )}
            </button>
            <button
              type="button"
              onClick={() => handleGenerateAssessment(true)}
              disabled={isPending || !initialState.aiReady}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Refresh questions
            </button>
          </div>
        </div>
      </section>

      {assessment ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">Assessment ready</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Answer honestly so the roadmap fits your real level</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
              provider: {assessment.provider}
            </span>
          </div>

          <div className="mt-6">
            <QuestionList
              questions={assessment.questions}
              answers={answers}
              setAnswer={(questionId, value) => setAnswers((current) => ({ ...current, [questionId]: value }))}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSubmitAssessment}
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Scoring assessment...
                </>
              ) : (
                "Submit assessment and build roadmap"
              )}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
