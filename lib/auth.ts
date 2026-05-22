import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";

const authBaseURL =
  process.env.BETTER_AUTH_URL ||
  (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : undefined);

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
