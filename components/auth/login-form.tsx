"use client";

import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signIn.email({ email, password });

      if (result?.error) {
        setError(result.error.message || "Email or password is incorrect.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
          Sign in
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          Enter your credentials to continue.
        </p>
      </div>

      <div className="space-y-4 pt-1">
        <div>
          <label
            htmlFor="login-email"
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--color-dim)" }}
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input mt-1.5 w-full rounded-lg px-4 py-2.5 text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--color-dim)" }}
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input mt-1.5 w-full rounded-lg px-4 py-2.5 text-sm"
            placeholder="Enter your password"
          />
        </div>
      </div>

      {error ? (
        <p
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            border: "1px solid oklch(0.65 0.18 25 / 0.35)",
            background: "oklch(0.65 0.18 25 / 0.08)",
            color: "oklch(0.80 0.12 25)",
          }}
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: "var(--color-accent)",
          color: "var(--color-accent-fg)",
        }}
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-sm" style={{ color: "var(--color-dim)" }}>
        Need an account?{" "}
        <Link
          href="/signup"
          className="font-medium transition"
          style={{ color: "var(--color-accent-dim)" }}
        >
          Create one here
        </Link>
      </p>
    </form>
  );
}
