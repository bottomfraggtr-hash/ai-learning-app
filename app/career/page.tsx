import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { requireUser } from "@/lib/dal";
import { getCareerTracks } from "@/lib/services/career";

export default async function CareerPage() {
  const user = await requireUser();
  const careersState = await getCareerTracks(user.id, user.onboardingCompletedAt);

  return (
    <PageShell
      eyebrow="Career Guidance"
      title="Career suggestions grounded in your assessment and preferred stack."
      description="These suggestions are generated per learner and stored in the database instead of being shared starter cards."
      domain={user.learnerProfile?.primaryInterest}
    >
      {careersState.status === "onboarding-required" ? (
        <EmptyState
          title="Career guidance starts after assessment"
          description="Complete onboarding and the assessment first, then we can suggest roles and next-skill areas that match your current profile."
          ctaHref="/onboarding"
          ctaLabel="Complete onboarding"
        />
      ) : careersState.status === "empty" ? (
        <EmptyState
          title="No career suggestions yet"
          description="Your account doesn't have saved role-fit suggestions right now. Generate or refresh the learning plan to create them."
          ctaHref="/dashboard"
          ctaLabel="Open dashboard"
        />
      ) : (
        <section className="grid gap-4 lg:grid-cols-3">
          {careersState.items.map((career) => (
            <article
              key={career.id}
              className="rounded-xl p-6"
              style={{ border: "1px solid var(--color-line-subtle)", background: "var(--color-surface)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
                  {career.role}
                </h2>
                <span
                  className="shrink-0 text-sm font-medium tabular-nums"
                  style={{ color: "var(--color-accent)" }}
                >
                  {career.fitScore}%
                </span>
              </div>
              <p className="mt-3 text-sm leading-7" style={{ color: "var(--color-muted)" }}>
                {career.summary}
              </p>
              <p className="mt-3 text-sm leading-7" style={{ color: "var(--color-muted)" }}>
                {career.growthSignal}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {career.nextSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md px-2.5 py-1 text-xs font-medium"
                    style={{
                      border: "1px solid var(--color-line-subtle)",
                      background: "var(--color-surface-mid)",
                      color: "var(--color-muted)",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </PageShell>
  );
}
