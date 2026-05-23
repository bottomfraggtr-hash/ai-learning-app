import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { requireUser } from "@/lib/dal";
import { getRecommendations } from "@/lib/services/recommendations";

function getFaviconUrl(urlString: string) {
  try {
    const domain = new URL(urlString).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return "";
  }
}

export default async function RecommendationsPage() {
  const user = await requireUser();
  const recommendationsState = await getRecommendations(user.id, user.onboardingCompletedAt);

  return (
    <PageShell
      eyebrow="Recommendations"
      title="Course and practice recommendations matched to your learner profile."
      description="Each item here belongs to the signed-in user and is created from the assessment result plus the course catalog stored in the database."
      domain={user.learnerProfile?.primaryInterest}
    >
      {recommendationsState.status === "onboarding-required" ? (
        <EmptyState
          title="Recommendations unlock after onboarding"
          description="We need your profile and assessment answers before we can rank the right courses and practice blocks for you."
          ctaHref="/onboarding"
          ctaLabel="Complete onboarding"
        />
      ) : recommendationsState.status === "empty" ? (
        <EmptyState
          title="No recommendations have been saved yet"
          description="Your account does not have personalized course picks yet. Generate the roadmap flow first and they will appear here."
          ctaHref="/dashboard"
          ctaLabel="Open dashboard"
        />
      ) : (
        <section className="grid gap-4 lg:grid-cols-3">
          {recommendationsState.items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl p-6"
              style={{ border: "1px solid var(--color-line-subtle)", background: "var(--color-surface)" }}
            >
              <p className="text-xs font-medium" style={{ color: "var(--color-accent-dim)" }}>
                {item.topic}
              </p>
              <h2 className="mt-2 text-xl font-semibold" style={{ color: "var(--color-text)" }}>
                {item.title}
              </h2>
              <p className="mt-1.5 text-xs" style={{ color: "var(--color-dim)" }}>
                {item.provider} · {item.level} · {item.duration}
              </p>
              <p className="mt-3 text-sm leading-7" style={{ color: "var(--color-muted)" }}>
                {item.reason}
              </p>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
                style={{ color: "var(--color-text)" }}
              >
                <img 
                  src={getFaviconUrl(item.url)} 
                  alt="" 
                  className="h-4 w-4 rounded-sm" 
                  loading="lazy"
                />
                Open resource
              </a>
            </article>
          ))}
        </section>
      )}
    </PageShell>
  );
}
