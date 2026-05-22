"use client";

import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type RegisterError = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[]>;
};

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<RegisterError | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signUp.email({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      if (result?.error) {
        setError({ formErrors: [result.error.message || "Unable to create your account."] });
        return;
      }

      router.push("/onboarding");
      router.refresh();
    });
  }

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
          Create account
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          Takes about 30 seconds.
        </p>
      </div>

      <div className="space-y-4 pt-1">
        <div>
          <label
            htmlFor="signup-name"
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--color-dim)" }}
          >
            Name
          </label>
          <input
            id="signup-name"
            type="text"
            value={form.name}
            onChange={update("name")}
            required
            className="auth-input mt-1.5 w-full rounded-lg px-4 py-2.5 text-sm"
            placeholder="What should we call you?"
          />
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--color-dim)" }}
          >
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            value={form.email}
            onChange={update("email")}
            required
            className="auth-input mt-1.5 w-full rounded-lg px-4 py-2.5 text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--color-dim)" }}
          >
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={form.password}
            onChange={update("password")}
            required
            minLength={8}
            className="auth-input mt-1.5 w-full rounded-lg px-4 py-2.5 text-sm"
            placeholder="At least 8 characters"
          />
        </div>
      </div>

      {error?.formErrors?.length ? (
        <p
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            border: "1px solid oklch(0.65 0.18 25 / 0.35)",
            background: "oklch(0.65 0.18 25 / 0.08)",
            color: "oklch(0.80 0.12 25)",
          }}
        >
          {error.formErrors[0]}
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
        {isPending ? "Creating account..." : "Create account"}
      </button>

      <p className="text-sm" style={{ color: "var(--color-dim)" }}>
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium transition"
          style={{ color: "var(--color-accent-dim)" }}
        >
          Sign in here
        </Link>
      </p>
    </form>
  );
}
