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
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="signup-name" className="text-sm text-slate-300">
          Name
        </label>
        <input
          id="signup-name"
          type="text"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          required
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
          placeholder="What should we call you?"
        />
      </div>

      <div>
        <label htmlFor="signup-email" className="text-sm text-slate-300">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          required
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="signup-password" className="text-sm text-slate-300">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          required
          minLength={8}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
          placeholder="At least 8 characters"
        />
      </div>

      {error?.formErrors?.length ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error.formErrors[0]}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Creating account..." : "Create account"}
      </button>

      <p className="text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald-200 transition hover:text-emerald-100">
          Sign in here
        </Link>
        .
      </p>
    </form>
  );
}
