# AI Learning App

A Next.js application that provides personalized learning roadmaps, AI-driven assessments, and a study buddy chatbot. Built for a college project.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Database**: Supabase (PostgreSQL) + Prisma ORM
- **Authentication**: Better Auth
- **AI Provider**: Google Generative AI (Gemini Flash)

## Environment Variables

Create a `.env` file in the root directory and configure the following required variables:

```env
# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"

# Authentication (Better Auth)
BETTER_AUTH_SECRET="generate-a-secure-random-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000" # Change this to your production URL when deploying

# AI Providers (Provide at least one)
GOOGLE_GENERATIVE_AI_API_KEY="your-google-gemini-api-key"
# OPENAI_API_KEY="your-openai-api-key" # Optional alternative
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup your environment variables as shown above.

3. Push the database schema:
   ```bash
   npx prisma db push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
