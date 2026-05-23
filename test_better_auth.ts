process.env.BETTER_AUTH_URL = "postgresql://postgres:pass@host/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./lib/db";

const auth = betterAuth({
  baseURL: "https://my-app.vercel.app",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true }
});

console.log("betterAuth initialized successfully");
