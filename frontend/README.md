Here is the comprehensive, formal `README.md` file generated based on your project's architectural specifications.

-----

# GenAI-First Interview Platform

**Software Engineering Project - IIT Madras**

[](https://segenai.vercel.app)
[](https://nextjs.org/)
[](https://www.google.com/search?q=./design/class_diagrams/)

-----

## 1\. Project Overview

This project presents a **GenAI-First Asynchronous Interview Platform**, designed to modernize the technical recruitment and candidate screening process. The primary objective is to develop a system that empowers Human Resources (HR) teams to efficiently evaluate a large volume of applicants while providing candidates with a fair, flexible, and robust opportunity to demonstrate their skills beyond the limitations of a traditional resume. The platform leverages Generative AI to conduct automated, in-depth interviews, analyze responses, and provide structured feedback, thereby reducing bias and streamlining the hiring workflow.

The system is architected around a clear separation of concerns, featuring a reactive frontend built with Next.js and a sophisticated, layered design model. The core innovation lies in the integration of an AI-assisted interview flow, which guides candidates through role-specific questions, and an administrative dashboard that provides HR personnel with powerful analytics and candidate management tools. The design documentation, including extensive flowcharts and class diagrams, maps out a clean, scalable architecture, ensuring that the frontend user experience is seamlessly integrated with the underlying domain logic and AI services.

## 2\. System Architecture

The system's architecture is modeled on **Clean Architecture** principles, separating the software into distinct, independent layers. This design promotes modularity, testability, and maintainability by enforcing a strict dependency rule: inner layers (domain) do not depend on outer layers (infrastructure, UI).

The architectural design is documented in detail within the `/design/class_diagrams` directory, using Mermaid (`.mmd`) and PDF formats. These diagrams illustrate the logical separation of concerns:

1.  **Domain Layer:** Represents the core business logic and entities (e.g., `User`, `Job`, `Interview`, `Candidate`). This is the heart of the application.
      * *Reference: `01-domain-layer---core-entities.mmd`*
2.  **AI Layer:** Defines abstractions and interfaces for Generative AI services (e.g., interview question generation, response analysis, feedback).
      * *Reference: `02-ai-layer---abstractions.mmd`*
3.  **Application Layer:** Contains the application-specific business rules and services that orchestrate the flow of data between the domain layer and the outer layers.
      * *Reference: `03-application-layer---services.mmd`*
4.  **Infrastructure Layer:** Provides concrete implementations for external concerns, such as database access (e.g., PostgreSQL repositories), third-party AI model clients, and payment gateways.
      * *Reference: `04-infrastructure-layer---implementations.mmd`*
5.  **API Layer:** Exposes the application's functionality to the outside world via RESTful endpoints, connecting the backend logic to the frontend client.
      * *Reference: `05-api-layer---endpoints.mmd`*
6.  **Analytics Layer:** Defines the data flow and models for capturing user interactions and generating insights for the HR dashboard.
      * *Reference: `06-analytics-layer---data-flow.mmd`*

The overall system flow, particularly the interaction between the user, the GenAI models, and the system database, is visualized in `design/genai_design_flow.excalidraw`.

## 3\. Frontend Structure (Next.js + TypeScript)

The `frontend/` directory contains the entire client-facing application, built using **Next.js 14** (App Router) and **TypeScript**. This framework provides file-based routing, server-side rendering (SSR), and a robust component model.

Below is a hierarchical view of the key frontend directories:

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

### Key File Explanations

  * **`/frontend/app`**: This is the core of the Next.js App Router. Each folder represents a URL segment.
      * `layout.tsx`: Defines the root HTML shell, loading global providers and styles.
      * `page.tsx`: The main component rendered for a specific route.
      * `(folder_name)`: Route groups used to organize routes (e.g., `(hr)`) without affecting the URL path.
  * **`/frontend/lib`**: This directory holds the frontend's "business logic" and core utilities. It separates logic from the UI (components), enabling cleaner code.
  * **`/frontend/public`**: All files in this directory are served statically at the root URL (e.g., `/logo.svg`).

## 4\. Design Documentation

The `/design` directory serves as the single source of truth for the system's architecture and visual flow.

  * **`/design/class_diagrams/`**: This folder contains the formal architectural blueprints.
      * The `.mmd` (Mermaid) files are the source code for the diagrams, allowing for easy version control and updates.
      * They collectively define the boundaries and responsibilities of each layer in our **Clean Architecture** model.
      * `class_diagrams.pdf` provides a consolidated, viewable version of all architectural layers.
  * **`genai_design_flow.excalidraw`**: This is a high-level flowchart or visualization (editable with Excalidraw) that illustrates the end-to-end user journey and system interactions, particularly focusing on the GenAI processes.

## 5\. Component Documentation

The `/frontend/components` directory is organized by domain and reusability, following a modular design principle.

### \#\#\# `components/ui/`

This directory contains the primitive, reusable UI components that form the application's design system. They are "headless" or style-agnostic where possible, with styling applied via Tailwind CSS.

  * **Examples:** `Button.tsx`, `Card.tsx`, `Input.tsx`, `Dialog.tsx`.
  * **Purpose:** To ensure a consistent look and feel across the entire application and accelerate development.

### \#\#\# `components/layout/`

These components are responsible for the structural layout and navigation of the application.

  * **Examples:** `Header.tsx`, `Footer.tsx`, `Sidebar.tsx`, `PageWrapper.tsx`.
  * **Purpose:** To provide a consistent navigational experience for different user roles (e.g., a candidate vs. an HR admin).

### \#\#\# `components/hr/`

These are domain-specific, composite components used exclusively within the HR dashboard. They are built by combining smaller `ui` and `layout` components.

  * **Examples:** `HRDashboardAnalytics.tsx`, `JobCreationForm.tsx`, `CandidateListing.tsx`.
  * **Purpose:** To encapsulate complex features for the HR user persona.

### \#\#\# `components/LoginModal.tsx`

This is a key entry-point component that likely handles user authentication (login/signup) for all user roles. It manages authentication state and interfaces with the authentication API endpoints.

## 6\. Libraries and Configurations

The project's root contains several key configuration files that define the development environment, dependencies, and build processes.

  * **`package.json`**: Lists all project dependencies (e.g., `next`, `react`, `tailwindcss`) and `scripts` (e.g., `npm run dev`, `npm run build`).
  * **`tailwind.config.ts`**: Configures the Tailwind CSS utility-first framework, including custom themes, colors, and plugins.
  * **`tsconfig.json`**: The TypeScript compiler configuration file, defining strictness rules, path aliases, and target JavaScript version.
  * **`eslint.config.mjs`**: Configuration for the ESLint linter, enforcing code quality and style consistency.
  * **`restart.sh`**: A utility shell script, likely used for forcefully restarting the development server or a deployment environment.

## 7\. API and Integration

The application uses Next.js API Routes (located in `/frontend/app/api/`) to function as its backend, providing serverless endpoints for the frontend to consume.

  * **Structure:** The API follows a RESTful resource-oriented structure.
      * `/frontend/app/api/jobs`: Handles creation, retrieval, updating, and deletion (CRUD) of job postings.
      * `/frontend/app/api/candidates`: Manages candidate data and submissions.
      * `/frontend/app/api/interviews`: The core endpoint for initiating, processing, and retrieving AI-assisted interview sessions.
      * `/frontend/app/api/invites`: Manages sending and validating interview invitation tokens.
  * **Dynamic Routes:** Folders like `[id]` (e.g., `api/jobs/[id]`) and `[token]` are dynamic segments that allow the API to handle requests for specific resources.
  * **Backend Integration:** These API routes are the "backend-for-frontend" (BFF). They are responsible for validating incoming requests from the client, interacting with the database (Infrastructure Layer), and calling AI services (AI Layer) before returning a response to the Next.js frontend.

## 8\. Installation and Setup

To run the frontend development server locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/just-ravina/soft-engg-project-sept-2025-se-SEP-15.git
    ```

2.  **Navigate into the frontend directory:**

    ```bash
    cd soft-engg-project-sept-2025-se-SEP-15/frontend
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## 9\. Design References and Documentation Artifacts

The following design artifacts are critical for understanding the system's logic and architecture. They are located in the `/design` folder.

  * `class_diagrams/class_diagrams.pdf`: (PDF) Consolidated view of all architectural layers.
  * `class_diagrams/01-domain-layer---core-entities.mmd`: (Mermaid) Defines core entities (Job, User, etc.).
  * `class_diagrams/02-ai-layer---abstractions.mmd`: (Mermaid) Defines interfaces for AI services.
  * `class_diagrams/03-application-layer---services.mmd`: (Mermaid) Defines application use cases and services.
  * `class_diagrams/04-infrastructure-layer---implementations.mmd`: (Mermaid) Defines concrete implementations (DB, external APIs).
  * `class_diagrams/05-api-layer---endpoints.mmd`: (Mermaid) Maps services to API endpoints.
  * `class_diagrams/06-analytics-layer---data-flow.mmd`: (Mermaid) Defines data models for analytics.
  * `genai_design_flow.excalidraw`: (Excalidraw) Visual flowchart of the primary user (candidate) and GenAI interaction.

## 10\. Academic Reflection

This project is an exercise in applying modern software engineering principles to a complex, real-world problem. The architecture heavily emphasizes **modularity**, **abstraction**, and **separation of concerns** as defined by **SOLID** principles and a **Clean Architecture** model.

By enforcing a layered design, we ensure that the core business logic (Domain Layer) is entirely independent of the database, user interface, and AI services (Infrastructure/UI Layers). This decoupling is essential for long-term maintainability and testability.

The integration of Generative AI is not an afterthought but a core component of the system, represented by its own abstract layer. This allows the system to be **AI-agnostic**, meaning the underlying AI models (e.g., from OpenAI, Anthropic, or a local model) can be swapped without affecting the application's business rules. The use of **Domain-Driven Design (DDD)** principles, evident in the naming of components (`/hr`, `/applicant`) and services, ensures that the software model accurately reflects the business domain of human resources and recruitment.

## 11\. Contributors and Future Work

### Contributors

  * *Further documentation required for this module. (List of team members, supervisors, and TAs to be added here.)*

### Future Work

This platform serves as a robust foundation for numerous research and development extensions. Potential future work includes:

  * Advanced bias detection and mitigation algorithms in AI feedback.
  * Integration with Applicant Tracking Systems (ATS) like Greenhouse or Lever.
  * Real-time, conversational AI interviews in addition to asynchronous sessions.
  * Long-term predictive analytics to correlate interview performance with on-the-job success.
