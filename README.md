# HireWave.ai

### GenAI-First Interview Platform

HireWave.ai is a full-stack, AI-powered interview platform designed to help organizations conduct structured asynchronous interviews and evaluate candidates beyond traditional resumes.

The project was originally developed as a collaborative Software Engineering project at IIT Madras. I am maintaining a personal copy to document my work, contributions, and continued development.

---

## What It Does

- AI-assisted interview generation
- Candidate interview workflow
- HR dashboard and candidate management
- Structured interview evaluation
- Job and interview management
- Backend APIs and persistent data storage
- Responsive web interface

---

## My Focus & Contributions

My work on the project focused on:

- Full-stack application development
- AI/GenAI integration
- Frontend architecture and user workflows
- Backend/API integration
- Data and application flow design
- Project architecture and technical coordination
- Connecting multiple components into an end-to-end product

> This repository contains collaborative work. Individual contributions should be interpreted in the context of the original team project.

---

## System Overview

```text
                    HireWave.ai

                         │
                         ▼
                ┌─────────────────┐
                │   Web Frontend  │
                │ React / Next.js  │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   Application   │
                │   Backend / API │
                └────────┬────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       ┌─────────────┐       ┌─────────────┐
       │  Database   │       │  GenAI / AI │
       │ PostgreSQL  │       │   Services  │
       └─────────────┘       └─────────────┘

                         │
                         ▼
                 Interview Results
                         │
                         ▼
                  HR / Candidate
                     Dashboard



