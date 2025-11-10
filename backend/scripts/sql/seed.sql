-- HireWave.AI Seed Data (DML)
-- Sample data for development and testing
-- All seed data consolidated in one file

-- ============================================================================
-- USERS
-- ============================================================================
-- Password for all users: password123 (hash is fixed for consistent re-seeding)
INSERT INTO users (email, name, password_hash, role) VALUES
-- IIT Madras Team Members (HR)
('22f1000535@ds.study.iitm.ac.in', 'Parmeet Singh', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'HR'),
('23f3003216@ds.study.iitm.ac.in', 'Hiya Syal', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'HR'),
('22f3001166@ds.study.iitm.ac.in', 'Dalyodh Singh', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'HR'),
('22f1001934@ds.study.iitm.ac.in', 'Shubham Tiwari', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'HR'),
('23f2004636@ds.study.iitm.ac.in', 'Akshit Mittal', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'HR'),
('21f2001128@ds.study.iitm.ac.in', 'Ravina', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'HR'),
('22f3001480@ds.study.iitm.ac.in', 'Sidhaarth Shree', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'HR'),
('22f2000946@ds.study.iitm.ac.in', 'Akash Kumar', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'HR'),

-- Example HR Users
('hr@company.com', 'Sarah Johnson', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'HR'),
('recruiter@company.com', 'Mike Chen', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'HR'),

-- IIT Madras Team Members (also as Candidates for testing)
('candidate-22f1000535@ds.study.iitm.ac.in', 'Parmeet Singh (Candidate)', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'CANDIDATE'),
('candidate-23f3003216@ds.study.iitm.ac.in', 'Hiya Syal (Candidate)', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'CANDIDATE'),
('candidate-22f3001166@ds.study.iitm.ac.in', 'Dalyodh Singh (Candidate)', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'CANDIDATE'),
('candidate-22f1001934@ds.study.iitm.ac.in', 'Shubham Tiwari (Candidate)', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'CANDIDATE'),
('candidate-23f2004636@ds.study.iitm.ac.in', 'Akshit Mittal (Candidate)', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'CANDIDATE'),
('candidate-21f2001128@ds.study.iitm.ac.in', 'Ravina (Candidate)', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'CANDIDATE'),
('candidate-22f3001480@ds.study.iitm.ac.in', 'Sidhaarth Shree (Candidate)', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'CANDIDATE'),
('candidate-22f2000946@ds.study.iitm.ac.in', 'Akash Kumar (Candidate)', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'CANDIDATE'),

-- Example Candidate Users
('candidate1@email.com', 'John Doe', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'CANDIDATE'),
('candidate2@email.com', 'Jane Smith', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'CANDIDATE');

-- ============================================================================
-- JOBS
-- ============================================================================
INSERT INTO jobs (title, department, location, role_type, description, requirements, status, created_by) VALUES
('Senior Software Engineer', 'Engineering', 'Bangalore / Remote', 'FULL_TIME',
 'We are looking for a Senior Software Engineer to join our growing team...',
 'BS in Computer Science or equivalent, 5+ years experience in software development',
 'active', 1),

('Product Manager', 'Product', 'Mumbai / Remote', 'FULL_TIME',
 'Seeking an experienced Product Manager to lead our product initiatives...',
 'MBA or equivalent, 3+ years in product management',
 'active', 1),

('Data Scientist', 'Analytics', 'Hyderabad / Remote', 'FULL_TIME',
 'Join our data science team to build ML models and analyze data...',
 'MS in Statistics/CS, Python, SQL, ML experience',
 'active', 3),

('DevOps Engineer', 'Infrastructure', 'Pune / Remote', 'FULL_TIME',
 'Looking for a DevOps Engineer to manage our cloud infrastructure...',
 'AWS/GCP experience, Docker, Kubernetes, CI/CD',
 'active', 3),

('Marketing Manager', 'Marketing', 'Delhi / Remote', 'FULL_TIME',
 'Drive our marketing strategy and brand awareness...',
 'Bachelor degree, 5+ years marketing experience',
 'active', 4),

('UX Designer', 'Design', 'Chennai / Remote', 'FULL_TIME',
 'Create amazing user experiences for our products...',
 'Portfolio required, Figma/Sketch expertise',
 'active', 4);

-- ============================================================================
-- QUESTIONS
-- ============================================================================
-- Job 1: Senior Software Engineer
INSERT INTO questions (job_id, question_text, type, time_limit, order_index, required) VALUES
(1, 'Tell us about your experience with distributed systems and microservices architecture.', 'video', 180, 1, true),
(1, 'Describe a challenging bug you''ve debugged and how you approached it.', 'text', 300, 2, true),
(1, 'Write a function to find the longest palindromic substring in a given string.', 'code', 1800, 3, true),
(1, 'AI Phone Interview: Let''s discuss your background and experience in software engineering.', 'phone', 900, 4, true);

-- Job 2: Product Manager
INSERT INTO questions (job_id, question_text, type, time_limit, order_index, required) VALUES
(2, 'How do you prioritize features when building a product roadmap?', 'video', 180, 1, true),
(2, 'Describe a time when you had to make a difficult product decision with limited data.', 'text', 300, 2, true),
(2, 'Walk us through how you would launch a new feature.', 'video', 240, 3, true);

-- Job 3: Data Scientist
INSERT INTO questions (job_id, question_text, type, time_limit, order_index, required) VALUES
(3, 'Explain the difference between supervised and unsupervised learning with examples.', 'video', 180, 1, true),
(3, 'How do you handle imbalanced datasets in classification problems?', 'text', 300, 2, true),
(3, 'Implement a simple linear regression from scratch in Python.', 'code', 1800, 3, true);

-- Job 4: DevOps Engineer
INSERT INTO questions (job_id, question_text, type, time_limit, order_index, required) VALUES
(4, 'Describe your experience with container orchestration and Kubernetes.', 'video', 180, 1, true),
(4, 'How do you ensure high availability and disaster recovery for critical systems?', 'text', 300, 2, true),
(4, 'Write a shell script to monitor disk usage and send alerts.', 'code', 1200, 3, true);

-- Job 5: Marketing Manager
INSERT INTO questions (job_id, question_text, type, time_limit, order_index, required) VALUES
(5, 'Tell us about a successful marketing campaign you''ve led.', 'video', 180, 1, true),
(5, 'How do you measure marketing ROI and what metrics do you track?', 'text', 300, 2, true),
(5, 'Describe your approach to building brand awareness in a competitive market.', 'video', 240, 3, true);

-- Job 6: UX Designer
INSERT INTO questions (job_id, question_text, type, time_limit, order_index, required) VALUES
(6, 'Walk us through your design process from research to final product.', 'video', 180, 1, true),
(6, 'How do you balance user needs with business requirements?', 'text', 300, 2, true),
(6, 'Describe a time when user testing changed your design direction.', 'video', 240, 3, true);

-- ============================================================================
-- CANDIDATES (HR Workflow - Indian names)
-- ============================================================================
INSERT INTO candidates (job_id, email, name, invite_token, status, invited_at, submitted_at) VALUES
-- Job 1 candidates (Senior Software Engineer - Bangalore)
(1, 'raj.kumar@email.com', 'Raj Kumar', 'token_001', 'scored', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),
(1, 'priya.sharma@email.com', 'Priya Sharma', 'token_002', 'scored', NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days'),
(1, 'arjun.patel@email.com', 'Arjun Patel', 'token_003', 'submitted', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),
(1, 'ananya.reddy@email.com', 'Ananya Reddy', 'token_004', 'in_progress', NOW() - INTERVAL '3 days', NULL),
(1, 'vikram.singh@email.com', 'Vikram Singh', 'token_005', 'invited', NOW() - INTERVAL '2 days', NULL),

-- Job 2 candidates (Product Manager - Mumbai)
(2, 'sneha.gupta@email.com', 'Sneha Gupta', 'token_006', 'scored', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),
(2, 'rahul.mehta@email.com', 'Rahul Mehta', 'token_007', 'shortlisted', NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days'),
(2, 'kavya.iyer@email.com', 'Kavya Iyer', 'token_008', 'submitted', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),

-- Job 3 candidates (Data Scientist - Hyderabad)
(3, 'aditya.verma@email.com', 'Aditya Verma', 'token_009', 'scored', NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days'),
(3, 'meera.krishnan@email.com', 'Meera Krishnan', 'token_010', 'shortlisted', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),
(3, 'karthik.nair@email.com', 'Karthik Nair', 'token_011', 'submitted', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),
(3, 'divya.desai@email.com', 'Divya Desai', 'token_012', 'started', NOW() - INTERVAL '3 days', NULL);

-- ============================================================================
-- INVITES
-- ============================================================================
INSERT INTO invites (job_id, email, token, status, sent_at, opened_at, expires_at, created_at) VALUES
-- Job 1 candidates
(1, 'raj.kumar@email.com', 'token_001', 'completed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() + INTERVAL '2 days', NOW() - INTERVAL '5 days'),
(1, 'priya.sharma@email.com', 'token_002', 'completed', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW() + INTERVAL '1 day', NOW() - INTERVAL '6 days'),
(1, 'arjun.patel@email.com', 'token_003', 'completed', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW() + INTERVAL '3 days', NOW() - INTERVAL '4 days'),
(1, 'ananya.reddy@email.com', 'token_004', 'started', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days', NOW() - INTERVAL '3 days'),
(1, 'vikram.singh@email.com', 'token_005', 'sent', NOW() - INTERVAL '2 days', NULL, NOW() + INTERVAL '5 days', NOW() - INTERVAL '2 days'),

-- Job 2 candidates
(2, 'sneha.gupta@email.com', 'token_006', 'completed', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW(), NOW() - INTERVAL '7 days'),
(2, 'rahul.mehta@email.com', 'token_007', 'completed', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '8 days'),
(2, 'kavya.iyer@email.com', 'token_008', 'completed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() + INTERVAL '2 days', NOW() - INTERVAL '5 days'),

-- Job 3 candidates
(3, 'aditya.verma@email.com', 'token_009', 'completed', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW() + INTERVAL '1 day', NOW() - INTERVAL '6 days'),
(3, 'meera.krishnan@email.com', 'token_010', 'completed', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW(), NOW() - INTERVAL '7 days'),
(3, 'karthik.nair@email.com', 'token_011', 'completed', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW() + INTERVAL '3 days', NOW() - INTERVAL '4 days'),
(3, 'divya.desai@email.com', 'token_012', 'opened', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days', NOW() - INTERVAL '3 days');

-- ============================================================================
-- INTERVIEW RESPONSES
-- ============================================================================
-- Raj Kumar (candidate 1)
INSERT INTO interview_responses (candidate_id, question_id, type, content, duration, submitted_at) VALUES
(1, 1, 'video', 'I have 6 years of experience working with microservices...', 165, NOW() - INTERVAL '3 days'),
(1, 2, 'text', 'The most challenging bug was a race condition in our payment system...', 280, NOW() - INTERVAL '3 days'),
(1, 3, 'code', 'def longest_palindrome(s): n = len(s); if n < 2: return s...', 1200, NOW() - INTERVAL '3 days');

-- Raj Kumar phone interview (question 4)
INSERT INTO interview_responses (candidate_id, question_id, type, content, transcript, duration, submitted_at) VALUES
(1, 4, 'phone', 'https://mock-storage.example.com/audio/raj-kumar-phone.mp3',
'[{"speaker": "AI", "time": "00:00", "text": "Hello Raj, thank you for taking the time to speak with me today. I''m the AI interviewer for HireWave. How are you doing?"}, {"speaker": "Candidate", "time": "00:05", "text": "I''m doing great, thank you! I''m excited to discuss this opportunity."}, {"speaker": "AI", "time": "00:10", "text": "Wonderful! Let''s start by discussing your background. Can you tell me about your experience with distributed systems?"}, {"speaker": "Candidate", "time": "00:18", "text": "Absolutely. I have been working with distributed systems for over 6 years now. In my current role at TechCorp, I architected and implemented a microservices-based platform that handles over 10 million transactions per day. We use Kubernetes for orchestration and have services written in Go and Python."}, {"speaker": "AI", "time": "00:45", "text": "That''s impressive! What were some of the key challenges you faced when scaling this system?"}, {"speaker": "Candidate", "time": "00:52", "text": "The biggest challenge was maintaining data consistency across services. We implemented the Saga pattern for distributed transactions and used event sourcing with Kafka to ensure eventual consistency. We also had to deal with network partitions and implemented circuit breakers using Hystrix to prevent cascading failures."}, {"speaker": "AI", "time": "01:20", "text": "Excellent approach. How do you handle monitoring and observability in such a complex system?"}, {"speaker": "Candidate", "time": "01:28", "text": "We use a combination of Prometheus for metrics, Grafana for visualization, and the ELK stack for centralized logging. We also implemented distributed tracing with Jaeger, which has been invaluable for debugging issues across multiple services. We set up alerts based on SLOs and have a comprehensive dashboard that shows the health of each service."}, {"speaker": "AI", "time": "02:00", "text": "Great! Now, can you describe a particularly challenging bug you''ve encountered in a distributed system?"}, {"speaker": "Candidate", "time": "02:08", "text": "One of the toughest bugs was a race condition in our payment processing service. Occasionally, duplicate charges would occur when users rapidly clicked the submit button. The issue was subtle because it only happened under high load. After extensive analysis with distributed tracing, we found that our idempotency key implementation had a timing window. We fixed it by using Redis distributed locks with proper TTL management."}, {"speaker": "AI", "time": "02:45", "text": "Excellent problem-solving! How do you approach code reviews and maintaining code quality in a team environment?"}, {"speaker": "Candidate", "time": "02:53", "text": "I believe code reviews are crucial for knowledge sharing and maintaining standards. I always provide constructive feedback, focusing on logic, readability, and potential edge cases. We use automated tools like SonarQube for static analysis and require at least 80% test coverage. I also advocate for pair programming for complex features."}, {"speaker": "AI", "time": "03:25", "text": "That''s a comprehensive approach. What interests you most about this Senior Software Engineer position?"}, {"speaker": "Candidate", "time": "03:33", "text": "I''m particularly excited about the opportunity to work on scaling challenges and contribute to architectural decisions. From what I understand, the company is growing rapidly, and I love being part of building systems that can handle that growth efficiently. The tech stack also aligns perfectly with my expertise."}, {"speaker": "AI", "time": "04:05", "text": "Thank you, Alex. Do you have any questions for me about the role or the company?"}, {"speaker": "Candidate", "time": "04:11", "text": "Yes, I''d like to know more about the team structure and how engineering teams collaborate across different products."}, {"speaker": "AI", "time": "04:19", "text": "Great question. We have cross-functional teams organized around product areas, with regular sync meetings and shared sprint planning. Engineers often collaborate across teams through architectural review boards and knowledge-sharing sessions."}, {"speaker": "Candidate", "time": "04:38", "text": "That sounds like a great collaborative environment. Thank you!"}, {"speaker": "AI", "time": "04:42", "text": "Thank you for your time today, Alex. We''ll be in touch soon regarding next steps. Have a great day!"}, {"speaker": "Candidate", "time": "04:48", "text": "Thank you! Looking forward to hearing from you."}]',
932, NOW() - INTERVAL '3 days');

-- Priya Sharma (candidate 2)
INSERT INTO interview_responses (candidate_id, question_id, type, content, duration, submitted_at) VALUES
(2, 1, 'video', 'My experience includes designing and implementing distributed systems at scale...', 178, NOW() - INTERVAL '4 days'),
(2, 2, 'text', 'I once debugged a memory leak that took 3 days to trace...', 295, NOW() - INTERVAL '4 days'),
(2, 3, 'code', 'class Solution: def longestPalindrome(self, s): ...', 1500, NOW() - INTERVAL '4 days');

-- Priya Sharma phone interview (question 4)
INSERT INTO interview_responses (candidate_id, question_id, type, content, transcript, duration, submitted_at) VALUES
(2, 4, 'phone', 'https://mock-storage.example.com/audio/priya-sharma-phone.mp3',
'[{"speaker": "AI", "time": "00:00", "text": "Hi Priya, thank you for joining me today. I''m the AI interviewer for HireWave. How are you?"}, {"speaker": "Candidate", "time": "00:06", "text": "Hello! I''m doing very well, thank you. I''m really excited about this opportunity."}, {"speaker": "AI", "time": "00:12", "text": "Great to hear! Let''s dive right in. Can you tell me about your experience with microservices architecture?"}, {"speaker": "Candidate", "time": "00:20", "text": "Certainly! I have over 8 years of experience in software engineering, with the last 5 years focused heavily on microservices. At my current company, DataFlow Inc., I led the migration from a monolithic application to a microservices architecture. We broke down a legacy system into 25+ microservices, which improved our deployment frequency from monthly to multiple times per day."}, {"speaker": "AI", "time": "00:55", "text": "That''s quite an undertaking! What were the key technical decisions you made during this migration?"}, {"speaker": "Candidate", "time": "01:03", "text": "We chose to use Domain-Driven Design principles to identify service boundaries. Each service had its own database to ensure loose coupling. We implemented API Gateway pattern using Kong for routing and authentication. For inter-service communication, we used both synchronous REST APIs and asynchronous messaging with RabbitMQ, depending on the use case. We also established strict API versioning policies to prevent breaking changes."}, {"speaker": "AI", "time": "01:45", "text": "Excellent architecture choices. How did you handle the complexity of testing in such an environment?"}, {"speaker": "Candidate", "time": "01:53", "text": "Testing was definitely a challenge. We implemented a comprehensive testing strategy: unit tests for business logic, integration tests using Testcontainers to spin up dependencies, contract testing with Pact to ensure API compatibility between services, and end-to-end tests for critical user journeys. We also did chaos engineering experiments using tools like Chaos Monkey to test resilience. Our CI/CD pipeline wouldn''t allow deployment unless all tests passed and coverage was above 85%."}, {"speaker": "AI", "time": "02:40", "text": "Very thorough! Can you describe a time when you had to debug a complex issue in production?"}, {"speaker": "Candidate", "time": "02:48", "text": "Yes, we had a particularly tricky memory leak that was causing services to crash intermittently. The issue was that it only manifested after several days of runtime under specific load patterns. I used heap dump analysis with tools like VisualVM and found that we were inadvertently keeping references to processed events in a cache that never expired. The fix involved implementing proper cache eviction policies with size limits and TTL. I also added comprehensive memory monitoring to catch similar issues early."}, {"speaker": "AI", "time": "03:35", "text": "Great detective work! How do you stay current with new technologies and best practices?"}, {"speaker": "Candidate", "time": "03:43", "text": "I''m very passionate about continuous learning. I regularly read engineering blogs from companies like Netflix and Uber, attend conferences like KubeCon, and I''m active in several online communities. I also dedicate time each week to hands-on experimentation with new technologies. Recently, I''ve been exploring service mesh architectures with Istio and experimenting with Rust for performance-critical services."}, {"speaker": "AI", "time": "04:20", "text": "That''s impressive dedication. What attracts you to this position specifically?"}, {"speaker": "Candidate", "time": "04:28", "text": "I''m drawn to the technical challenges you''re facing with scaling. I''ve heard great things about your engineering culture and the emphasis on innovation. I''m particularly excited about the opportunity to mentor other engineers and contribute to architectural decisions. The problem domain is also fascinating to me, and I believe my experience with high-scale distributed systems would be directly applicable."}, {"speaker": "AI", "time": "05:05", "text": "Thank you, Maria. Is there anything you''d like to know about the role or our team?"}, {"speaker": "Candidate", "time": "05:12", "text": "Yes, I''d love to hear more about the on-call rotation and how the team handles incidents."}, {"speaker": "AI", "time": "05:19", "text": "We have a follow-the-sun on-call rotation shared across the global team. We use PagerDuty for alerting and have well-documented runbooks. We also conduct blameless post-mortems after incidents to continuously improve our systems and processes."}, {"speaker": "Candidate", "time": "05:41", "text": "That sounds like a very mature approach. I appreciate the focus on learning from incidents."}, {"speaker": "AI", "time": "05:48", "text": "Thank you for your time today, Maria. Your experience is impressive, and we''ll follow up soon with next steps."}, {"speaker": "Candidate", "time": "05:56", "text": "Thank you so much! I look forward to hearing from you."}]',
1056, NOW() - INTERVAL '4 days');

-- ============================================================================
-- CANDIDATE SCORES
-- ============================================================================
INSERT INTO candidate_scores (
    candidate_id, overall_score, ai_score, communication, technical_skills, problem_solving,
    culture_fit, experience, summary, strengths, weaknesses, red_flags, recommendations,
    confidence_level, competency_ranking, scored_at
) VALUES
(1, 87.5, 88.0, 85.0, 90.0, 87.0, 88.0, 92.0,
 'Strong technical background with excellent problem-solving skills. Communication is clear and concise.',
 ARRAY['Strong distributed systems knowledge', 'Good coding practices', 'Clear communication'],
 ARRAY['Could provide more specific examples', 'Code optimization could be improved'],
 ARRAY[]::text[],
 ARRAY['Consider for senior technical role', 'Strong fit for distributed systems projects'],
 88.5,
 '{"percentile": 93, "rank": 3, "totalCandidates": 47, "topCompetencies": ["Technical Skills", "Problem Solving", "Experience"], "comparisonText": "Ranks in the top 7% of all candidates for this position"}'::jsonb,
 NOW() - INTERVAL '2 days'),

(2, 92.0, 91.5, 95.0, 90.0, 89.0, 90.0, 87.0,
 'Exceptional candidate with deep technical expertise and outstanding communication skills.',
 ARRAY['Excellent system design skills', 'Very articulate', 'Strong debugging methodology'],
 ARRAY['Slightly verbose in responses'],
 ARRAY[]::text[],
 ARRAY['Excellent fit for team lead position', 'Outstanding communication makes them ideal for client-facing roles'],
 92.0,
 '{"percentile": 95, "rank": 2, "totalCandidates": 47, "topCompetencies": ["Communication", "Culture Fit", "Technical Skills"], "comparisonText": "Ranks in the top 5% of all candidates for this position"}'::jsonb,
 NOW() - INTERVAL '3 days'),

(6, 85.0, 84.5, 88.0, 82.0, 85.0, 83.0, 86.0,
 'Good product thinking with solid understanding of prioritization frameworks.',
 ARRAY['Data-driven approach', 'Customer-focused', 'Strategic thinking'],
 ARRAY['Limited technical depth', 'Could elaborate on metrics'],
 ARRAY[]::text[],
 ARRAY['Strong candidate for product management role', 'Would benefit from technical training'],
 84.0,
 '{"percentile": 78, "rank": 12, "totalCandidates": 47, "topCompetencies": ["Communication", "Problem Solving", "Experience"], "comparisonText": "Ranks in the top 22% of all candidates for this position"}'::jsonb,
 NOW() - INTERVAL '4 days'),

(9, 89.0, 89.5, 87.0, 92.0, 90.0, 88.0, 91.0,
 'Strong ML background with practical experience in model deployment.',
 ARRAY['Deep ML knowledge', 'Hands-on experience', 'Research-oriented'],
 ARRAY['Communication could be more concise'],
 ARRAY[]::text[],
 ARRAY['Excellent fit for data science team', 'Consider for senior or lead role'],
 90.0,
 '{"percentile": 91, "rank": 5, "totalCandidates": 47, "topCompetencies": ["Technical Skills", "Problem Solving", "Experience"], "comparisonText": "Ranks in the top 9% of all candidates for this position"}'::jsonb,
 NOW() - INTERVAL '3 days');

-- ============================================================================
-- CANDIDATE DASHBOARD DATA (for test user: 22f1000535@ds.study.iitm.ac.in)
-- ============================================================================
-- Insert candidate applications for the test user
INSERT INTO candidates (job_id, email, name, invite_token, status, invited_at, started_at, submitted_at, last_activity_at)
SELECT job_id, email, name, invite_token, status::candidate_status, invited_at, started_at, submitted_at, last_activity_at
FROM (VALUES
  -- Scored applications
  (1, '22f1000535@ds.study.iitm.ac.in', 'Parmeet Singh', 'token_parmeet_001', 'scored', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
  (2, '22f1000535@ds.study.iitm.ac.in', 'Parmeet Singh', 'token_parmeet_002', 'scored', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  (3, '22f1000535@ds.study.iitm.ac.in', 'Parmeet Singh', 'token_parmeet_003', 'scored', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  -- Submitted (pending scoring)
  (4, '22f1000535@ds.study.iitm.ac.in', 'Parmeet Singh', 'token_parmeet_004', 'submitted', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  -- In progress
  (5, '22f1000535@ds.study.iitm.ac.in', 'Parmeet Singh', 'token_parmeet_005', 'in_progress', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours', NULL, NOW() - INTERVAL '2 hours'),

  -- Invited (not started yet)
  (6, '22f1000535@ds.study.iitm.ac.in', 'Parmeet Singh', 'token_parmeet_006', 'invited', NOW() - INTERVAL '1 day', NULL, NULL, NOW() - INTERVAL '1 day')
) AS v(job_id, email, name, invite_token, status, invited_at, started_at, submitted_at, last_activity_at)
WHERE NOT EXISTS (
  SELECT 1 FROM candidates WHERE invite_token = v.invite_token
);

-- Get the candidate IDs and add scores/responses
DO $$
DECLARE
  candidate_id_1 INTEGER;
  candidate_id_2 INTEGER;
  candidate_id_3 INTEGER;
  candidate_id_4 INTEGER;
  candidate_id_5 INTEGER;
BEGIN
  -- Get IDs for test user's candidates
  SELECT id INTO candidate_id_1 FROM candidates WHERE invite_token = 'token_parmeet_001';
  SELECT id INTO candidate_id_2 FROM candidates WHERE invite_token = 'token_parmeet_002';
  SELECT id INTO candidate_id_3 FROM candidates WHERE invite_token = 'token_parmeet_003';
  SELECT id INTO candidate_id_4 FROM candidates WHERE invite_token = 'token_parmeet_004';
  SELECT id INTO candidate_id_5 FROM candidates WHERE invite_token = 'token_parmeet_005';

  -- Add scores for completed interviews
  IF candidate_id_1 IS NOT NULL THEN
    INSERT INTO candidate_scores (
      candidate_id, overall_score, ai_score,
      communication, technical_skills, problem_solving, culture_fit, experience,
      summary, strengths, weaknesses, recommendations, confidence_level, scored_at
    ) VALUES (
      candidate_id_1, 85, 85,
      88, 82, 86, 85, 84,
      'Strong candidate with excellent communication skills and solid technical background.',
      ARRAY['Excellent communication', 'Strong problem-solving', 'Good cultural fit'],
      ARRAY['Could improve on advanced algorithms', 'Limited experience with microservices'],
      'Strongly recommend for next round. Candidate shows great potential.',
      0.92, NOW() - INTERVAL '7 days'
    )
    ON CONFLICT (candidate_id) DO NOTHING;
  END IF;

  IF candidate_id_2 IS NOT NULL THEN
    INSERT INTO candidate_scores (
      candidate_id, overall_score, ai_score,
      communication, technical_skills, problem_solving, culture_fit, experience,
      summary, strengths, weaknesses, recommendations, confidence_level, scored_at
    ) VALUES (
      candidate_id_2, 78, 78,
      75, 80, 78, 76, 82,
      'Good candidate with relevant experience. Shows promise in technical areas.',
      ARRAY['Good technical knowledge', 'Relevant experience', 'Fast learner'],
      ARRAY['Communication could be clearer', 'Nervousness affected performance'],
      'Recommend for technical round. May need communication coaching.',
      0.85, NOW() - INTERVAL '4 days'
    )
    ON CONFLICT (candidate_id) DO NOTHING;
  END IF;

  IF candidate_id_3 IS NOT NULL THEN
    INSERT INTO candidate_scores (
      candidate_id, overall_score, ai_score,
      communication, technical_skills, problem_solving, culture_fit, experience,
      summary, strengths, weaknesses, recommendations, confidence_level, scored_at
    ) VALUES (
      candidate_id_3, 92, 92,
      94, 90, 91, 93, 89,
      'Exceptional candidate with outstanding skills across all areas. Top performer.',
      ARRAY['Outstanding communication', 'Deep technical expertise', 'Excellent problem-solving', 'Great team fit'],
      ARRAY['Slightly overqualified', 'May have high salary expectations'],
      'Highly recommend to fast-track. Excellent hire potential.',
      0.96, NOW() - INTERVAL '2 days'
    )
    ON CONFLICT (candidate_id) DO NOTHING;
  END IF;

  -- Add interview responses for completed and in-progress interviews
  IF candidate_id_1 IS NOT NULL THEN
    INSERT INTO interview_responses (candidate_id, question_id, type, content, submitted_at, question_score)
    SELECT candidate_id_1, id, 'text'::response_type,
      'Sample answer demonstrating strong understanding of the topic with clear examples and good structure.',
      NOW() - INTERVAL '8 days',
      85 + (random() * 10 - 5)::INTEGER
    FROM questions WHERE job_id = 1 LIMIT 3
    ON CONFLICT DO NOTHING;
  END IF;

  IF candidate_id_2 IS NOT NULL THEN
    INSERT INTO interview_responses (candidate_id, question_id, type, content, submitted_at, question_score)
    SELECT candidate_id_2, id, 'text'::response_type,
      'Adequate response showing basic understanding. Could provide more depth and examples.',
      NOW() - INTERVAL '5 days',
      75 + (random() * 10 - 5)::INTEGER
    FROM questions WHERE job_id = 2 LIMIT 3
    ON CONFLICT DO NOTHING;
  END IF;

  IF candidate_id_3 IS NOT NULL THEN
    INSERT INTO interview_responses (candidate_id, question_id, type, content, submitted_at, question_score)
    SELECT candidate_id_3, id, 'text'::response_type,
      'Excellent comprehensive answer with detailed examples, clear reasoning, and innovative insights.',
      NOW() - INTERVAL '3 days',
      90 + (random() * 8 - 4)::INTEGER
    FROM questions WHERE job_id = 3 LIMIT 3
    ON CONFLICT DO NOTHING;
  END IF;

  IF candidate_id_5 IS NOT NULL THEN
    -- In-progress interview (partial responses)
    INSERT INTO interview_responses (candidate_id, question_id, type, content, submitted_at)
    SELECT candidate_id_5, id, 'text'::response_type,
      'Partial answer in progress...',
      NULL
    FROM questions WHERE job_id = 5 LIMIT 1
    ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Uncomment to verify seed data
-- SELECT
--   'Users' as table_name, COUNT(*) as count FROM users
-- UNION ALL
-- SELECT 'Jobs', COUNT(*) FROM jobs
-- UNION ALL
-- SELECT 'Questions', COUNT(*) FROM questions
-- UNION ALL
-- SELECT 'Candidates', COUNT(*) FROM candidates
-- UNION ALL
-- SELECT 'Invites', COUNT(*) FROM invites
-- UNION ALL
-- SELECT 'Interview Responses', COUNT(*) FROM interview_responses
-- UNION ALL
-- SELECT 'Candidate Scores', COUNT(*) FROM candidate_scores;

-- Note: Password for all users is 'password123' (hashed with bcrypt)
