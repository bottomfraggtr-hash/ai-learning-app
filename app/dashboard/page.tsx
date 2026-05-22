import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { requireUser } from "@/lib/dal";
import { getCareerTracks } from "@/lib/services/career";
import { getDashboardSnapshot } from "@/lib/services/progress";
import { getRecommendations } from "@/lib/services/recommendations";
import { getRoadmap } from "@/lib/services/roadmap";

export default async function DashboardPage() {
  const user = await requireUser();
  const [snapshot, roadmapState, recommendationsState, careersState] = await Promise.all([
    getDashboardSnapshot(user.id, user.onboardingCompletedAt),
    getRoadmap(user.id, user.onboardingCompletedAt),
    getRecommendations(user.id, user.onboardingCompletedAt),
    getCareerTracks(user.id, user.onboardingCompletedAt),
  ]);

  return (
    <PageShell
      eyebrow="Dashboard"
      title="See your momentum, next action, and personalized learning direction in one place."
      description="This dashboard reads only your authenticated records. No seeded fallback profile is injected, so every card reflects either real database data or a clear onboarding state."
    >
      {snapshot.status === "onboarding-required" ? (
        <EmptyState
          title="Complete onboarding to unlock your personalized dashboard"
          description="Create your learner profile, answer the assessment, and we'll generate a roadmap, recommendations, and career directions based on your real starting point."
          ctaHref="/onboarding"
          ctaLabel="Start onboarding"
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Current streak" value={`${snapshot.streak} days`} hint="This will grow as you complete planned work across your roadmap." />
            <StatCard label="Completed steps" value={`${snapshot.completedSteps}`} hint="Tracked from the active roadmap snapshot stored for your account." />
            <StatCard label="Weekly hours" value={`${snapshot.weeklyHours}h`} hint="Used to keep the roadmap intensity realistic for your current availability." />
            <StatCard label="Focus score" value={`${snapshot.focusScore}%`} hint="A soft signal based on your current assessment output and roadmap fit." />
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <article
              className="rounded-xl p-6"
              style={{ border: "1px solid var(--color-line-subtle)", background: "var(--color-surface)" }}
            >
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-dim)" }}>
                Next action
              </p>
              <h2 className="mt-3 text-xl font-semibold" style={{ color: "var(--color-text)" }}>
                {snapshot.nextAction}
              </h2>
              {roadmapState.status === "ready" ? (
                <p className="mt-3 text-sm leading-7" style={{ color: "var(--color-muted)" }}>
                  Your current roadmap is{" "}
                  <span className="font-medium" style={{ color: "var(--color-text)" }}>
                    {roadmapState.roadmap.title}
                  </span>{" "}
                  with {roadmapState.roadmap.steps.length} tracked steps.
                </p>
              ) : (
                <p className="mt-3 text-sm leading-7" style={{ color: "var(--color-muted)" }}>
                  Your learner profile is ready. Generate or refresh the roadmap whenever you want to tune the plan.
                </p>
              )}
            </article>

            <article
              className="rounded-xl p-6"
              style={{ border: "1px solid var(--color-line-subtle)", background: "var(--color-surface)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-dim)" }}>
                  Career direction
                </p>
                <Link
                  href="/career"
                  className="text-sm transition"
                  style={{ color: "var(--color-accent-dim)" }}
                >
                  Open page
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {careersState.status === "ready" ? (
                  careersState.items.slice(0, 2).map((career) => (
                    <div
                      key={career.id}
                      className="rounded-lg p-4"
                      style={{ border: "1px solid var(--color-line-subtle)", background: "var(--color-surface-mid)" }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
                          {career.role}
                        </h3>
                        <span className="text-sm" style={{ color: "var(--color-accent)" }}>
                          {career.fitScore}%
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6" style={{ color: "var(--color-muted)" }}>
                        {career.summary}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-7" style={{ color: "var(--color-muted)" }}>
                    Career suggestions will appear here after the assessment is scored.
                  </p>
                )}
              </div>
            </article>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article
              className="rounded-xl p-6"
              style={{ border: "1px solid var(--color-line-subtle)", background: "var(--color-surface)" }}
            >
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-dim)" }}>
                Roadmap timeline
              </p>
              {roadmapState.status === "ready" ? (
                <div className="mt-5 space-y-3">
                  {roadmapState.roadmap.steps.map((step) => (
                    <div
                      key={step.id}
                      className="rounded-lg p-4"
                      style={{ border: "1px solid var(--color-line-subtle)", background: "var(--color-surface-mid)" }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
                          Week {step.week}: {step.title}
                        </h3>
                        <span
                          className="text-xs uppercase tracking-wide"
                          style={{ color: "var(--color-dim)" }}
                        >
                          {step.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6" style={{ color: "var(--color-muted)" }}>
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm leading-7" style={{ color: "var(--color-muted)" }}>
                  Your roadmap will appear here after assessment scoring finishes.
                </p>
              )}
            </article>

            <article
              className="rounded-xl p-6"
              style={{ border: "1px solid var(--color-line-subtle)", background: "var(--color-surface)" }}
            >
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-dim)" }}>
                Recommended learning blocks
              </p>
              {recommendationsState.status === "ready" ? (
                <div className="mt-5 space-y-3">
                  {recommendationsState.items.map((rec) => (
                    <div
                      key={rec.id}
                      className="rounded-lg p-4"
                      style={{ border: "1px solid var(--color-line-subtle)", background: "var(--color-surface-mid)" }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
                          {rec.title}
                        </h3>
                        <span className="text-sm" style={{ color: "var(--color-dim)" }}>
                          {rec.duration}
                        </span>
                      </div>
                      <p className="mt-1 text-sm" style={{ color: "var(--color-accent-dim)" }}>
                        {rec.provider}
                      </p>
                      <p className="mt-2 text-sm leading-6" style={{ color: "var(--color-muted)" }}>
                        {rec.reason}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm leading-7" style={{ color: "var(--color-muted)" }}>
                  Assessment-based course picks will appear here once your plan is generated.
                </p>
              )}
            </article>
          </section>
        </>
      )}
    </PageShell>
  );
}
