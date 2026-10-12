-- AI Placement Preparation Platform Initial Seed Data
-- 1. Roles
INSERT IGNORE INTO roles (id, name) VALUES (1, 'ROLE_STUDENT');
INSERT IGNORE INTO roles (id, name) VALUES (2, 'ROLE_MENTOR');
INSERT IGNORE INTO roles (id, name) VALUES (3, 'ROLE_ADMIN');

-- 2. Demo Admin (Password: admin123)
INSERT IGNORE INTO users (id, email, full_name, phone_number, password, role, active, created_at)
VALUES (1, 'admin@placement.edu', 'Dr. Suresh V. Sharma (System Admin)', '+91 9876543210', '$2a$10$e7K513lA5a5OqV2m8G7sEe3b5a1b5c3d', 'ROLE_ADMIN', true, NOW());

-- 3. Demo Mentors (Password: mentor123)
INSERT IGNORE INTO users (id, email, full_name, phone_number, password, role, active, created_at)
VALUES (2, 'rajesh.gupta@placement.edu', 'Dr. Rajesh Gupta', '+91 9812345678', '$2a$10$e7K513lA5a5OqV2m8G7sEe3b5a1b5c3d', 'ROLE_MENTOR', true, NOW());
INSERT IGNORE INTO users (id, email, full_name, phone_number, password, role, active, created_at)
VALUES (3, 'sunita.menon@placement.edu', 'Prof. Sunita Menon', '+91 9823456789', '$2a$10$e7K513lA5a5OqV2m8G7sEe3b5a1b5c3d', 'ROLE_MENTOR', true, NOW());

-- 4. Demo Students (Password: student123)
INSERT IGNORE INTO users (id, email, full_name, phone_number, password, role, active, created_at)
VALUES (4, 'rahul.sharma@student.edu', 'Rahul Sharma', '+91 9988776655', '$2a$10$e7K513lA5a5OqV2m8G7sEe3b5a1b5c3d', 'ROLE_STUDENT', true, NOW());
INSERT IGNORE INTO users (id, email, full_name, phone_number, password, role, active, created_at)
VALUES (5, 'ananya.verma@student.edu', 'Ananya Verma', '+91 9977665544', '$2a$10$e7K513lA5a5OqV2m8G7sEe3b5a1b5c3d', 'ROLE_STUDENT', true, NOW());

-- 5. Student Profiles
INSERT IGNORE INTO student_profiles (id, user_id, college, degree, branch, graduation_year, profile_completion, skills)
VALUES (1, 4, 'National Institute of Technology', 'B.Tech', 'Computer Science & Engineering', 2026, 92, 'Java, Spring Boot, Data Structures, SQL, React');

-- 6. Aptitude Questions
INSERT IGNORE INTO aptitude_questions (id, category, topic, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
VALUES (1, 'Quantitative', 'Time and Work', 'A can complete a piece of work in 12 days and B in 16 days. If they work together for 4 days, what fraction of the work is left?', '1/3', '5/12', '7/12', '1/4', 1, '1 - 4*(1/12 + 1/16) = 5/12', 'Medium');

-- 7. Coding Problems
INSERT IGNORE INTO coding_problems (id, title, description, input_format, output_format, constraints, sample_input, sample_output, difficulty, topic, category)
VALUES (1, 'Two Sum Problem', 'Given an array of integers nums and an integer target, return indices of two numbers that add up to target.', 'Space-separated array and target', 'Space-separated pair of indices', '2 <= N <= 10^4', '2 7 11 15\n9', '0 1', 'Easy', 'Arrays', 'Data Structures');
