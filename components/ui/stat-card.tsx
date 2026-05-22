export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article
      className="rounded-xl p-6"
      style={{
        border: "1px solid var(--color-line-subtle)",
        background: "var(--color-surface)",
      }}
    >
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-dim)" }}>
        {label}
      </p>
      <p className="mt-3 text-4xl font-semibold" style={{ color: "var(--color-text)" }}>
        {value}
      </p>
      <p className="mt-3 text-sm leading-6" style={{ color: "var(--color-muted)" }}>
        {hint}
      </p>
    </article>
  );
}
