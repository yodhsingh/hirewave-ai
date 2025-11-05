# Software Engineering Project - IIT Madras

**View the running application:** [https://segenai.vercel.app](https://segenai.vercel.app)

> **For TAs and evaluators:** The frontend is deployed on Vercel with dummy/mock data for demonstration purposes. The application is not yet fully functional as the backend is still under development. You can explore the UI/UX including the HR dashboard, job creation flow, candidate management interface, and AI-powered practice interviews.

## Project Overview
GenAI-First Interview Platform - An AI-powered asynchronous interview platform that enables HR teams to efficiently screen thousands of candidates while giving applicants fair opportunities to showcase their skills beyond traditional resumes.

## Project Structure
*TBD*
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

## Technology Stack

### Frontend
- Framework: [To be decided - React/Vue/Angular]
- Styling: [To be decided - CSS/SCSS/Tailwind]
- State Management: [To be decided]

### Backend
- Framework: [To be decided - Python with FastAPI/Flask]
- ORM: [To be decided - SQLAlchemy or no ORM]
- Database: [To be decided - PostgreSQL]
- Authentication: [To be decided]

## Getting Started

### Prerequisites
- Node.js (v22 latest LTS) + npm or npx
- Git
- UV for python backend

### Installation

#### Clone the repository
```bash
git clone https://github.com/just-ravina/soft-engg-project-sept-2025-se-SEP-15
cd soft-engg-project-sept-2025-se-SEP-15
```

#### Frontend Setup
*TBD*
```bash
cd frontend
npm install
npm run dev
```

#### Backend Setup
*TBD*
```bash
cd backend
uv synch
```

## Development
*TBD*

## Team Members
- Dalyodh Singh - 22f3001166@ds.study.iitm.ac.in
- Hiya Syal - 23f3003216@ds.study.iitm.ac.in
- Parmeet Singh - 22f1000535@ds.study.iitm.ac.in
- Shubham Tiwari - 22f1001934@ds.study.iitm.ac.in
- Akshit Mittal - 23f2004636@ds.study.iitm.ac.in
- Ravina - 21f2001128@ds.study.iitm.ac.in
- Sidhaarth Shree - 22f3001480@ds.study.iitm.ac.in
- Akash Kumar - 22f2000946@ds.study.iitm.ac.in

## Project Requirements
*TBD*

## Features
*TBD*

## API Documentation
*TBD*

## Testing
*TBD*


## Deployment
*TBD*


## License
*TBD*
Should be MIT, or as per IIT Madras Software Engineering course.
