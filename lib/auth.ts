import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";

let authBaseURL: string | undefined = undefined;

if (process.env.BETTER_AUTH_URL && process.env.BETTER_AUTH_URL.startsWith("http")) {
  authBaseURL = process.env.BETTER_AUTH_URL;
} else if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  authBaseURL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
} else if (process.env.VERCEL_URL) {
  authBaseURL = `https://${process.env.VERCEL_URL}`;
} else if (process.env.NODE_ENV !== "production") {
  authBaseURL = "http://localhost:3000";
}

const authSecret = process.env.BETTER_AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const auth = betterAuth({
  baseURL: authBaseURL,
  secret: authSecret,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
