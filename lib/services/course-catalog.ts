import { prisma } from "@/lib/db";
import type { LearnerProfile } from "@/lib/types";

const DEFAULT_COURSE_CATALOG = [
  {
    slug: "html-css-foundations",
    title: "HTML and CSS Foundations",
    provider: "AI Learning Studio",
    domain: "web-development",
    topic: "Frontend fundamentals",
    stackTags: ["html", "css", "frontend", "foundations"],
    level: "Beginner",
    duration: "6 hours",
    summary: "Covers semantic HTML, layout, responsive basics, and the building blocks behind every web path.",
    url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content",
  },
  {
    slug: "javascript-practical-basics",
    title: "Practical JavaScript Basics",
    provider: "AI Learning Studio",
    domain: "web-development",
    topic: "JavaScript",
    stackTags: ["javascript", "frontend", "backend", "foundations"],
    level: "Beginner",
    duration: "8 hours",
    summary: "Strengthens variables, functions, async flow, and DOM thinking for learners moving into application code.",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
  },
  {
    slug: "typescript-for-builders",
    title: "TypeScript for Builders",
    provider: "AI Learning Studio",
    domain: "web-development",
    topic: "TypeScript",
    stackTags: ["typescript", "nextjs", "react", "backend"],
    level: "Beginner",
    duration: "5 hours",
    summary: "Focuses on safe component props, API contracts, and practical types for full-stack projects.",
    url: "https://www.typescriptlang.org/docs/handbook/intro.html",
  },
  {
    slug: "react-component-patterns",
    title: "React Component Patterns",
    provider: "AI Learning Studio",
    domain: "web-development",
    topic: "React",
    stackTags: ["react", "frontend", "nextjs"],
    level: "Intermediate",
    duration: "7 hours",
    summary: "Builds confidence with state, composition, forms, and client/server boundaries in modern React apps.",
    url: "https://react.dev/learn",
  },
  {
    slug: "node-express-api-basics",
    title: "Node and Express API Basics",
    provider: "AI Learning Studio",
    domain: "web-development",
    topic: "Backend APIs",
    stackTags: ["node", "express", "mern", "backend"],
    level: "Intermediate",
    duration: "6 hours",
    summary: "Walks through REST APIs, middleware, validation, and CRUD patterns that power MERN-style backends.",
    url: "https://expressjs.com/en/starter/installing.html",
  },
  {
    slug: "mongodb-modeling-lab",
    title: "MongoDB Modeling Lab",
    provider: "AI Learning Studio",
    domain: "web-development",
    topic: "Databases",
    stackTags: ["mongodb", "mern", "backend", "database"],
    level: "Intermediate",
    duration: "4 hours",
    summary: "Introduces collections, schema thinking, indexing, and document modeling for MERN learners.",
    url: "https://www.mongodb.com/docs/manual/core/data-modeling-introduction/",
  },
  {
    slug: "nextjs-typescript-postgres",
    title: "Next.js, TypeScript, and PostgreSQL",
    provider: "AI Learning Studio",
    domain: "web-development",
    topic: "Full-stack web apps",
    stackTags: ["nextjs", "typescript", "postgresql", "prisma"],
    level: "Intermediate",
    duration: "9 hours",
    summary: "Connects App Router, typed route handlers, Postgres, and Prisma into a production-style learning path.",
    url: "https://nextjs.org/learn",
  },
  {
    slug: "postgres-prisma-data-layer",
    title: "PostgreSQL and Prisma Data Layer",
    provider: "AI Learning Studio",
    domain: "web-development",
    topic: "Data modeling",
    stackTags: ["postgresql", "prisma", "database", "backend"],
    level: "Intermediate",
    duration: "5 hours",
    summary: "Teaches relational modeling, Prisma schema design, and how to connect clean persistence to app features.",
    url: "https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma",
  },
  {
    slug: "testing-and-debugging-workflows",
    title: "Testing and Debugging Workflows",
    provider: "AI Learning Studio",
    domain: "web-development",
    topic: "Quality and delivery",
    stackTags: ["testing", "debugging", "frontend", "backend"],
    level: "Intermediate",
    duration: "4 hours",
    summary: "Builds habits for debugging, verifying features, and shipping reliably as projects become more complex.",
    url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing",
  },
];

function normalize(values: string[]) {
  return values.map((value) => value.trim().toLowerCase());
}

export async function ensureCourseCatalog() {
  if ((await prisma.courseCatalogItem.count()) > 0) {
    return;
  }

  await prisma.courseCatalogItem.createMany({
    data: DEFAULT_COURSE_CATALOG,
    skipDuplicates: true,
  });
}

export async function getCatalogMatches(profile: Pick<LearnerProfile, "preferredStack" | "knownLanguages" | "knownFrameworks" | "knownDatabases" | "selfRatedLevel">, limit = 8) {
  await ensureCourseCatalog();

  const items = await prisma.courseCatalogItem.findMany({
    where: {
      domain: "web-development",
    },
    orderBy: {
      title: "asc",
    },
  });

  const matchTags = new Set(
    normalize([
      ...profile.preferredStack,
      ...profile.knownLanguages,
      ...profile.knownFrameworks,
      ...profile.knownDatabases,
    ]),
  );

  const preferredLevel = profile.selfRatedLevel === "beginner" ? "beginner" : "intermediate";

  return items
    .map((item) => {
      const itemTags = normalize(item.stackTags);
      const stackScore = itemTags.reduce((score, tag) => score + (matchTags.has(tag) ? 3 : 0), 0);
      const levelScore = item.level.toLowerCase().includes(preferredLevel) ? 2 : 0;

      return {
        ...item,
        relevanceScore: stackScore + levelScore,
      };
    })
    .sort((left, right) => right.relevanceScore - left.relevanceScore || left.title.localeCompare(right.title))
    .slice(0, limit);
}
