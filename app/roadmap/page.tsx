import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { requireUser } from "@/lib/dal";
import { getRoadmap } from "@/lib/services/roadmap";

function getFaviconUrl(urlString: string) {
  try {
    const domain = new URL(urlString).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return "";
  }
}

export default async function RoadmapPage() {
  const user = await requireUser();
  const roadmapState = await getRoadmap(user.id, user.onboardingCompletedAt);

  return (
    <PageShell
      eyebrow="Roadmap"
      title="A structured learning plan shaped by real onboarding and assessment data."
      description="This roadmap reads from your account records instead of shared starter content, so pacing and milestones stay tied to your preferred stack and current level."
      domain={roadmapState.status === "ready" ? roadmapState.roadmap.domain : null}
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
            <div className="mt-8 relative border-l-2 border-white/10 ml-3 space-y-8 pb-4">
              {roadmapState.roadmap.steps.map((step) => (
                <div
                  key={step.id}
                  className="relative pl-8"
                >
                  <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-4 border-[#0a0a0c] bg-emerald-400" />
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
                        Week {step.week}: {step.title}
                      </h3>
                      <div
                        className="flex items-center gap-3 text-xs uppercase tracking-wide"
                        style={{ color: "var(--color-dim)" }}
                      >
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium tracking-widest text-slate-400">
                          {step.status}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium tracking-widest text-slate-400">
                          {step.estimatedHours}h
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-sm leading-7" style={{ color: "var(--color-muted)" }}>
                      {step.description}
                    </p>
                    {step.resourceUrl ? (
                      <a
                        href={step.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex w-fit items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
                        style={{ color: "var(--color-text)" }}
                      >
                        <img 
                          src={getFaviconUrl(step.resourceUrl)} 
                          alt="" 
                          className="h-4 w-4 rounded-sm" 
                          loading="lazy"
                        />
                        {step.resourceTitle ?? "Open recommended resource"}
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}
    </PageShell>
  );
}
