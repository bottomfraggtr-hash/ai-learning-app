import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { requireUser } from "@/lib/dal";
import { getRoadmap } from "@/lib/services/roadmap";

export default async function RoadmapPage() {
  const user = await requireUser();
  const roadmapState = await getRoadmap(user.id, user.onboardingCompletedAt);

  return (
    <PageShell
      eyebrow="Roadmap"
      title="A structured learning plan shaped by real onboarding and assessment data."
      description="This roadmap reads from your account records instead of shared starter content, so pacing and milestones stay tied to your preferred stack and current level."
    >
      {roadmapState.status === "onboarding-required" ? (
        <EmptyState
          title="Roadmap locked until onboarding is complete"
          description="Finish your onboarding profile and assessment first. That gives us the information needed to generate a realistic learning path."
          ctaHref="/onboarding"
          ctaLabel="Complete onboarding"
        />
      ) : roadmapState.status === "empty" ? (
        <EmptyState
          title="No roadmap has been generated yet"
          description="Your account is ready, but there is no active roadmap stored yet. Finish assessment scoring or regenerate the plan to create one."
          ctaHref="/dashboard"
          ctaLabel="Open dashboard"
        />
      ) : (
        <section className="grid gap-5 lg:grid-cols-[0.72fr_1fr]">
          <article
            className="rounded-xl p-6"
            style={{ border: "1px solid var(--color-line-subtle)", background: "var(--color-surface)" }}
          >
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-dim)" }}>
              Overview
            </p>
            <h2 className="mt-3 text-2xl font-semibold" style={{ color: "var(--color-text)" }}>
              {roadmapState.roadmap.title}
            </h2>
            <p className="mt-3 text-sm leading-7" style={{ color: "var(--color-muted)" }}>
              {roadmapState.roadmap.summary}
            </p>
            <div
              className="mt-5 rounded-lg p-4"
              style={{ border: "1px solid var(--color-line-subtle)", background: "var(--color-surface-mid)" }}
            >
              <p className="text-xs font-medium" style={{ color: "var(--color-dim)" }}>
                Goal
              </p>
              <p className="mt-2 text-sm leading-7" style={{ color: "var(--color-text)" }}>
                {roadmapState.roadmap.goal}
              </p>
            </div>
            <div
              className="mt-3 rounded-lg p-4"
              style={{ border: "1px solid var(--color-line-subtle)", background: "var(--color-surface-mid)" }}
            >
              <p className="text-xs font-medium" style={{ color: "var(--color-dim)" }}>
                Target role
              </p>
              <p className="mt-2 text-sm leading-7" style={{ color: "var(--color-text)" }}>
                {roadmapState.roadmap.targetRole}
              </p>
            </div>
          </article>

          <article
            className="rounded-xl p-6"
            style={{ border: "1px solid var(--color-line-subtle)", background: "var(--color-surface)" }}
          >
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-dim)" }}>
              Milestones
            </p>
            <div className="mt-5 space-y-3">
              {roadmapState.roadmap.steps.map((step) => (
                <div
                  key={step.id}
                  className="rounded-lg p-4"
                  style={{ border: "1px solid var(--color-line-subtle)", background: "var(--color-surface-mid)" }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
                      Week {step.week}: {step.title}
                    </h3>
                    <div
                      className="flex items-center gap-3 text-xs uppercase tracking-wide"
                      style={{ color: "var(--color-dim)" }}
                    >
                      <span>{step.status}</span>
                      <span>{step.estimatedHours}h</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-7" style={{ color: "var(--color-muted)" }}>
                    {step.description}
                  </p>
                  {step.resourceUrl ? (
                    <a
                      href={step.resourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-sm transition"
                      style={{ color: "var(--color-accent-dim)" }}
                    >
                      {step.resourceTitle ?? "Open recommended resource"}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        </section>
      )}
    </PageShell>
  );
}
