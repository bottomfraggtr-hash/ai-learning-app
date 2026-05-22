"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await signOut();
        router.push("/");
      }}
      className="rounded-lg px-3 py-1.5 text-sm transition"
      style={{
        border: "1px solid var(--color-line-subtle)",
        color: "var(--color-muted)",
      }}
    >
      Sign out
    </button>
  );
}
