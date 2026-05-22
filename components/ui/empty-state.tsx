import Link from "next/link";

export function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <section
      className="rounded-xl p-10 text-center"
      style={{
        border: "1px dashed var(--color-line)",
        background: "var(--color-surface)",
      }}
    >
      <h2 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
        {title}
      </h2>
      <p
        className="mx-auto mt-3 max-w-xl text-sm leading-7"
        style={{ color: "var(--color-muted)" }}
      >
        {description}
      </p>
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref}
          className="mt-6 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
          style={{
            background: "var(--color-accent)",
            color: "var(--color-accent-fg)",
          }}
        >
          {ctaLabel}
        </Link>
      ) : null}
    </section>
  );
}
