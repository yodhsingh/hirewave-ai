# Software Engineering Project - IIT Madras

## Project Overview
GenAI-First Interview Platform - An AI-powered asynchronous interview platform that enables HR teams to efficiently screen thousands of candidates while giving applicants fair opportunities to showcase their skills beyond traditional resumes.

## Project Structure
```
frontend/
├── app/
│   ├── (applicant)/        # Routes for the candidate-facing interview process
│   ├── (hr)/               # Routes for the HR administrative dashboard
│   ├── (public)/           # Routes for public-facing pages (home, about)
│   │   ├── contact/
│   │   ├── pricing/
│   │   └── page.tsx        # Public homepage
│   ├── api/                # Backend API routes (serverless functions)
│   │   ├── candidates/
│   │   ├── interviews/
│   │   ├── invites/
│   │   └── jobs/
│   ├── layout.tsx          # Root layout for the entire application
│   └── page.tsx            # Entry page (often redirects or serves homepage)
├── components/
│   ├── hr/                 # Domain-specific: HR dashboard components
│   ├── layout/             # Reusable layout components (Header, Sidebar)
│   └── ui/                 # Generic, reusable UI atoms (Button, Card)
├── lib/
│   ├── api-client.ts       # Centralized API fetching logic (e.g., fetch wrapper)
│   ├── stores.ts           # Client-side state management (e.g., Zustand/Jotai)
│   ├── theme.ts            # Theming and design token definitions
│   └── validation.ts       # Zod schemas for form validation
├── public/                 # Static assets (images, fonts, SVGs)
├── types/                  # Global TypeScript type definitions
├── globals.css             # Global stylesheet (Tailwind base styles)
├── next.config.ts          # Next.js configuration file
└── tailwind.config.ts      # Tailwind CSS configuration and theming

```
## Key File Explanations

## Design Documentation

### /design
- **Single Source of Truth**: System architecture and visual flow.

#### /design/class_diagrams/
- **Architectural Blueprints**: 
  - .mmd files for version control and updates.
  - Define boundaries and responsibilities in Clean Architecture model.
- **class_diagrams.pdf**: Consolidated view of architectural layers.
- **genai_design_flow.excalidraw**: High-level flowchart of user journey and system interactions, focusing on GenAI processes.

## Component Documentation

### /frontend/components
- **Organized by Domain & Reusability**: Modular design principle.

## Technology Stack

### Frontend
- Framework: React,Next.js
- Styling: Tailwind

### Backend
- Framework: [To be decided - Python with FastAPI/Flask]
- ORM: [To be decided - SQLAlchemy or no ORM]
- Database: [To be decided - PostgreSQL]
- Authentication: [To be decided]

## Getting Started

### Prerequisites
- Node.js (v22 latest LTS) + npm or npx
- UV for python backend

### Installation

#### Clone the repository
```bash
git clone https://github.com/just-ravina/soft-engg-project-sept-2025-se-SEP-15
cd soft-engg-project-sept-2025-se-SEP-15
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Backend Setup
```bash
cd backend
uv sync
```

# UI Design

### Frontend UI Specification — HireWave.ai

Date: 2025-11-04
Branch: sidhaarth-frontend
App: Next.js (App Router) + React + TypeScript
Styling: Tailwind CSS 3.x, Framer Motion

### 1) Brand, Theme, and Typography

- Brand name: HireWave.ai
- Visual Theme: Dark-on-light contrast with glass overlays
  - Primary page background: `#0F0F0F` (rich near‑black)
  - Foreground sections use glass surfaces (blur, low‑opacity white) or light cards depending on context.
- Typography
  - Primary font: DM Sans (via `next/font`)
  - Weights used: 300 (light), 400 (regular), 500 (medium)
  - Letter spacing: Tight for headings; wide tracking for labels/badges.
  - Heading scale (desktop)
    - H1 hero: 72px (light)
    - Section titles: 56–80px depending on layout
    - Subheads: 24–32px
  - Body text: 14–16px (regular) with relaxed line height

### 2) Color System

- Neutrals
  - Background base: `#0F0F0F`
  - White overlays: rgba(255,255,255,0.03 – 0.15)
  - Card borders: rgba(255,255,255,0.10 – 0.20)
  - Text primary: `#FFFFFF`
  - Text secondary: `#9CA3AF` – `#A1A1AA` range (Tailwind gray‑400/500)
- Accents & Gradients
  - Subtle glass glow: radial white at 4–10% alpha
  - CTA (dark card variant): white text on black button
  - CTA (light card variant): black text on white button
- Scrollbar styling (system‑wide)
  - Track: transparent
  - Thumb: white, rounded
  - Firefox: `scrollbar-color: white transparent; scrollbar-width: thin;`

### 3) Imagery, Backgrounds, and Decorative Vectors

- Global background image: `/Background.svg` pinned to bottom (object‑bottom) with a top crop mask beyond 1400px to preserve composition.
- Hero decorative vector: `/Vector 1.svg` full‑width curve, placed behind the heading.
- Second section decorative vector: `/Vector 3.svg` anchored at the left edge; used in Demo Video section and Testimonials left column.
- Testimonials wave: `/Vector 4.svg` spans full viewport width above the section background.
- Highlight ellipse for hero metric: `/Ellipse 1.svg` positioned over the “10K+” span using absolute + transforms (no structural changes to the span).
- Robot imagery: `/image16.png` (formerly `/image13.png` in drafts). Responsive sizing with absolute placement on large screens and scaled widths for smaller widths.

### 4) Components and Patterns

- Buttons
  - Primary (dark surfaces): `bg-[#2D2D2D]` → hover `#1A1A1A`, white text, rounded 12–14px, medium weight.
  - Primary (light card): black background with white text; hover black/90.
  - Secondary (dark surfaces): glass style `bg-white/10` + `border-white/20`; hover `bg-white/15`.
  - Secondary (light card): transparent with thin black border; hover `bg-black/5`.
  - Iconography
    - Forward arrow: `/Forward.svg`
    - Double arrow: `/Double Right.svg`
    - Slow motion video circular icon: `/slow_motion_video.svg`
    - System emblem token: `/Icon.svg`
- Glass Cards
  - Background: `bg-white/[0.03–0.05]`
  - Border: `border-white/10`
  - Blur: `backdrop-blur-xl`
  - Radius: 24–28px
  - Inner highlight: optional radial gradient for depth
- Pills/Tags
  - Rounded full, thin border; used in Demo Video section (Digital / Reality / Next).

### 5) Iconography
- Icon pack: iOS 17 Glyph (system-style glyphs)


## Team Members
- Dalyodh Singh - 22f3001166@ds.study.iitm.ac.in
- Hiya Syal - 23f3003216@ds.study.iitm.ac.in
- Parmeet Singh - 22f1000535@ds.study.iitm.ac.in
- Shubham Tiwari - 22f1001934@ds.study.iitm.ac.in
- Akshit Mittal - 23f2004636@ds.study.iitm.ac.in
- Ravina - 21f2001128@ds.study.iitm.ac.in
- Sidhaarth Shree - 22f3001480@ds.study.iitm.ac.in
- Akash Kumar - 22f2000946@ds.study.iitm.ac.in

## API Documentation
*TBD*

## Testing
*TBD*

## Deployment
*TBD*
