# HireWave.ai Frontend
````markdown
# HireWave.ai Frontend

The frontend of HireWave.ai, a GenAI powered interview platform designed to make candidate screening and asynchronous interviews more structured, efficient, and accessible.

Built with Next.js, React, TypeScript, and Tailwind CSS, the frontend provides separate experiences for candidates and HR teams while keeping the interface simple and consistent.

## What It Does

The frontend supports

- Candidate interview workflows
- HR job and candidate management
- Interview and application tracking
- AI powered interview experiences
- HR and candidate dashboards
- Public platform pages
- Backend API integration

## Technology

Next.js  
React  
TypeScript  
Tailwind CSS  
Framer Motion  
Zod

## Structure

```text
frontend/
├── app/
│   ├── (applicant)/        Candidate experience
│   ├── (hr)/               HR dashboard
│   ├── (public)/           Public pages
│   └── api/                Application API routes
│
├── components/
│   ├── hr/                 HR components
│   ├── layout/             Shared layout
│   └── ui/                 Reusable UI components
│
├── lib/                    API, state and validation
├── public/                 Static assets
├── types/                  TypeScript types
├── globals.css             Global styles
└── next.config.ts          Next.js configuration
````

## UI and UX

The interface is designed around clarity, consistency, and ease of use.

The visual system uses a dark theme with glass surfaces, subtle motion, strong typography, and responsive layouts.

Key design principles include

* Clear separation between HR and candidate workflows
* Reusable components and consistent interaction patterns
* Minimal visual clutter
* Responsive layouts across screen sizes
* Clear hierarchy between actions and information
* Subtle animation to improve interaction without distraction

The primary visual language uses DM Sans typography, dark surfaces, high contrast text, glass effects, and carefully controlled decorative elements.

## Screenshots

### Landing Page

Add screenshot here.

### HR Dashboard

Add screenshot here.

### Candidate Interview

Add screenshot here.

### AI Interview Experience

Add screenshot here.

## Getting Started

### Requirements

Node.js 22 or later
npm

### Installation

From the project root

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open the application at

```text
http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

## Development Approach

The frontend follows a modular component based structure.

Candidate and HR experiences are separated at the application level, while shared components, utilities, validation, and styling are kept reusable across the platform.

The goal is to make the interface easy to extend as new interview, AI, and hiring workflows are introduced.

[Sheet Link](https://docs.google.com/spreadsheets/d/16DyrLolVekmVpV2RqJknUtmDxR2YTgNZ-CwweH9NxdY/edit?gid=0#gid=0)
