# HireWave.ai Frontend

The frontend for HireWave.ai, a GenAI powered asynchronous interview platform designed to help organizations manage candidate screening and interviews through a structured web experience.

The application provides separate workflows for candidates and HR teams, connecting the interview experience with the platform backend and AI powered services.

## What It Does

The frontend supports

- Candidate interview workflows
- HR job and candidate management
- Interview management
- Candidate and HR dashboards
- Public pages for the platform
- API integration with the backend
- Responsive and reusable UI components
- Form validation and client side state management

## Technology

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Zod
- Client side state management

## Project Structure

```text
frontend/
├── app/
│   ├── (applicant)/        Candidate workflows
│   ├── (hr)/               HR workflows
│   ├── (public)/           Public pages
│   ├── api/                Application API routes
│   ├── layout.tsx          Root application layout
│   └── page.tsx            Application entry point
│
├── components/
│   ├── hr/                 HR specific components
│   ├── layout/             Shared layout components
│   └── ui/                 Reusable UI components
│
├── lib/
│   ├── api-client.ts       API communication
│   ├── stores.ts           Client state
│   ├── theme.ts            Design system
│   └── validation.ts       Form validation
│
├── public/                 Static assets
├── types/                  Shared TypeScript types
├── globals.css             Global styles
├── next.config.ts          Next.js configuration
└── tailwind.config.ts      Tailwind configuration
