import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCurrentUser } from "@/lib/dal";
import "./globals.css";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/study-buddy", label: "Study Buddy" },
  { href: "/career", label: "Career" },
  { href: "/recommendations", label: "Recommendations" },
];

export const metadata: Metadata = {
  title: "AI Learning Studio",
  description: "A server-first learning app starter with Prisma-backed structure and AI-ready routes.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="antialiased">
      <body
        className="min-h-screen"
        style={{
          background: "var(--color-bg)",
          color: "var(--color-text)",
        }}
      >
        <div className="min-h-screen">
          <header
            className="sticky top-0 z-30"
            style={{ borderBottom: "1px solid var(--color-line-subtle)", background: "var(--color-bg)" }}
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-12">
              <Link href="/" className="flex items-center gap-2.5">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded text-[9px] font-black"
                  style={{
                    background: "var(--color-accent)",
                    color: "var(--color-accent-fg)",
                  }}
                >
                  AL
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                  Learning Studio
                </span>
              </Link>

              <nav className="hidden items-center gap-6 md:flex">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="nav-link text-sm"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <span className="hidden text-xs lg:inline" style={{ color: "var(--color-dim)" }}>
                      {user.name}
                    </span>
                    <SignOutButton />
                  </>
                ) : (
                  <>
                    <Link href="/login" className="nav-link text-sm">
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-lg px-4 py-2 text-sm font-semibold transition hover:opacity-90"
                      style={{
                        background: "var(--color-accent)",
                        color: "var(--color-accent-fg)",
                      }}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}
