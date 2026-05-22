export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
      <div
        className="mb-10 pb-8"
        style={{ borderBottom: "1px solid var(--color-line-subtle)" }}
      >
        <p
          className="text-sm font-medium"
          style={{ color: "var(--color-accent-dim)" }}
        >
          {eyebrow}
        </p>
        <h1
          className="mt-2 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
          style={{ color: "var(--color-text)" }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="mt-3 max-w-2xl text-sm leading-7"
            style={{ color: "var(--color-muted)" }}
          >
            {description}
          </p>
        )}
      </div>
      {children}
    </main>
  );
}
