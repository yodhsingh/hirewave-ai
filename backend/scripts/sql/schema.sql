-- HireWave.AI Database Schema (DDL)
-- PostgreSQL Database Schema with Integer IDs

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS candidate_scores CASCADE;
DROP TABLE IF EXISTS interview_responses CASCADE;
DROP TABLE IF EXISTS invites CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing ENUM types
DROP TYPE IF EXISTS invite_status CASCADE;
DROP TYPE IF EXISTS candidate_status CASCADE;
DROP TYPE IF EXISTS question_type CASCADE;
DROP TYPE IF EXISTS role_type CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('HR', 'CANDIDATE', 'ADMIN');
CREATE TYPE job_status AS ENUM ('draft', 'active', 'closed', 'archived');
CREATE TYPE role_type AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'TEMPORARY');
CREATE TYPE question_type AS ENUM ('video', 'text', 'phone', 'code', 'multiple_choice');
CREATE TYPE candidate_status AS ENUM ('invited', 'started', 'in_progress', 'submitted', 'scored', 'shortlisted', 'rejected', 'hired');
CREATE TYPE invite_status AS ENUM ('pending', 'sent', 'opened', 'expired', 'used');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'CANDIDATE',
    company_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Jobs table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    role_type role_type NOT NULL DEFAULT 'Full-time',
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    benefits TEXT,
    salary_range VARCHAR(100),
    experience_level VARCHAR(50),
    status job_status NOT NULL DEFAULT 'draft',
    company_id INTEGER,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deadline TIMESTAMP,
    closed_at TIMESTAMP
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_by ON jobs(created_by);

-- Questions table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    type question_type NOT NULL,
    time_limit INTEGER,
    order_index INTEGER NOT NULL,
    required BOOLEAN NOT NULL DEFAULT TRUE,
    choices JSONB,
    code_template TEXT,
    correct_answer TEXT,
    evaluation_criteria JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_job_id ON questions(job_id);

-- Candidates table
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    resume_url TEXT,
    linkedin_url TEXT,
    invite_token VARCHAR(255) UNIQUE NOT NULL,
    status candidate_status NOT NULL DEFAULT 'invited',
    notes TEXT,
    tags VARCHAR(255)[],
    invited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    submitted_at TIMESTAMP,
    last_activity_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidates_job_id ON candidates(job_id);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_invite_token ON candidates(invite_token);

-- Interview Responses table
CREATE TABLE interview_responses (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id),
    type question_type NOT NULL,
    content TEXT NOT NULL,
    duration INTEGER,
    retries INTEGER NOT NULL DEFAULT 0,
    transcript TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    question_score REAL,
    question_feedback JSONB,
    keywords_found VARCHAR(255)[]
);

CREATE INDEX idx_interview_responses_candidate_id ON interview_responses(candidate_id);
CREATE INDEX idx_interview_responses_question_id ON interview_responses(question_id);

-- Candidate Scores table
CREATE TABLE candidate_scores (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER UNIQUE NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    overall_score REAL,
    ai_score REAL,
    human_score REAL,
    communication REAL,
    technical_skills REAL,
    problem_solving REAL,
    culture_fit REAL,
    experience REAL,
    summary TEXT,
    strengths VARCHAR(255)[],
    weaknesses VARCHAR(255)[],
    red_flags VARCHAR(255)[],
    recommendations VARCHAR(255)[],
    confidence_level REAL,
    skills_extracted JSONB,
    competency_ranking JSONB,
    scored_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    scored_by INTEGER
);

CREATE INDEX idx_candidate_scores_candidate_id ON candidate_scores(candidate_id);

-- Invites table
CREATE TABLE invites (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    status invite_status NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP,
    opened_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invites_job_id ON invites(job_id);
CREATE INDEX idx_invites_email ON invites(email);
CREATE INDEX idx_invites_token ON invites(token);
CREATE INDEX idx_invites_status ON invites(status);
