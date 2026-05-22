# AI Learning App

A Next.js application that provides personalized learning roadmaps, AI-driven assessments, and a study buddy chatbot. Built for a college project.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Database**: Supabase (PostgreSQL) + Prisma ORM
- **Authentication**: Better Auth
- **AI Provider**: Google Generative AI (Gemini Flash)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables by copying `.env.example` to `.env.local` and filling in your API keys.

3. Push the database schema:
   ```bash
   npx prisma db push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
