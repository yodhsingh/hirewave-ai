-- HireWave.AI Seed Data (DML)
-- Sample data for development and testing

-- Insert Users (HR and Candidates)
-- Password for all users: password123 (hash is fixed for consistent re-seeding)
INSERT INTO users (email, name, password_hash, role) VALUES
('22f1000535@ds.study.iitm.ac.in', 'Parmeet Singh', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'HR'),
('23f3003216@ds.study.iitm.ac.in', 'Team Member', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'HR'),
('hr@company.com', 'Sarah Johnson', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'HR'),
('recruiter@company.com', 'Mike Chen', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'HR'),
('candidate1@email.com', 'John Doe', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'CANDIDATE'),
('candidate2@email.com', 'Jane Smith', '$2b$12$Pun0fziM3YbVMuJfWV65lOujoiIzH20BVQBJTykzdJlAwzjlQdGqm', 'CANDIDATE');

-- Insert Jobs
INSERT INTO jobs (title, department, location, role_type, description, requirements, status, created_by) VALUES
('Senior Software Engineer', 'Engineering', 'San Francisco, CA / Remote', 'FULL_TIME',
 'We are looking for a Senior Software Engineer to join our growing team...',
 'BS in Computer Science or equivalent, 5+ years experience in software development',
 'active', 1),

('Product Manager', 'Product', 'Remote', 'FULL_TIME',
 'Seeking an experienced Product Manager to lead our product initiatives...',
 'MBA or equivalent, 3+ years in product management',
 'active', 1),

('Data Scientist', 'Analytics', 'Seattle, WA / Remote', 'FULL_TIME',
 'Join our data science team to build ML models and analyze data...',
 'MS in Statistics/CS, Python, SQL, ML experience',
 'active', 3),

('DevOps Engineer', 'Infrastructure', 'Austin, TX / Remote', 'FULL_TIME',
 'Looking for a DevOps Engineer to manage our cloud infrastructure...',
 'AWS/GCP experience, Docker, Kubernetes, CI/CD',
 'active', 3),

('Marketing Manager', 'Marketing', 'Remote', 'FULL_TIME',
 'Drive our marketing strategy and brand awareness...',
 'Bachelor degree, 5+ years marketing experience',
 'active', 4),

('UX Designer', 'Design', 'New York, NY / Remote', 'FULL_TIME',
 'Create amazing user experiences for our products...',
 'Portfolio required, Figma/Sketch expertise',
 'active', 4);

-- Insert Questions for each job
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

-- Insert Candidates
INSERT INTO candidates (job_id, email, name, invite_token, status, invited_at, submitted_at) VALUES
-- Job 1 candidates
(1, 'alex.chen@email.com', 'Alex Chen', 'token_001', 'scored', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),
(1, 'maria.garcia@email.com', 'Maria Garcia', 'token_002', 'scored', NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days'),
(1, 'david.kim@email.com', 'David Kim', 'token_003', 'submitted', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),
(1, 'sarah.johnson@email.com', 'Sarah Johnson', 'token_004', 'in_progress', NOW() - INTERVAL '3 days', NULL),
(1, 'james.wilson@email.com', 'James Wilson', 'token_005', 'invited', NOW() - INTERVAL '2 days', NULL),

-- Job 2 candidates
(2, 'emily.brown@email.com', 'Emily Brown', 'token_006', 'scored', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),
(2, 'robert.taylor@email.com', 'Robert Taylor', 'token_007', 'shortlisted', NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days'),
(2, 'lisa.anderson@email.com', 'Lisa Anderson', 'token_008', 'submitted', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),

-- Job 3 candidates
(3, 'michael.lee@email.com', 'Michael Lee', 'token_009', 'scored', NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days'),
(3, 'jennifer.martinez@email.com', 'Jennifer Martinez', 'token_010', 'shortlisted', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),
(3, 'william.davis@email.com', 'William Davis', 'token_011', 'submitted', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),
(3, 'amanda.rodriguez@email.com', 'Amanda Rodriguez', 'token_012', 'started', NOW() - INTERVAL '3 days', NULL);

-- Insert Interview Responses for scored/submitted candidates
-- Alex Chen (candidate 1)
INSERT INTO interview_responses (candidate_id, question_id, type, content, duration, submitted_at) VALUES
(1, 1, 'video', 'I have 6 years of experience working with microservices...', 165, NOW() - INTERVAL '3 days'),
(1, 2, 'text', 'The most challenging bug was a race condition in our payment system...', 280, NOW() - INTERVAL '3 days'),
(1, 3, 'code', 'def longest_palindrome(s): n = len(s); if n < 2: return s...', 1200, NOW() - INTERVAL '3 days');

-- Alex Chen phone interview (question 4)
INSERT INTO interview_responses (candidate_id, question_id, type, content, transcript, duration, submitted_at) VALUES
(1, 4, 'phone', 'https://mock-storage.example.com/audio/alex-chen-phone.mp3',
'[{"speaker": "AI", "time": "00:00", "text": "Hello Alex, thank you for taking the time to speak with me today. I''m the AI interviewer for HireWave. How are you doing?"}, {"speaker": "Candidate", "time": "00:05", "text": "I''m doing great, thank you! I''m excited to discuss this opportunity."}, {"speaker": "AI", "time": "00:10", "text": "Wonderful! Let''s start by discussing your background. Can you tell me about your experience with distributed systems?"}, {"speaker": "Candidate", "time": "00:18", "text": "Absolutely. I have been working with distributed systems for over 6 years now. In my current role at TechCorp, I architected and implemented a microservices-based platform that handles over 10 million transactions per day. We use Kubernetes for orchestration and have services written in Go and Python."}, {"speaker": "AI", "time": "00:45", "text": "That''s impressive! What were some of the key challenges you faced when scaling this system?"}, {"speaker": "Candidate", "time": "00:52", "text": "The biggest challenge was maintaining data consistency across services. We implemented the Saga pattern for distributed transactions and used event sourcing with Kafka to ensure eventual consistency. We also had to deal with network partitions and implemented circuit breakers using Hystrix to prevent cascading failures."}, {"speaker": "AI", "time": "01:20", "text": "Excellent approach. How do you handle monitoring and observability in such a complex system?"}, {"speaker": "Candidate", "time": "01:28", "text": "We use a combination of Prometheus for metrics, Grafana for visualization, and the ELK stack for centralized logging. We also implemented distributed tracing with Jaeger, which has been invaluable for debugging issues across multiple services. We set up alerts based on SLOs and have a comprehensive dashboard that shows the health of each service."}, {"speaker": "AI", "time": "02:00", "text": "Great! Now, can you describe a particularly challenging bug you''ve encountered in a distributed system?"}, {"speaker": "Candidate", "time": "02:08", "text": "One of the toughest bugs was a race condition in our payment processing service. Occasionally, duplicate charges would occur when users rapidly clicked the submit button. The issue was subtle because it only happened under high load. After extensive analysis with distributed tracing, we found that our idempotency key implementation had a timing window. We fixed it by using Redis distributed locks with proper TTL management."}, {"speaker": "AI", "time": "02:45", "text": "Excellent problem-solving! How do you approach code reviews and maintaining code quality in a team environment?"}, {"speaker": "Candidate", "time": "02:53", "text": "I believe code reviews are crucial for knowledge sharing and maintaining standards. I always provide constructive feedback, focusing on logic, readability, and potential edge cases. We use automated tools like SonarQube for static analysis and require at least 80% test coverage. I also advocate for pair programming for complex features."}, {"speaker": "AI", "time": "03:25", "text": "That''s a comprehensive approach. What interests you most about this Senior Software Engineer position?"}, {"speaker": "Candidate", "time": "03:33", "text": "I''m particularly excited about the opportunity to work on scaling challenges and contribute to architectural decisions. From what I understand, the company is growing rapidly, and I love being part of building systems that can handle that growth efficiently. The tech stack also aligns perfectly with my expertise."}, {"speaker": "AI", "time": "04:05", "text": "Thank you, Alex. Do you have any questions for me about the role or the company?"}, {"speaker": "Candidate", "time": "04:11", "text": "Yes, I''d like to know more about the team structure and how engineering teams collaborate across different products."}, {"speaker": "AI", "time": "04:19", "text": "Great question. We have cross-functional teams organized around product areas, with regular sync meetings and shared sprint planning. Engineers often collaborate across teams through architectural review boards and knowledge-sharing sessions."}, {"speaker": "Candidate", "time": "04:38", "text": "That sounds like a great collaborative environment. Thank you!"}, {"speaker": "AI", "time": "04:42", "text": "Thank you for your time today, Alex. We''ll be in touch soon regarding next steps. Have a great day!"}, {"speaker": "Candidate", "time": "04:48", "text": "Thank you! Looking forward to hearing from you."}]',
932, NOW() - INTERVAL '3 days');

-- Maria Garcia (candidate 2)
INSERT INTO interview_responses (candidate_id, question_id, type, content, duration, submitted_at) VALUES
(2, 1, 'video', 'My experience includes designing and implementing distributed systems at scale...', 178, NOW() - INTERVAL '4 days'),
(2, 2, 'text', 'I once debugged a memory leak that took 3 days to trace...', 295, NOW() - INTERVAL '4 days'),
(2, 3, 'code', 'class Solution: def longestPalindrome(self, s): ...', 1500, NOW() - INTERVAL '4 days');

-- Maria Garcia phone interview (question 4)
INSERT INTO interview_responses (candidate_id, question_id, type, content, transcript, duration, submitted_at) VALUES
(2, 4, 'phone', 'https://mock-storage.example.com/audio/maria-garcia-phone.mp3',
'[{"speaker": "AI", "time": "00:00", "text": "Hi Maria, thank you for joining me today. I''m the AI interviewer for HireWave. How are you?"}, {"speaker": "Candidate", "time": "00:06", "text": "Hello! I''m doing very well, thank you. I''m really excited about this opportunity."}, {"speaker": "AI", "time": "00:12", "text": "Great to hear! Let''s dive right in. Can you tell me about your experience with microservices architecture?"}, {"speaker": "Candidate", "time": "00:20", "text": "Certainly! I have over 8 years of experience in software engineering, with the last 5 years focused heavily on microservices. At my current company, DataFlow Inc., I led the migration from a monolithic application to a microservices architecture. We broke down a legacy system into 25+ microservices, which improved our deployment frequency from monthly to multiple times per day."}, {"speaker": "AI", "time": "00:55", "text": "That''s quite an undertaking! What were the key technical decisions you made during this migration?"}, {"speaker": "Candidate", "time": "01:03", "text": "We chose to use Domain-Driven Design principles to identify service boundaries. Each service had its own database to ensure loose coupling. We implemented API Gateway pattern using Kong for routing and authentication. For inter-service communication, we used both synchronous REST APIs and asynchronous messaging with RabbitMQ, depending on the use case. We also established strict API versioning policies to prevent breaking changes."}, {"speaker": "AI", "time": "01:45", "text": "Excellent architecture choices. How did you handle the complexity of testing in such an environment?"}, {"speaker": "Candidate", "time": "01:53", "text": "Testing was definitely a challenge. We implemented a comprehensive testing strategy: unit tests for business logic, integration tests using Testcontainers to spin up dependencies, contract testing with Pact to ensure API compatibility between services, and end-to-end tests for critical user journeys. We also did chaos engineering experiments using tools like Chaos Monkey to test resilience. Our CI/CD pipeline wouldn''t allow deployment unless all tests passed and coverage was above 85%."}, {"speaker": "AI", "time": "02:40", "text": "Very thorough! Can you describe a time when you had to debug a complex issue in production?"}, {"speaker": "Candidate", "time": "02:48", "text": "Yes, we had a particularly tricky memory leak that was causing services to crash intermittently. The issue was that it only manifested after several days of runtime under specific load patterns. I used heap dump analysis with tools like VisualVM and found that we were inadvertently keeping references to processed events in a cache that never expired. The fix involved implementing proper cache eviction policies with size limits and TTL. I also added comprehensive memory monitoring to catch similar issues early."}, {"speaker": "AI", "time": "03:35", "text": "Great detective work! How do you stay current with new technologies and best practices?"}, {"speaker": "Candidate", "time": "03:43", "text": "I''m very passionate about continuous learning. I regularly read engineering blogs from companies like Netflix and Uber, attend conferences like KubeCon, and I''m active in several online communities. I also dedicate time each week to hands-on experimentation with new technologies. Recently, I''ve been exploring service mesh architectures with Istio and experimenting with Rust for performance-critical services."}, {"speaker": "AI", "time": "04:20", "text": "That''s impressive dedication. What attracts you to this position specifically?"}, {"speaker": "Candidate", "time": "04:28", "text": "I''m drawn to the technical challenges you''re facing with scaling. I''ve heard great things about your engineering culture and the emphasis on innovation. I''m particularly excited about the opportunity to mentor other engineers and contribute to architectural decisions. The problem domain is also fascinating to me, and I believe my experience with high-scale distributed systems would be directly applicable."}, {"speaker": "AI", "time": "05:05", "text": "Thank you, Maria. Is there anything you''d like to know about the role or our team?"}, {"speaker": "Candidate", "time": "05:12", "text": "Yes, I''d love to hear more about the on-call rotation and how the team handles incidents."}, {"speaker": "AI", "time": "05:19", "text": "We have a follow-the-sun on-call rotation shared across the global team. We use PagerDuty for alerting and have well-documented runbooks. We also conduct blameless post-mortems after incidents to continuously improve our systems and processes."}, {"speaker": "Candidate", "time": "05:41", "text": "That sounds like a very mature approach. I appreciate the focus on learning from incidents."}, {"speaker": "AI", "time": "05:48", "text": "Thank you for your time today, Maria. Your experience is impressive, and we''ll follow up soon with next steps."}, {"speaker": "Candidate", "time": "05:56", "text": "Thank you so much! I look forward to hearing from you."}]',
1056, NOW() - INTERVAL '4 days');

-- Insert Candidate Scores
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

-- Note: Password for all users is 'password123' (hashed with bcrypt)
