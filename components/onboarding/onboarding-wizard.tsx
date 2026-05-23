"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { AssessmentQuestion, LearnerProfile, OnboardingState } from "@/lib/types";
import { assessmentSubmitSchema, onboardingProfileSchema, parseCommaSeparatedList } from "@/lib/validators";

type WizardFormState = {
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
  return {
    primaryInterest: profile?.primaryInterest ?? "Web Development",
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
      primaryInterest: form.primaryInterest.trim(),
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
              <input
                value={form.primaryInterest}
                onChange={(event) => setForm((current) => ({ ...current, primaryInterest: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
                placeholder="e.g. Web Development, Medical, Data Science"
              />
            </div>

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
              <label className="text-sm text-slate-300">Current Skills & Knowledge</label>
              <input
                value={form.knownLanguages}
                onChange={(event) => setForm((current) => ({ ...current, knownLanguages: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
                placeholder="e.g. Python, Anatomy, Financial Analysis"
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
