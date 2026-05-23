const DOMAIN_IMAGE_MAP: Record<string, string> = {
  "Software Engineering / Web Development": "/images/domains/software.png",
  "Data Science / AI / ML": "/images/domains/data_science.png",
  "Medicine & Healthcare": "/images/domains/medicine.png",
  "Law & Legal Studies": "/images/domains/law.png",
  "Business & Consultancy": "/images/domains/business.png",
  "Design & UX": "/images/domains/design.png",
};

export function PageShell({
  eyebrow,
  title,
  description,
  domain,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  domain?: string | null;
  children: React.ReactNode;
}) {
  const bannerImage = domain && DOMAIN_IMAGE_MAP[domain] ? DOMAIN_IMAGE_MAP[domain] : "/images/domains/software.png";

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
      <div
        className="relative mb-10 overflow-hidden rounded-[2rem] p-8 sm:p-12"
        style={{ border: "1px solid var(--color-line-subtle)" }}
      >
        {domain && (
          <div className="absolute inset-0 z-0">
            <img src={bannerImage} alt="" className="h-full w-full object-cover opacity-25 mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-transparent to-[#0a0a0c]" />
          </div>
        )}
        
        <div className="relative z-10">
          <p
            className="text-sm font-medium uppercase tracking-[0.2em]"
            style={{ color: "var(--color-accent-dim)" }}
          >
            {eyebrow}
          </p>
          <h1
            className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl"
            style={{ color: "var(--color-text)" }}
          >
            {title}
          </h1>
          {description && (
            <p
              className="mt-4 max-w-2xl text-base leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </main>
  );
}
