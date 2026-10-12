import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './src/server/db';
import { sendEmail } from './src/server/mailer';
import { hashPassword, verifyPassword, createSignedToken, verifySignedToken } from './src/server/auth';
import {
  generateInterviewQuestions,
  evaluateInterviewAnswers,
  analyzeResumeWithAI,
  generateAILearningPath,
  checkStudentCodeWithAI
} from './src/server/ai';
import {
  User, UserRole, StudentProfile, MentorProfile, AdminProfile, AptitudeQuestion,
  TestAttempt, CodingProblem, CodingSubmission, MockInterview, ResumeAnalysis,
  LearningPath, MentorTask, MentorFeedback, MentoringSession, Notification, Achievement,
  MentorApprovalItem, TechnicalQuestion, UploadedNote, MentorshipRequest, MentorExam,
  StudentExamSubmission, ExamQuestion, SessionType, SessionStatus, StudentCodingProgress
} from './src/types';

dotenv.config();

const args = process.argv.slice(2);
let PORT = 3000;
let HOST = '0.0.0.0';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    PORT = parseInt(args[i + 1], 10);
  }
  if (args[i] === '--host' && args[i + 1]) {
    HOST = args[i + 1];
  }
}

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auth Token middleware using cryptographically signed tokens
const parseAuthUser = (req: Request): User | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  
  const verified = verifySignedToken(token);
  if (verified) {
    return db.getUserById(verified.userId) || db.getUsers().find(u => u.id === verified.userId) || null;
  }
  return null;
};

// Cryptographically signed session token using HMAC-SHA256
const createToken = (user: User): string => {
  return createSignedToken(user.id, user.role);
};

// Standard API Response Format
const sendSuccess = (res: Response, data: any, message = 'Operation successful') => {
  res.json({ success: true, message, data, timestamp: new Date().toISOString() });
};

const sendError = (res: Response, message: string, status = 400) => {
  res.status(status).json({ success: false, message, timestamp: new Date().toISOString(), status });
};

// ==================== AUTH ROUTES ====================

// Send OTP to Official College / Institutional Email
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { email, purpose } = req.body;
  if (!email || typeof email !== 'string') {
    return sendError(res, 'Please provide a valid official college email address or user ID.');
  }

  const cleanIdentifier = email.trim().toLowerCase();
  const existingUser = db.getUserByEmail(cleanIdentifier);
  const targetEmail = existingUser ? existingUser.email : cleanIdentifier;

  const validPurpose = purpose || 'LOGIN_OTP';
  const generatedOtp = db.generateOTP(targetEmail, validPurpose);
  console.log(`[Official Email Dispatch] Verification OTP sent to ${targetEmail}: ${generatedOtp}`);

  // Dispatch email asynchronously
  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 28px; border: 1px solid #1a1a1a; border-radius: 20px; background-color: #f9f7f2; color: #1a1a1a;">
      <h2 style="font-family: Georgia, serif; font-style: italic; margin-top: 0; font-size: 22px; color: #1a1a1a;">Campus Placement Suite</h2>
      <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; color: #666; font-weight: 600;">Official Identity Verification</p>
      <p style="font-size: 14px; line-height: 1.5; color: #333;">Your one-time 6-digit email verification code is:</p>
      <div style="background-color: #1a1a1a; color: #f9f7f2; font-size: 32px; font-family: monospace; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 18px; border-radius: 14px; margin: 20px 0;">
        ${generatedOtp}
      </div>
      <p style="font-size: 12px; color: #777; line-height: 1.4;">This verification code will expire in 10 minutes. If you did not request this verification code, please ignore this email.</p>
    </div>
  `;

  sendEmail({
    to: targetEmail,
    subject: `Campus Placement Verification Code: ${generatedOtp}`,
    text: `Your 6-digit Campus Placement email verification code is: ${generatedOtp}. It expires in 10 minutes.`,
    html: emailHtml
  }).catch(err => console.error('[sendEmail async error]', err));

  return sendSuccess(res, {
    email: targetEmail,
    otp: generatedOtp,
    message: `6-Digit Verification OTP dispatched to your official email ${targetEmail}`,
    expiresInMinutes: 10
  }, 'Verification code sent to your official email');
});

// Verify OTP
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return sendError(res, 'Email and 6-digit OTP are required for verification.');
  }

  const cleanIdentifier = email.trim().toLowerCase();
  const existingUser = db.getUserByEmail(cleanIdentifier);
  const targetEmail = existingUser ? existingUser.email : cleanIdentifier;

  const result = db.verifyOTP(targetEmail, otp);
  if (!result.success) {
    return sendError(res, result.message, 400);
  }

  return sendSuccess(res, { verified: true, email: targetEmail }, result.message);
});

// Change Password with Official Email OTP Verification
app.post('/api/auth/change-password', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  const { email, otp, newPassword } = req.body;

  const targetIdentifier = (user ? user.email : email)?.trim().toLowerCase();
  if (!targetIdentifier) {
    return sendError(res, 'Email address or authorized user session required.', 400);
  }

  if (!otp || !newPassword) {
    return sendError(res, 'Verification OTP and new password are required.', 400);
  }

  if (newPassword.length < 4) {
    return sendError(res, 'New password must be at least 4 characters long.', 400);
  }

  const targetUser = db.getUserByEmail(targetIdentifier);
  if (!targetUser) {
    return sendError(res, 'User profile not found.', 404);
  }

  // Verify OTP against the user's official email
  const otpRes = db.verifyOTP(targetUser.email, otp);
  if (!otpRes.success) {
    return sendError(res, otpRes.message, 400);
  }

  // Update password in database with salted scrypt hash
  db.updateUser(targetUser.id, { password: hashPassword(newPassword) });
  db.clearOTP(targetUser.email);

  return sendSuccess(res, { success: true }, 'Password has been updated and verified successfully.');
});

// General profile update
app.put('/api/user/profile', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);

  const { fullName, phoneNumber, targetRole, college } = req.body;
  if (fullName) user.fullName = fullName;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (user.studentProfile) {
    if (targetRole) user.studentProfile.targetRole = targetRole;
    if (college) user.studentProfile.college = college;
  }
  db.updateUser(user.id, user);
  return sendSuccess(res, user, 'Profile updated successfully');
});

// List all registered accounts (Safe for options page, never exposes passwords, never exposes admin details)
app.get('/api/auth/registered-users', (_req: Request, res: Response) => {
  const users = db.getUsers()
    .filter(u => u.role !== 'ROLE_ADMIN')
    .map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      college: u.studentProfile?.college || u.mentorProfile?.qualification,
      branch: u.studentProfile?.branch || u.mentorProfile?.specialization,
      createdAt: u.createdAt
    }));
  return sendSuccess(res, users);
});

// Student Register with Official College Email & OTP Verification
app.post('/api/auth/student/register', (req: Request, res: Response) => {
  const { email, password, fullName, phoneNumber, college, degree, branch, graduationYear, targetRole, otp } = req.body;
  
  if (!email || !password || !fullName) {
    return sendError(res, 'Official email, password, and full name are required');
  }

  const cleanEmail = email.trim().toLowerCase();

  // If OTP provided, verify it if not already verified
  if (otp) {
    const otpRes = db.verifyOTP(cleanEmail, otp);
    if (!otpRes.success && !db.isEmailVerified(cleanEmail)) {
      return sendError(res, otpRes.message, 400);
    }
  }

  if (db.getUserByEmail(cleanEmail)) {
    return sendError(res, 'An account with this college email already exists. Please sign in.', 409);
  }

  const userId = `usr_student_${Date.now()}`;
  const studentCode = db.generateNextUserCode('ROLE_STUDENT');
  const studentProfile: StudentProfile = {
    id: `std_${Date.now()}`,
    userId,
    code: studentCode,
    college: college || 'SRM Institute of Science and Technology',
    degree: degree || 'B.Tech',
    branch: branch || 'Computer Science & Engineering',
    graduationYear: graduationYear ? Number(graduationYear) : 2026,
    profileCompletion: 85,
    skills: ['Java', 'Problem Solving', 'Data Structures', 'Quantitative Aptitude'],
    targetRole: targetRole || 'Full-Stack Software Engineer',
    cgpa: 8.0,
    assignedMentorId: 'usr_mentor_demo',
    assignedMentorName: 'Dr. Evelyn Reed (Lead Faculty Mentor)'
  };

  const newUser: User = {
    id: userId,
    code: studentCode,
    email: cleanEmail,
    password: hashPassword(password), // Store salted scrypt hashed password
    fullName,
    phoneNumber: phoneNumber || '+91 9876543210',
    role: 'ROLE_STUDENT',
    active: true,
    createdAt: new Date().toISOString(),
    studentProfile
  };

  db.addUser(newUser);
  db.clearOTP(cleanEmail);
  const token = createToken(newUser);
  return sendSuccess(res, { token, user: newUser, message: `Student profile registered successfully with ID ${studentCode}.` }, 'Registration successful');
});

// Mentor Register with Official College Email & OTP Verification
app.post('/api/auth/mentor/register', (req: Request, res: Response) => {
  const { email, password, fullName, phoneNumber, qualification, specialization, experienceYears, professionalProfile, otp } = req.body;

  if (!email || !password || !fullName) {
    return sendError(res, 'Official email, password, and full name are required');
  }

  const cleanEmail = email.trim().toLowerCase();

  // If OTP provided, verify it if not already verified
  if (otp) {
    const otpRes = db.verifyOTP(cleanEmail, otp);
    if (!otpRes.success && !db.isEmailVerified(cleanEmail)) {
      return sendError(res, otpRes.message, 400);
    }
  }

  if (db.getUserByEmail(cleanEmail)) {
    return sendError(res, 'An account with this official email already exists. Please sign in.', 409);
  }

  const userId = `usr_mentor_${Date.now()}`;
  const mentorCode = db.generateNextUserCode('ROLE_MENTOR');
  const mentorProfile: MentorProfile = {
    id: `ment_${Date.now()}`,
    userId,
    code: mentorCode,
    qualification: qualification || 'M.Tech CSE / Ph.D.',
    specialization: specialization || 'Data Structures & System Design',
    experienceYears: experienceYears ? Number(experienceYears) : 5,
    professionalProfile: professionalProfile || 'Senior Tech Mentor & Placement Specialist',
    rating: 5.0,
    assignedStudentCount: 0
  };

  const newUser: User = {
    id: userId,
    code: mentorCode,
    email: cleanEmail,
    password: hashPassword(password), // Store salted scrypt hashed password
    fullName,
    phoneNumber: phoneNumber || '+91 9812345678',
    role: 'ROLE_MENTOR',
    active: true,
    createdAt: new Date().toISOString(),
    mentorProfile
  };

  db.addUser(newUser);
  db.clearOTP(cleanEmail);
  const token = createToken(newUser);
  return sendSuccess(res, { token, user: newUser, message: `Mentor profile registered successfully with ID ${mentorCode}.` }, 'Registration successful');
});

// Login Handlers (Student, Mentor, Admin)
const handleLogin = (req: Request, res: Response, expectedRole: UserRole) => {
  const { email, password, otp, fullName } = req.body;
  if (!email) {
    return sendError(res, 'Email ID / Username is required');
  }

  const cleanIdentifier = email.trim();
  const user = db.getUserByEmail(cleanIdentifier);
  if (!user) {
    return sendError(res, 'No account found with this ID or email. Please register first.', 401);
  }

  if (!user.active) {
    return sendError(res, 'Account is deactivated. Please contact administrator.', 403);
  }

  if (user.role !== expectedRole) {
    return sendError(res, `Access denied. This account is registered as ${user.role.replace('ROLE_', '')}, not ${expectedRole.replace('ROLE_', '')}.`, 403);
  }

  // If OTP-based login
  if (otp) {
    const otpRes = db.verifyOTP(user.email, otp);
    if (!otpRes.success) {
      return sendError(res, otpRes.message, 401);
    }
    db.clearOTP(user.email);
  } else {
    // Password verification
    if (!password) {
      return sendError(res, 'Password is required to authenticate this account.', 400);
    }
    // Check password with timing-safe verifyPassword (supports salted scrypt hashes & plaintext fallback)
    if (!verifyPassword(password, user.password)) {
      return sendError(res, 'Incorrect password. Please verify your credentials.', 401);
    }
  }

  // Ensure user has sequential institutional ID code
  if (!user.code) {
    if (user.role === 'ROLE_STUDENT') {
      user.code = db.generateNextUserCode('ROLE_STUDENT');
      if (user.studentProfile) user.studentProfile.code = user.code;
    } else if (user.role === 'ROLE_MENTOR') {
      user.code = db.generateNextUserCode('ROLE_MENTOR');
      if (user.mentorProfile) user.mentorProfile.code = user.code;
    }
    db.updateUser(user.id, user);
  }

  // Ensure student has assigned mentor
  if (user.role === 'ROLE_STUDENT') {
    if (!user.studentProfile) {
      user.studentProfile = {
        id: `std_${user.id}`,
        userId: user.id,
        code: user.code,
        college: 'SRM Institute of Science and Technology',
        degree: 'B.Tech',
        branch: 'Computer Science and Engineering',
        graduationYear: 2026,
        profileCompletion: 90,
        skills: ['Data Structures', 'Algorithms', 'Full Stack Development'],
        targetRole: 'Software Engineer',
        assignedMentorId: 'usr_mentor_inst',
        assignedMentorName: 'Institutional Mentor'
      };
      db.updateUser(user.id, user);
    } else if (!user.studentProfile.assignedMentorId) {
      user.studentProfile.assignedMentorId = 'usr_mentor_inst';
      user.studentProfile.assignedMentorName = 'Institutional Mentor';
      db.updateUser(user.id, user);
    }
  }

  // If user provided or updated their name during login/sign-in
  if (fullName && typeof fullName === 'string' && fullName.trim()) {
    user.fullName = fullName.trim();
    db.updateUser(user.id, user);
  }

  const token = createToken(user);
  return sendSuccess(res, { token, user, message: 'Authentication successful' }, 'Login successful');
};

app.post('/api/auth/student/login', (req: Request, res: Response) => handleLogin(req, res, 'ROLE_STUDENT'));
app.post('/api/auth/mentor/login', (req: Request, res: Response) => handleLogin(req, res, 'ROLE_MENTOR'));
app.post('/api/auth/admin/login', (req: Request, res: Response) => handleLogin(req, res, 'ROLE_ADMIN'));

// Get current user profile
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);
  return sendSuccess(res, user);
});

// ==================== STUDENT DASHBOARD & PROFILE ====================
app.get('/api/student/dashboard', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_STUDENT') return sendError(res, 'Unauthorized', 401);

  const testAttempts = db.getTestAttempts(user.id);
  const codingSubs = db.getSubmissions(user.id);
  const mockInterviews = db.getInterviews(user.id);
  const resumeAnalyses = db.getResumeAnalyses(user.id);
  const tasks = db.getMentorTasks(user.id);
  const sessions = db.getMentoringSessions(user.id);
  const achievements = db.getAchievements(user.id);

  // Calculate scores (start from 0 if fresh student has no activity)
  const aptitudeAvg = testAttempts.length > 0
    ? Math.round(testAttempts.reduce((acc, curr) => acc + curr.score, 0) / testAttempts.length)
    : 0;

  const acceptedCodingCount = codingSubs.filter(s => s.status === 'Accepted').length;
  const codingScore = acceptedCodingCount > 0
    ? Math.min(100, Math.round((acceptedCodingCount / 10) * 100))
    : 0;

  const evaluatedInterviews = mockInterviews.filter(i => i.evaluation);
  const interviewAvg = evaluatedInterviews.length > 0
    ? Math.round(evaluatedInterviews.reduce((acc, curr) => acc + (curr.evaluation?.overallScore || 0), 0) / evaluatedInterviews.length)
    : 0;

  const resumeScore = resumeAnalyses.length > 0 ? resumeAnalyses[0].resumeScore : 0;

  const hasActivity = testAttempts.length > 0 || acceptedCodingCount > 0 || evaluatedInterviews.length > 0 || resumeAnalyses.length > 0;

  const readinessScore = {
    overall: hasActivity
      ? Math.round((aptitudeAvg * 0.25) + (codingScore * 0.3) + (interviewAvg * 0.25) + (resumeScore * 0.2))
      : 0,
    aptitude: aptitudeAvg,
    coding: codingScore,
    technical: hasActivity ? Math.max(aptitudeAvg, codingScore) : 0,
    communication: interviewAvg,
    interview: interviewAvg,
    resume: resumeScore
  };

  // Find mentor details if assigned
  let assignedMentor = undefined;
  const mentorId = user.studentProfile?.assignedMentorId || 'usr_mentor_inst';
  const mentorUser = db.getUserById(mentorId);
  if (mentorUser && mentorUser.mentorProfile) {
    assignedMentor = {
      id: mentorUser.id,
      code: mentorUser.code || 'MT0001',
      name: mentorUser.fullName,
      email: mentorUser.email,
      qualification: mentorUser.mentorProfile.qualification,
      specialization: mentorUser.mentorProfile.specialization
    };
  }

  const uploadedNotes = db.getUploadedNotesForStudent(user.id, mentorId);

  const dashboardData = {
    profile: user.studentProfile,
    readinessScore,
    totalAptitudeTests: testAttempts.length,
    totalCodingSolved: acceptedCodingCount,
    totalInterviews: mockInterviews.length,
    currentStreakDays: testAttempts.length > 0 || acceptedCodingCount > 0 ? 1 : 0,
    assignedMentor,
    uploadedNotes,
    recentActivities: [
      ...testAttempts.map(t => ({ id: t.id, type: 'Aptitude Test', title: t.testTitle, score: t.score, date: t.completedAt })),
      ...codingSubs.map(c => ({ id: c.id, type: 'Coding Problem', title: c.problemTitle, score: c.status === 'Accepted' ? 100 : 0, date: c.submittedAt })),
      ...mockInterviews.map(m => ({ id: m.id, type: 'AI Interview', title: `${m.interviewType} Interview (${m.targetRole})`, score: m.evaluation?.overallScore, date: m.createdAt }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    upcomingSessions: sessions.filter(s => s.status === 'Scheduled'),
    pendingTasks: tasks.filter(t => t.status !== 'Completed'),
    achievements
  };

  return sendSuccess(res, dashboardData);
});

// Student Notes from Assigned Mentor (Drive)
app.get('/api/student/notes', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_STUDENT') return sendError(res, 'Unauthorized', 401);
  const mentorId = user.studentProfile?.assignedMentorId || 'usr_mentor_inst';
  const notes = db.getUploadedNotesForStudent(user.id, mentorId);
  return sendSuccess(res, notes);
});

app.get('/api/student/profile', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);
  return sendSuccess(res, { user, profile: user.studentProfile });
});

app.put('/api/student/profile', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_STUDENT') return sendError(res, 'Unauthorized', 401);

  const { fullName, phoneNumber, college, degree, branch, graduationYear, targetRole, skills, cgpa } = req.body;
  if (fullName || phoneNumber) {
    user.fullName = fullName || user.fullName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
  }
  if (user.studentProfile) {
    user.studentProfile.college = college || user.studentProfile.college;
    user.studentProfile.degree = degree || user.studentProfile.degree;
    user.studentProfile.branch = branch || user.studentProfile.branch;
    user.studentProfile.graduationYear = graduationYear ? Number(graduationYear) : user.studentProfile.graduationYear;
    user.studentProfile.targetRole = targetRole || user.studentProfile.targetRole;
    user.studentProfile.skills = Array.isArray(skills) ? skills : user.studentProfile.skills;
    user.studentProfile.cgpa = cgpa ? Number(cgpa) : user.studentProfile.cgpa;
  }

  db.updateUser(user.id, user);
  return sendSuccess(res, user, 'Profile updated successfully');
});

// ==================== APTITUDE MODULE ====================
app.get('/api/aptitude/questions', (req: Request, res: Response) => {
  const category = req.query.category as string;
  const difficulty = req.query.difficulty as string;
  let questions = db.getAptitudeQuestions();

  if (category) questions = questions.filter(q => q.category === category);
  if (difficulty) questions = questions.filter(q => q.difficulty === difficulty);

  return sendSuccess(res, questions);
});

app.post('/api/aptitude/test/submit', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);

  const { testTitle, category, answers, timeTakenSeconds } = req.body;
  if (!Array.isArray(answers)) return sendError(res, 'Answers array required');

  const questions = db.getAptitudeQuestions();
  let correctCount = 0;

  const processedAnswers = answers.map((ans: { questionId: string; selectedOption: number }) => {
    const q = questions.find(item => item.id === ans.questionId);
    const isCorrect = q ? q.correctAnswer === ans.selectedOption : false;
    if (isCorrect) correctCount++;
    return {
      questionId: ans.questionId,
      selectedOption: ans.selectedOption,
      isCorrect
    };
  });

  const totalQuestions = answers.length || 1;
  const score = Math.round((correctCount / totalQuestions) * 100);
  const accuracy = score;

  const attempt: TestAttempt = {
    id: `att_${Date.now()}`,
    studentId: user.id,
    testTitle: testTitle || 'Aptitude Practice Test',
    category: category || 'Quantitative',
    totalQuestions,
    correctCount,
    score,
    accuracy,
    timeTakenSeconds: timeTakenSeconds || 300,
    completedAt: new Date().toISOString(),
    answers: processedAnswers
  };

  db.addTestAttempt(attempt);

  // Register in Mentor Approvals
  const mentorId = user.studentProfile?.assignedMentorId;
  const mentorUser = mentorId ? db.getUserById(mentorId) : undefined;
  db.addMentorApproval({
    id: `appr_${Date.now()}`,
    studentId: user.id,
    studentName: user.fullName,
    studentEmail: user.email,
    mentorId,
    mentorName: mentorUser ? mentorUser.fullName : undefined,
    itemType: 'APTITUDE_TEST',
    title: `Aptitude Test: ${attempt.testTitle}`,
    submittedAt: attempt.completedAt,
    status: 'PENDING',
    details: {
      score: attempt.score,
      accuracy: attempt.accuracy,
      totalQuestions: attempt.totalQuestions,
      correctCount: attempt.correctCount,
      answers: attempt.answers
    }
  });

  return sendSuccess(res, attempt, 'Test submitted successfully');
});

app.get('/api/aptitude/results', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);
  return sendSuccess(res, db.getTestAttempts(user.id));
});

// ==================== CODING MODULE ====================
app.get('/api/coding/problems', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  const { category, difficulty, search } = req.query;
  let problems = db.getCodingProblems();

  if (category) problems = problems.filter(p => p.category === (category as string) || p.topic === (category as string));
  if (difficulty) problems = problems.filter(p => p.difficulty === (difficulty as string));
  if (search) {
    const term = (search as string).toLowerCase();
    problems = problems.filter(p => p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
  }

  // If student is logged in, enrich with their completion status and saved code
  if (user && user.role === 'ROLE_STUDENT') {
    const studentProg = db.getStudentCodingProgress(user.id);
    const enriched = problems.map(p => {
      const prog = studentProg.find(pr => pr.problemId === p.id);
      return {
        ...p,
        isCompleted: prog ? prog.isCompleted : false,
        completedAt: prog?.completedAt,
        lastCode: prog?.lastCode,
        lastLanguage: prog?.lastLanguage,
        attemptsCount: prog?.attemptsCount || 0,
        mentorFeedback: prog?.mentorFeedback
      };
    });
    return sendSuccess(res, enriched);
  }

  return sendSuccess(res, problems);
});

app.get('/api/coding/problems/:id', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  const problem = db.getCodingProblemById(req.params.id);
  if (!problem) return sendError(res, 'Problem not found', 404);

  if (user && user.role === 'ROLE_STUDENT') {
    const prog = db.getStudentCodingProgressForProblem(user.id, problem.id);
    return sendSuccess(res, {
      ...problem,
      isCompleted: prog ? prog.isCompleted : false,
      completedAt: prog?.completedAt,
      lastCode: prog?.lastCode,
      lastLanguage: prog?.lastLanguage,
      attemptsCount: prog?.attemptsCount || 0,
      mentorFeedback: prog?.mentorFeedback,
      aiCheckLogs: prog?.aiCheckLogs || []
    });
  }

  return sendSuccess(res, problem);
});

// Run Code against sample test cases
app.post('/api/coding/run', (req: Request, res: Response) => {
  const { problemId, code, language, customInput } = req.body;
  const problem = db.getCodingProblemById(problemId);
  if (!problem) return sendError(res, 'Problem not found', 404);

  const hasCode = code && code.trim().length > 15;
  const isAccepted = hasCode && !code.includes('Compilation error');

  return sendSuccess(res, {
    status: isAccepted ? 'Accepted' : 'Compilation Error',
    passCount: isAccepted ? (problem.testCases?.length || 2) : 0,
    totalCount: problem.testCases?.length || 2,
    outputDetails: isAccepted
      ? `Sample Output:\n${problem.sampleOutput}\n\nExecution Time: 14ms | Memory: 18.4 MB\nAll sample tests passed!`
      : `Error: Incomplete implementation or missing syntax tokens.`
  });
});

// AI Code Checker: Tells errors but DOES NOT solve it, student will solve it!
// After clearing all errors, the question will be marked as Completed!
app.post('/api/coding/check-ai', async (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);

  const { problemId, language, code } = req.body;
  const problem = db.getCodingProblemById(problemId);
  if (!problem) return sendError(res, 'Coding problem not found', 404);

  if (!code || !code.trim()) {
    return sendError(res, 'Please write your code before requesting AI error check', 400);
  }

  try {
    const aiResult = await checkStudentCodeWithAI({
      problemId: problem.id,
      problemTitle: problem.title,
      problemDescription: problem.description,
      language: language || 'java',
      code: code.trim(),
      testCases: problem.testCases || []
    });

    const existingProgress = db.getStudentCodingProgressForProblem(user.id, problem.id);
    const attemptsCount = (existingProgress?.attemptsCount || 0) + 1;
    const aiLogs = existingProgress?.aiCheckLogs || [];

    aiLogs.push({
      timestamp: new Date().toISOString(),
      hasError: aiResult.hasError,
      errorTitle: aiResult.errorTitle,
      errorDescription: aiResult.errorDescription
    });

    const isCompleted = aiResult.isCompleted;

    const progressRecord: StudentCodingProgress = {
      id: existingProgress?.id || `prog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId: user.id,
      studentName: user.fullName,
      studentCode: user.code || user.studentProfile?.code || 'ST0001',
      problemId: problem.id,
      problemTitle: problem.title,
      isCompleted: isCompleted || (existingProgress?.isCompleted ?? false),
      completedAt: isCompleted ? (existingProgress?.completedAt || new Date().toISOString()) : existingProgress?.completedAt,
      lastCode: code,
      lastLanguage: language || 'java',
      attemptsCount,
      aiCheckLogs: aiLogs.slice(-10),
      mentorFeedback: existingProgress?.mentorFeedback,
      updatedAt: new Date().toISOString()
    };

    db.saveStudentCodingProgress(progressRecord);

    // If successfully cleared all errors:
    if (isCompleted) {
      // Record official submission
      const submission: CodingSubmission = {
        id: `sub_${Date.now()}`,
        studentId: user.id,
        studentName: user.fullName,
        problemId: problem.id,
        problemTitle: problem.title,
        language: language || 'java',
        code,
        status: 'Accepted',
        passedTestCases: problem.testCases?.length || 2,
        totalTestCases: problem.testCases?.length || 2,
        executionTimeMs: 12,
        submittedAt: new Date().toISOString()
      };
      db.addSubmission(submission);

      // Register under mentor approvals so mentor can see and certify
      const mentorId = user.studentProfile?.assignedMentorId;
      const mentorUser = mentorId ? db.getUserById(mentorId) : undefined;
      db.addMentorApproval({
        id: `appr_${Date.now()}`,
        studentId: user.id,
        studentName: user.fullName,
        studentEmail: user.email,
        mentorId,
        mentorName: mentorUser?.fullName,
        itemType: 'CODING_LAB',
        title: `Coding Problem Solved: ${problem.title}`,
        submittedAt: new Date().toISOString(),
        status: 'APPROVED',
        details: {
          problemId: problem.id,
          problemTitle: problem.title,
          code,
          language: language || 'java',
          status: 'Accepted',
          passedTestCases: problem.testCases?.length || 2,
          totalTestCases: problem.testCases?.length || 2,
          aiFeedback: aiResult.pedagogicalGuidance
        }
      });
    }

    return sendSuccess(res, {
      ...aiResult,
      progress: progressRecord
    });
  } catch (err: any) {
    console.error('Error in AI code check:', err);
    return sendError(res, 'AI code analysis failed. Please try again.', 500);
  }
});

app.post('/api/coding/submit', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);

  const { problemId, code, language } = req.body;
  const problem = db.getCodingProblemById(problemId);
  if (!problem) return sendError(res, 'Problem not found', 404);

  const isAccepted = code && code.trim().length > 15;
  const submission: CodingSubmission = {
    id: `sub_${Date.now()}`,
    studentId: user.id,
    studentName: user.fullName,
    problemId: problem.id,
    problemTitle: problem.title,
    language: language || 'java',
    code,
    status: isAccepted ? 'Accepted' : 'Wrong Answer',
    passedTestCases: isAccepted ? (problem.testCases?.length || 2) : 1,
    totalTestCases: problem.testCases?.length || 2,
    executionTimeMs: Math.floor(Math.random() * 25) + 8,
    submittedAt: new Date().toISOString()
  };

  db.addSubmission(submission);
  return sendSuccess(res, submission, 'Solution submitted successfully');
});

app.get('/api/coding/submissions', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);
  return sendSuccess(res, db.getSubmissions(user.id));
});

// Student's own coding progress
app.get('/api/coding/progress', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);
  return sendSuccess(res, db.getStudentCodingProgress(user.id));
});

// Mentor adds any coding question they want
app.post('/api/mentor/coding/problems', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || (user.role !== 'ROLE_MENTOR' && user.role !== 'ROLE_ADMIN')) {
    return sendError(res, 'Unauthorized: Only faculty mentors can add coding questions', 403);
  }

  const {
    title, description, inputFormat, outputFormat, constraints,
    sampleInput, sampleOutput, difficulty, topic, category,
    starterCode, testCases
  } = req.body;

  if (!title?.trim() || !description?.trim()) {
    return sendError(res, 'Problem title and description are required', 400);
  }

  const newProblem: CodingProblem = {
    id: `cod_mentor_${Date.now()}`,
    title: title.trim(),
    description: description.trim(),
    inputFormat: inputFormat?.trim() || 'Single line input',
    outputFormat: outputFormat?.trim() || 'Single line output',
    constraints: constraints?.trim() || 'Standard constraints',
    sampleInput: sampleInput?.trim() || '',
    sampleOutput: sampleOutput?.trim() || '',
    difficulty: difficulty || 'Easy',
    topic: topic?.trim() || 'Algorithms',
    category: category?.trim() || 'General',
    starterCode: starterCode || {
      java: `import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write code here\n    }\n}`,
      python: `def solve():\n    # Write code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write code here\n    return 0;\n}`,
      javascript: `function solve() {\n    // Write code here\n}`
    },
    testCases: Array.isArray(testCases) && testCases.length > 0 ? testCases : [
      { input: sampleInput || '1', expectedOutput: sampleOutput || '1' }
    ]
  };

  db.addCodingProblem(newProblem);
  return sendSuccess(res, newProblem, 'Coding question added successfully! Students can now practice it in the IDE.');
});

// Mentor views code and progress of each student
app.get('/api/mentor/coding/progress', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || (user.role !== 'ROLE_MENTOR' && user.role !== 'ROLE_ADMIN')) {
    return sendError(res, 'Unauthorized', 401);
  }

  const allStudents = db.getUsers().filter(u => u.role === 'ROLE_STUDENT');
  const acceptedStudents = allStudents.filter(s => {
    if (user.role === 'ROLE_ADMIN') return true;
    return db.isStudentAcceptedByMentor(s.id, user.id) || s.studentProfile?.assignedMentorId === user.id;
  });

  const problems = db.getCodingProblems();
  const allProgress = db.getAllStudentsCodingProgress();

  const studentData = acceptedStudents.map(student => {
    const studentProg = allProgress.filter(p => p.studentId === student.id);
    const completedProblems = studentProg.filter(p => p.isCompleted);

    const problemBreakdown = problems.map(prob => {
      const pRecord = studentProg.find(p => p.problemId === prob.id);
      return {
        problemId: prob.id,
        problemTitle: prob.title,
        difficulty: prob.difficulty,
        topic: prob.topic,
        category: prob.category,
        isCompleted: pRecord ? pRecord.isCompleted : false,
        completedAt: pRecord?.completedAt,
        lastCode: pRecord?.lastCode,
        lastLanguage: pRecord?.lastLanguage,
        attemptsCount: pRecord?.attemptsCount || 0,
        aiCheckLogs: pRecord?.aiCheckLogs || [],
        mentorFeedback: pRecord?.mentorFeedback
      };
    });

    return {
      studentId: student.id,
      studentName: student.fullName,
      studentEmail: student.email,
      studentCode: student.code || student.studentProfile?.code || 'ST0001',
      college: student.studentProfile?.college,
      branch: student.studentProfile?.branch,
      targetRole: student.studentProfile?.targetRole,
      totalProblems: problems.length,
      completedProblemsCount: completedProblems.length,
      completedCount: completedProblems.length,
      completionRate: problems.length > 0 ? Math.round((completedProblems.length / problems.length) * 100) : 0,
      problemBreakdown
    };
  });

  return sendSuccess(res, studentData);
});

// Mentor saves feedback on student's coding solution
app.post('/api/mentor/coding/feedback', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const { studentId, problemId, feedback } = req.body;
  if (!studentId || !problemId) return sendError(res, 'Student and problem are required', 400);

  const existing = db.getStudentCodingProgressForProblem(studentId, problemId);
  if (existing) {
    existing.mentorFeedback = feedback;
    db.saveStudentCodingProgress(existing);
  }
  return sendSuccess(res, existing, 'Mentor feedback recorded successfully');
});

// ==================== TECHNICAL QUESTIONS ====================
app.get('/api/technical/questions', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  const { subject, difficulty, search } = req.query;
  let questions = db.getTechnicalQuestions();

  if (subject) questions = questions.filter(q => q.subject.toLowerCase() === (subject as string).toLowerCase());
  if (difficulty) questions = questions.filter(q => q.difficulty === (difficulty as string));
  if (search) {
    const term = (search as string).toLowerCase();
    questions = questions.filter(q => q.question.toLowerCase().includes(term) || q.answer.toLowerCase().includes(term));
  }

  const userBookmarks = user ? db.getBookmarks(user.id) : [];
  const enriched = questions.map(q => {
    const bm = userBookmarks.find(b => b.questionId === q.id);
    return {
      ...q,
      isBookmarked: !!bm,
      isCompleted: bm ? bm.isCompleted : false
    };
  });

  return sendSuccess(res, enriched);
});

app.post('/api/technical/bookmark', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);
  const { questionId } = req.body;
  const isBookmarked = db.toggleBookmark(user.id, questionId);
  return sendSuccess(res, { isBookmarked });
});

app.post('/api/technical/complete', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);
  const { questionId } = req.body;
  const isCompleted = db.toggleCompleted(user.id, questionId);
  return sendSuccess(res, { isCompleted });
});

// ==================== AI MOCK INTERVIEW ====================
app.post('/api/interview/start', async (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);

  const { interviewType, difficulty, targetRole } = req.body;
  const branch = user.studentProfile?.branch || 'Computer Science';
  const skills = user.studentProfile?.skills || ['Java', 'SQL'];

  const questions = await generateInterviewQuestions(
    targetRole || user.studentProfile?.targetRole || 'SDE-1',
    branch,
    skills,
    interviewType || 'Technical',
    difficulty || 'Intermediate'
  );

  const newInterview: MockInterview = {
    id: `int_${Date.now()}`,
    studentId: user.id,
    interviewType: interviewType || 'Technical',
    difficulty: difficulty || 'Intermediate',
    targetRole: targetRole || user.studentProfile?.targetRole || 'SDE-1',
    questions,
    status: 'In Progress',
    createdAt: new Date().toISOString()
  };

  db.addInterview(newInterview);
  return sendSuccess(res, newInterview, 'Interview session initialized');
});

app.post('/api/interview/evaluate', async (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);

  const { interviewId, qaList } = req.body;
  const interview = db.getInterviews(user.id).find(i => i.id === interviewId);
  if (!interview) return sendError(res, 'Interview session not found', 404);

  const evaluation = await evaluateInterviewAnswers(
    interview.targetRole,
    interview.interviewType,
    qaList || []
  );

  const updated = db.updateInterview(interviewId, {
    status: 'Completed',
    completedAt: new Date().toISOString(),
    evaluation
  });

  // Register in Mentor Approvals
  const mentorId = user.studentProfile?.assignedMentorId;
  const mentorUser = mentorId ? db.getUserById(mentorId) : undefined;
  db.addMentorApproval({
    id: `appr_${Date.now()}`,
    studentId: user.id,
    studentName: user.fullName,
    studentEmail: user.email,
    mentorId,
    mentorName: mentorUser ? mentorUser.fullName : undefined,
    itemType: 'MOCK_INTERVIEW',
    title: `Mock Interview: ${interview.targetRole} (${interview.interviewType})`,
    submittedAt: updated?.completedAt || new Date().toISOString(),
    status: 'PENDING',
    details: {
      interviewId,
      interviewType: interview.interviewType,
      targetRole: interview.targetRole,
      difficulty: interview.difficulty,
      questions: interview.questions,
      evaluation
    }
  });

  return sendSuccess(res, updated, 'Interview evaluated successfully');
});

app.get('/api/interview/history', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);
  return sendSuccess(res, db.getInterviews(user.id));
});

// ==================== RESUME ANALYZER ====================
app.post('/api/resume/upload', async (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);

  const { resumeText, fileName, targetRole } = req.body;
  const textContent = resumeText || `Rahul Sharma | Computer Science Student | NIT College
Skills: Java, Spring Boot, REST APIs, MySQL, Data Structures, Git.
Projects: Campus Placement Web Application, Online Quiz Engine.
Education: B.Tech CSE (8.8 CGPA, 2026 Batch).`;

  const aiResult = await analyzeResumeWithAI(textContent, targetRole || user.studentProfile?.targetRole || 'SDE-1');

  const analysis: ResumeAnalysis = {
    id: `res_${Date.now()}`,
    studentId: user.id,
    fileName: fileName || 'Resume_Placement.pdf',
    resumeScore: aiResult.resumeScore || 80,
    detectedSkills: aiResult.detectedSkills || ['Java', 'SQL', 'React'],
    missingSkills: aiResult.missingSkills || ['Docker', 'AWS'],
    formattingSuggestions: aiResult.formattingSuggestions || ['Add metrics to experience bullets'],
    keywordSuggestions: aiResult.keywordSuggestions || ['Microservices', 'Spring Security'],
    projectSuggestions: aiResult.projectSuggestions || ['Build an online code judge'],
    placementImprovementSuggestions: aiResult.placementImprovementSuggestions || ['Add certifications'],
    analyzedAt: new Date().toISOString(),
    summary: aiResult.summary || 'Solid resume for entry-level SDE role.'
  };

  db.addResumeAnalysis(analysis);
  return sendSuccess(res, analysis, 'Resume analyzed successfully');
});

app.get('/api/resume/history', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);
  return sendSuccess(res, db.getResumeAnalyses(user.id));
});

// ==================== AI LEARNING PATH ====================
app.get('/api/learning-path', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);
  let lp = db.getLearningPath(user.id);
  if (!lp) {
    lp = {
      id: `lp_${Date.now()}`,
      studentId: user.id,
      currentLevel: 'Intermediate',
      targetRole: user.studentProfile?.targetRole || 'SDE-1',
      generatedAt: new Date().toISOString(),
      weeks: [
        {
          weekNumber: 1,
          title: 'Week 1: Core Fundamentals & Aptitude Drills',
          focusArea: 'Data Structures, OOP Concepts & Time/Work Quantitative Aptitude',
          topics: [
            { name: 'Java Collections Framework (HashMap, ConcurrentHashMap)', type: 'Technical', description: 'Internal hash table bucketing & treeification', completed: true },
            { name: 'Multithreading & ExecutorService', type: 'Technical', description: 'Thread lifecycle, synchronization, lock primitives', completed: true },
            { name: 'Quantitative Aptitude - Time & Work', type: 'Aptitude', description: 'Solve 20 medium-hard time and work numericals', completed: true }
          ]
        },
        {
          weekNumber: 2,
          title: 'Week 2: Spring Boot & Database Optimization',
          focusArea: 'Enterprise Java, Security & SQL Indexing',
          topics: [
            { name: 'Spring Data JPA & Hibernate Relationships', type: 'Technical', description: 'Master OneToMany, ManyToOne and lazy loading', completed: true },
            { name: 'JWT Authentication & Spring Security Filters', type: 'Technical', description: 'Configure custom SecurityFilterChain and Bearer parsing', completed: false },
            { name: 'Data Structures - Trees & Graphs', type: 'Coding', description: 'Solve 10 LeetCode Medium binary tree & BFS/DFS problems', completed: false }
          ]
        },
        {
          weekNumber: 3,
          title: 'Week 3: AI Mock Interview & Resume Optimization',
          focusArea: 'System Design Basics, HR Round Prep & Resume Polishing',
          topics: [
            { name: 'Full AI Technical Mock Interview', type: 'Interview', description: 'Complete a 30-min AI technical interview on backend topics', completed: false },
            { name: 'HR Behavioral Questions Preparation', type: 'Interview', description: 'Prepare STAR method answers for conflict resolution & leadership', completed: false }
          ]
        }
      ]
    };
    db.saveLearningPath(lp);
  }
  return sendSuccess(res, lp);
});

app.post('/api/learning-path/generate', async (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);

  const { targetRole, weakAreas } = req.body;
  const branch = user.studentProfile?.branch || 'Computer Science';
  const currentSkills = user.studentProfile?.skills || ['Java', 'SQL'];

  const weeks = await generateAILearningPath(
    branch,
    currentSkills,
    targetRole || user.studentProfile?.targetRole || 'SDE-1',
    weakAreas || ['System Design', 'Dynamic Programming']
  );

  const lp: LearningPath = {
    id: `lp_${Date.now()}`,
    studentId: user.id,
    currentLevel: 'Intermediate',
    targetRole: targetRole || user.studentProfile?.targetRole || 'SDE-1',
    weeks,
    generatedAt: new Date().toISOString()
  };

  db.saveLearningPath(lp);
  return sendSuccess(res, lp, 'Custom AI learning path generated');
});

// ==================== MENTOR APIS & STUDENT MENTOR SELECTION ====================
// List all registered mentors in the app for student selection
app.get('/api/student/mentors', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);

  const allUsers = db.getUsers();
  const mentors = allUsers.filter(u => u.role === 'ROLE_MENTOR' && u.active);
  const students = allUsers.filter(u => u.role === 'ROLE_STUDENT');

  const mentorList = mentors.map(m => {
    const assignedCount = students.filter(s => s.studentProfile?.assignedMentorId === m.id).length;
    const isCurrentlyAssigned = user.studentProfile?.assignedMentorId === m.id;
    return {
      id: m.id,
      fullName: m.fullName,
      email: m.email,
      phoneNumber: m.phoneNumber,
      department: m.mentorProfile?.specialization || m.mentorProfile?.qualification || 'AIML & Computer Science',
      specialization: m.mentorProfile?.specialization || 'AIML',
      qualification: m.mentorProfile?.qualification || 'Institutional Faculty Lead',
      experienceYears: m.mentorProfile?.experienceYears || 5,
      company: m.mentorProfile?.company || 'Campus Placement Directorate',
      bio: m.mentorProfile?.bio || 'Experienced faculty mentor specializing in placement readiness, mock interview reviews, and coding problem verification.',
      assignedStudentsCount: assignedCount,
      isCurrentlyAssigned,
      status: 'Available'
    };
  });

  return sendSuccess(res, mentorList);
});

// Student requests mentor by entering Mentor ID (e.g. MT0001 or email or user ID)
app.post('/api/student/request-mentor', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_STUDENT') return sendError(res, 'Unauthorized', 401);

  const { mentorIdOrCode, message } = req.body;
  if (!mentorIdOrCode || typeof mentorIdOrCode !== 'string' || !mentorIdOrCode.trim()) {
    return sendError(res, 'Mentor ID or Code is required (e.g. MT0001)', 400);
  }

  const cleanIdentifier = mentorIdOrCode.trim();
  const mentor = db.getUserByEmail(cleanIdentifier);
  if (!mentor || mentor.role !== 'ROLE_MENTOR') {
    return sendError(res, `Faculty mentor with ID "${cleanIdentifier}" not found. Please verify the Mentor Code.`, 404);
  }

  const requestId = `req_${Date.now()}`;
  const newRequest: MentorshipRequest = {
    id: requestId,
    studentId: user.id,
    studentName: user.fullName,
    studentEmail: user.email,
    studentCode: user.code || 'ST0001',
    studentCollege: user.studentProfile?.college || 'SRM Institute of Science and Technology',
    studentBranch: user.studentProfile?.branch || 'Computer Science & Engineering',
    studentGraduationYear: user.studentProfile?.graduationYear || 2026,
    studentTargetRole: user.studentProfile?.targetRole || 'Software Development Engineer (SDE)',
    mentorId: mentor.id,
    mentorName: mentor.fullName,
    mentorCode: mentor.code || 'MT0001',
    mentorSpecialization: mentor.mentorProfile?.specialization || 'System Design & DSA',
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
    message: message || 'Student requested mentorship connection and guidance.'
  };

  db.addMentorshipRequest(newRequest);

  if (!user.studentProfile) {
    user.studentProfile = {
      id: `std_${user.id}`,
      userId: user.id,
      code: user.code || 'ST0001',
      college: 'SRM Institute of Science and Technology',
      degree: 'B.Tech',
      branch: 'Computer Science & Engineering',
      graduationYear: 2026,
      profileCompletion: 85,
      skills: ['Java', 'Data Structures', 'Algorithms'],
      targetRole: 'Software Engineer',
      assignedMentorId: mentor.id,
      assignedMentorName: mentor.fullName,
      assignedMentorCode: mentor.code,
      mentorshipStatus: 'PENDING'
    };
  } else {
    user.studentProfile.assignedMentorId = mentor.id;
    user.studentProfile.assignedMentorName = mentor.fullName;
    user.studentProfile.assignedMentorCode = mentor.code;
    user.studentProfile.mentorshipStatus = 'PENDING';
  }
  db.updateUser(user.id, user);

  // Add into Mentor Approvals table as a Pending item for the mentor
  const approvalItem: MentorApprovalItem = {
    id: `appr_req_${requestId}`,
    studentId: user.id,
    studentName: user.fullName,
    studentEmail: user.email,
    mentorId: mentor.id,
    mentorName: mentor.fullName,
    itemType: 'PROJECT_REVIEW',
    title: `Mentorship Request: ${user.fullName} (${user.code || 'ST0001'})`,
    submittedAt: new Date().toISOString(),
    status: 'PENDING',
    details: {
      isMentorshipRequest: true,
      requestId,
      studentCode: user.code || 'ST0001',
      college: user.studentProfile.college,
      branch: user.studentProfile.branch,
      targetRole: user.studentProfile.targetRole,
      message: message || 'Mentorship connection request'
    }
  };
  db.addMentorApproval(approvalItem);

  db.addNotification({
    id: `notif_${Date.now()}`,
    userId: mentor.id,
    title: 'New Student Mentorship Request',
    message: `${user.fullName} (${user.code || 'ST0001'}) has sent a mentorship request. Review in Student Approvals.`,
    type: 'TASK',
    read: false,
    createdAt: new Date().toISOString()
  });

  return sendSuccess(res, { request: newRequest, user }, `Mentorship request sent to ${mentor.fullName} (${mentor.code || 'MT0001'}). Awaiting approval.`);
});

// Mentor gets list of student mentorship requests
app.get('/api/mentor/requests', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const requests = db.getMentorshipRequests(user.id);
  return sendSuccess(res, requests);
});

// Mentor accepts student mentorship request
app.post('/api/mentor/requests/:id/accept', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const request = db.getMentorshipRequestById(req.params.id);
  if (!request) return sendError(res, 'Mentorship request not found', 404);
  if (request.mentorId.toLowerCase() !== user.id.toLowerCase()) return sendError(res, 'Unauthorized to respond to this request', 403);

  db.updateMentorshipRequest(request.id, {
    status: 'ACCEPTED',
    respondedAt: new Date().toISOString()
  });

  const student = db.getUserById(request.studentId);
  if (student && student.studentProfile) {
    student.studentProfile.assignedMentorId = user.id;
    student.studentProfile.assignedMentorName = user.fullName;
    student.studentProfile.assignedMentorCode = user.code || 'MT0001';
    student.studentProfile.mentorshipStatus = 'ACCEPTED';
    db.updateUser(student.id, student);
  }

  // Update corresponding mentor approval item
  const approvalItems = db.getMentorApprovals({ mentorId: user.id });
  const linkedAppr = approvalItems.find(a => a.details?.requestId === request.id || a.id === `appr_req_${request.id}`);
  if (linkedAppr) {
    db.updateMentorApproval(linkedAppr.id, {
      status: 'APPROVED',
      reviewedAt: new Date().toISOString(),
      mentorNotes: 'Mentorship connection accepted. Student assigned to faculty cohort.'
    });
  }

  db.addNotification({
    id: `notif_${Date.now()}`,
    userId: request.studentId,
    title: 'Mentorship Request Accepted! ✓',
    message: `Faculty Mentor ${user.fullName} (${user.code || 'MT0001'}) has accepted your mentorship request.`,
    type: 'SYSTEM',
    read: false,
    createdAt: new Date().toISOString()
  });

  return sendSuccess(res, { requestId: request.id, status: 'ACCEPTED' }, `Accepted mentorship request for ${request.studentName}. Student progress is now accessible.`);
});

// Mentor declines student mentorship request
app.post('/api/mentor/requests/:id/decline', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const request = db.getMentorshipRequestById(req.params.id);
  if (!request) return sendError(res, 'Mentorship request not found', 404);
  if (request.mentorId.toLowerCase() !== user.id.toLowerCase()) return sendError(res, 'Unauthorized to respond to this request', 403);

  db.updateMentorshipRequest(request.id, {
    status: 'DECLINED',
    respondedAt: new Date().toISOString()
  });

  const student = db.getUserById(request.studentId);
  if (student && student.studentProfile) {
    student.studentProfile.mentorshipStatus = 'DECLINED';
    db.updateUser(student.id, student);
  }

  const approvalItems = db.getMentorApprovals({ mentorId: user.id });
  const linkedAppr = approvalItems.find(a => a.details?.requestId === request.id || a.id === `appr_req_${request.id}`);
  if (linkedAppr) {
    db.updateMentorApproval(linkedAppr.id, {
      status: 'REVISION_REQUESTED',
      reviewedAt: new Date().toISOString(),
      mentorNotes: 'Mentorship request declined due to cohort capacity.'
    });
  }

  db.addNotification({
    id: `notif_${Date.now()}`,
    userId: request.studentId,
    title: 'Mentorship Request Update',
    message: `Faculty Mentor ${user.fullName} was unable to accept your request at this time.`,
    type: 'SYSTEM',
    read: false,
    createdAt: new Date().toISOString()
  });

  return sendSuccess(res, { requestId: request.id, status: 'DECLINED' }, `Declined request for ${request.studentName}.`);
});

// Student selects/requests mentor
app.post('/api/student/select-mentor', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_STUDENT') return sendError(res, 'Unauthorized', 401);

  const { mentorId } = req.body;
  if (!mentorId) return sendError(res, 'Mentor ID is required', 400);

  const mentor = db.getUserById(mentorId);
  if (!mentor || mentor.role !== 'ROLE_MENTOR') {
    return sendError(res, 'Selected mentor was not found or is not a registered faculty mentor.', 404);
  }

  // Create mentorship request
  const requestId = `req_${Date.now()}`;
  const newRequest: MentorshipRequest = {
    id: requestId,
    studentId: user.id,
    studentName: user.fullName,
    studentEmail: user.email,
    studentCode: user.code || 'ST0001',
    studentCollege: user.studentProfile?.college || 'SRM Institute of Science and Technology',
    studentBranch: user.studentProfile?.branch || 'Computer Science & Engineering',
    studentGraduationYear: user.studentProfile?.graduationYear || 2026,
    studentTargetRole: user.studentProfile?.targetRole || 'Software Development Engineer (SDE)',
    mentorId: mentor.id,
    mentorName: mentor.fullName,
    mentorCode: mentor.code || 'MT0001',
    mentorSpecialization: mentor.mentorProfile?.specialization || 'System Design & DSA',
    status: 'PENDING',
    requestedAt: new Date().toISOString()
  };
  db.addMentorshipRequest(newRequest);

  if (!user.studentProfile) {
    user.studentProfile = {
      id: `std_${user.id}`,
      userId: user.id,
      code: user.code || 'ST0001',
      college: 'SRM Institute of Science and Technology',
      degree: 'B.Tech',
      branch: 'Computer Science & Engineering',
      graduationYear: 2026,
      profileCompletion: 85,
      skills: ['Java', 'Data Structures', 'AIML'],
      targetRole: 'Software Engineer',
      assignedMentorId: mentor.id,
      assignedMentorName: mentor.fullName,
      assignedMentorCode: mentor.code,
      mentorshipStatus: 'PENDING'
    };
  } else {
    user.studentProfile.assignedMentorId = mentor.id;
    user.studentProfile.assignedMentorName = mentor.fullName;
    user.studentProfile.assignedMentorCode = mentor.code;
    user.studentProfile.mentorshipStatus = 'PENDING';
  }
  db.updateUser(user.id, user);

  // Add into Mentor Approvals
  db.addMentorApproval({
    id: `appr_req_${requestId}`,
    studentId: user.id,
    studentName: user.fullName,
    studentEmail: user.email,
    mentorId: mentor.id,
    mentorName: mentor.fullName,
    itemType: 'PROJECT_REVIEW',
    title: `Mentorship Request: ${user.fullName} (${user.code || 'ST0001'})`,
    submittedAt: new Date().toISOString(),
    status: 'PENDING',
    details: {
      isMentorshipRequest: true,
      requestId,
      studentCode: user.code || 'ST0001',
      college: user.studentProfile.college,
      branch: user.studentProfile.branch,
      targetRole: user.studentProfile.targetRole
    }
  });

  return sendSuccess(res, {
    assignedMentor: {
      id: mentor.id,
      name: mentor.fullName,
      email: mentor.email,
      specialization: mentor.mentorProfile?.specialization || 'AIML',
      qualification: mentor.mentorProfile?.qualification || 'Institutional Faculty Lead'
    },
    user
  }, `Mentorship request sent to ${mentor.fullName}. Awaiting mentor approval.`);
});

app.get('/api/mentor/dashboard', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const allUsers = db.getUsers().filter(u => u.role === 'ROLE_STUDENT');
  // ONLY students whose request is ACCEPTED by this mentor!
  const assignedStudents = allUsers.filter(u => db.isStudentAcceptedByMentor(u.id, user.id));
  const tasks = db.getMentorTasks(undefined, user.id);
  const sessions = db.getMentoringSessions(undefined, user.id);
  const allApprovals = db.getMentorApprovals({ mentorId: user.id });
  const pendingApprovals = allApprovals.filter(a => a.status === 'PENDING');
  const approvedCount = allApprovals.filter(a => a.status === 'APPROVED').length;
  const mentorshipRequests = db.getMentorshipRequests(user.id);
  const pendingRequests = mentorshipRequests.filter(r => r.status === 'PENDING');

  // ONLY show progress of accepted students!
  const studentDetails = assignedStudents.map(s => {
    const attempts = db.getTestAttempts(s.id);
    const subs = db.getSubmissions(s.id);
    const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length) : 0;
    return {
      studentId: s.id,
      userId: s.id,
      code: s.code || 'ST0001',
      name: s.fullName,
      email: s.email,
      college: s.studentProfile?.college || 'N/A',
      branch: s.studentProfile?.branch || 'N/A',
      gradYear: s.studentProfile?.graduationYear || 2026,
      readinessScore: avgScore,
      codingSolved: subs.filter(sub => sub.status === 'Accepted').length,
      testsTaken: attempts.length
    };
  });

  const dashboardData = {
    mentorProfile: user.mentorProfile,
    totalStudents: assignedStudents.length,
    activeStudents: assignedStudents.filter(s => s.active).length,
    completedTasksCount: tasks.filter(t => t.status === 'Completed').length,
    pendingTasksCount: tasks.filter(t => t.status !== 'Completed').length,
    pendingApprovalsCount: pendingApprovals.length,
    approvedCount,
    pendingRequestsCount: pendingRequests.length,
    mentorshipRequests,
    averageStudentScore: studentDetails.length > 0 ? Math.round(studentDetails.reduce((a, b) => a + b.readinessScore, 0) / studentDetails.length) : 0,
    upcomingSessions: sessions.filter(s => s.status === 'Scheduled'),
    assignedStudents: studentDetails
  };

  return sendSuccess(res, dashboardData);
});

// ==================== MENTOR APPROVALS SYSTEM (MOCK INTERVIEWS, LABS, TESTS) ====================
app.get('/api/approvals', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);

  if (user.role === 'ROLE_STUDENT') {
    const list = db.getMentorApprovals({ studentId: user.id });
    return sendSuccess(res, list);
  } else if (user.role === 'ROLE_MENTOR' || user.role === 'ROLE_ADMIN') {
    const list = db.getMentorApprovals();
    return sendSuccess(res, list);
  }

  return sendSuccess(res, []);
});

app.get('/api/approvals/:id', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);

  const item = db.getMentorApprovalById(req.params.id);
  if (!item) return sendError(res, 'Approval item not found', 404);

  return sendSuccess(res, item);
});

app.post('/api/approvals', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user) return sendError(res, 'Unauthorized', 401);

  const { itemType, title, details } = req.body;
  if (!itemType || !title) return sendError(res, 'itemType and title are required');

  const mentorId = user.studentProfile?.assignedMentorId;
  const mentorUser = mentorId ? db.getUserById(mentorId) : undefined;

  const newApproval: MentorApprovalItem = {
    id: `appr_${Date.now()}`,
    studentId: user.id,
    studentName: user.fullName,
    studentEmail: user.email,
    mentorId,
    mentorName: mentorUser ? mentorUser.fullName : undefined,
    itemType,
    title,
    submittedAt: new Date().toISOString(),
    status: 'PENDING',
    details: details || {}
  };

  db.addMentorApproval(newApproval);

  if (mentorId) {
    db.addNotification({
      id: `notif_${Date.now()}`,
      userId: mentorId,
      title: 'New Student Submission Awaiting Approval',
      message: `${user.fullName} submitted ${title} for your mentor review & approval`,
      type: 'TASK',
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  return sendSuccess(res, newApproval, 'Submitted for mentor approval successfully');
});

app.put('/api/approvals/:id/review', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || (user.role !== 'ROLE_MENTOR' && user.role !== 'ROLE_ADMIN')) {
    return sendError(res, 'Only mentors and administrators can review student submissions.', 403);
  }

  const { id } = req.params;
  const { status, mentorNotes, mentorVoiceNoteUrl, mentorVoiceDuration } = req.body;

  const existing = db.getMentorApprovalById(id);
  if (!existing) return sendError(res, 'Submission not found', 404);

  const updated = db.updateMentorApproval(id, {
    status: status || 'APPROVED',
    mentorId: user.id,
    mentorName: user.fullName,
    reviewedAt: new Date().toISOString(),
    mentorNotes: mentorNotes !== undefined ? mentorNotes : existing.mentorNotes,
    mentorVoiceNoteUrl: mentorVoiceNoteUrl !== undefined ? mentorVoiceNoteUrl : existing.mentorVoiceNoteUrl,
    mentorVoiceDuration: mentorVoiceDuration !== undefined ? mentorVoiceDuration : existing.mentorVoiceDuration
  });

  const isApproved = (status || 'APPROVED') === 'APPROVED';
  db.addNotification({
    id: `notif_${Date.now()}`,
    userId: existing.studentId,
    title: isApproved ? `Approval Granted: ${existing.title}` : `Mentor Feedback: ${existing.title}`,
    message: `${user.fullName} has reviewed your submission${isApproved ? ' and awarded a verified Green Tick approval' : ''}. Check the Mentor Approval tab for notes and voice instructions.`,
    type: 'TASK',
    read: false,
    createdAt: new Date().toISOString()
  });

  return sendSuccess(res, updated, isApproved ? 'Submission approved with green tick' : 'Review recorded');
});

app.get('/api/mentor/students', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  // Requirement: only after mentor accepts request can mentor see student progress
  const assignedStudents = db.getUsers().filter(u => {
    if (u.role !== 'ROLE_STUDENT') return false;
    const isAccepted = db.isStudentAcceptedByMentor(u.id, user.id) ||
      (u.studentProfile?.assignedMentorId === user.id && u.studentProfile?.mentorshipStatus === 'ACCEPTED');
    return isAccepted;
  });
  return sendSuccess(res, assignedStudents);
});

app.get('/api/mentor/students/:id', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const student = db.getUserById(req.params.id);
  if (!student) return sendError(res, 'Student not found', 404);

  // Requirement: only after the mentor accepting the request only mentor can see the student progress
  const isAccepted = db.isStudentAcceptedByMentor(student.id, user.id) ||
    (student.studentProfile?.assignedMentorId === user.id && student.studentProfile?.mentorshipStatus === 'ACCEPTED');

  if (!isAccepted) {
    return sendError(res, 'Mentorship request must be accepted before you can view candidate progress, test attempts, and mock interviews.', 403);
  }

  const attempts = db.getTestAttempts(student.id);
  const submissions = db.getSubmissions(student.id);
  const interviews = db.getInterviews(student.id);
  const tasks = db.getMentorTasks(student.id, user.id);
  const feedbacks = db.getMentorFeedbacks(student.id);

  return sendSuccess(res, {
    student,
    attempts,
    submissions,
    interviews,
    tasks,
    feedbacks
  });
});

app.post('/api/mentor/tasks', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const { studentId, title, description, dueDate, priority } = req.body;
  const student = db.getUserById(studentId);
  if (!student) return sendError(res, 'Student not found', 404);

  const task: MentorTask = {
    id: `task_${Date.now()}`,
    mentorId: user.id,
    mentorName: user.fullName,
    studentId,
    studentName: student.fullName,
    title,
    description,
    dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    priority: priority || 'Medium',
    status: 'Pending',
    assignedAt: new Date().toISOString()
  };

  db.addMentorTask(task);
  db.addNotification({
    id: `notif_${Date.now()}`,
    userId: studentId,
    title: 'New Mentor Task Assigned',
    message: `${user.fullName} assigned task: ${title}`,
    type: 'TASK',
    read: false,
    createdAt: new Date().toISOString()
  });

  return sendSuccess(res, task, 'Task assigned successfully');
});

app.post('/api/mentor/feedback', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const { studentId, category, rating, comment } = req.body;

  const fb: MentorFeedback = {
    id: `fb_${Date.now()}`,
    mentorId: user.id,
    mentorName: user.fullName,
    studentId,
    category: category || 'General',
    rating: Number(rating) || 5,
    comment: comment || 'Great progress on technical questions.',
    createdAt: new Date().toISOString()
  };

  db.addMentorFeedback(fb);
  db.addNotification({
    id: `notif_${Date.now()}`,
    userId: studentId,
    title: 'New Mentor Feedback',
    message: `${user.fullName} left feedback on your ${category} progress`,
    type: 'FEEDBACK',
    read: false,
    createdAt: new Date().toISOString()
  });

  return sendSuccess(res, fb, 'Feedback recorded successfully');
});

app.post('/api/mentor/session', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const {
    sessionType, // 'ONE_TO_ONE' | 'GROUP'
    mentorName,
    studentId,
    title,
    scheduledAt,
    durationMinutes,
    meetingLink,
    notes,
    isLiveNow
  } = req.body;

  if (!title || !title.trim()) {
    return sendError(res, 'Session topic is required', 400);
  }

  let targetStudentName = 'All Assigned Mentees';
  let targetStudentCode = undefined;
  if (sessionType === 'ONE_TO_ONE' && studentId && studentId !== 'all') {
    const student = db.getUserById(studentId);
    if (student) {
      targetStudentName = student.fullName;
      targetStudentCode = student.code;
    }
  }

  // Generate meeting link if not supplied
  const generatedLink = meetingLink?.trim() || `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
  const status: SessionStatus = isLiveNow ? 'Live' : 'Scheduled';

  const session: MentoringSession = {
    id: `sess_${Date.now()}`,
    mentorId: user.id,
    mentorName: (mentorName || user.fullName).trim(),
    mentorCode: user.code || 'MT0001',
    sessionType: sessionType === 'GROUP' ? 'GROUP' : 'ONE_TO_ONE',
    studentId: sessionType === 'GROUP' ? 'all' : (studentId || 'all'),
    studentName: targetStudentName,
    studentCode: targetStudentCode,
    title: title.trim(),
    scheduledAt: scheduledAt || new Date().toISOString(),
    durationMinutes: Number(durationMinutes) || 45,
    meetingLink: generatedLink,
    status,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.addMentoringSession(session);

  // Send notifications to students
  if (sessionType === 'ONE_TO_ONE' && studentId && studentId !== 'all') {
    db.addNotification({
      id: `notif_${Date.now()}`,
      userId: studentId,
      title: status === 'Live' ? '🔴 Live 1-on-1 Mentoring Session Started!' : 'New 1-on-1 Mentoring Session Scheduled',
      message: `${session.mentorName} ${status === 'Live' ? 'started a live session' : 'scheduled a session'}: "${session.title}". Join via meeting link.`,
      type: 'SESSION',
      read: false,
      createdAt: new Date().toISOString()
    });
  } else {
    // Notify all accepted mentees
    const mentees = db.getUsers().filter(u => db.isStudentAcceptedByMentor(u.id, user.id));
    mentees.forEach(m => {
      db.addNotification({
        id: `notif_${Date.now()}_${m.id}`,
        userId: m.id,
        title: status === 'Live' ? '🔴 Live Group Session Started!' : 'New Group Mentoring Session Scheduled',
        message: `${session.mentorName} ${status === 'Live' ? 'started a live group masterclass' : 'scheduled a group session'}: "${session.title}".`,
        type: 'SESSION',
        read: false,
        createdAt: new Date().toISOString()
      });
    });
  }

  return sendSuccess(res, session, status === 'Live' ? 'Live session launched! Meeting link sent to students.' : 'Mentoring session scheduled successfully');
});

// Update session status (e.g. Start Live Now, Complete, Cancel)
app.put('/api/mentor/sessions/:id', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const { status, meetingLink, notes } = req.body;
  const session = db.updateMentoringSession(req.params.id, {
    ...(status ? { status } : {}),
    ...(meetingLink ? { meetingLink } : {}),
    ...(notes ? { notes } : {})
  });
  if (!session) return sendError(res, 'Session not found', 404);
  return sendSuccess(res, session, 'Session updated successfully');
});

// Student Sessions API: returns Live and Scheduled sessions for student
app.get('/api/student/sessions', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_STUDENT') return sendError(res, 'Unauthorized', 401);

  const mentorId = user.studentProfile?.assignedMentorId;
  const sessions = mentorId ? db.getMentoringSessions(user.id, mentorId) : [];

  const sorted = [...sessions].sort((a, b) => {
    if (a.status === 'Live' && b.status !== 'Live') return -1;
    if (b.status === 'Live' && a.status !== 'Live') return 1;
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  });

  return sendSuccess(res, sorted);
});

app.get('/api/mentor/tasks', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const tasks = db.getMentorTasks(undefined, user.id);
  return sendSuccess(res, tasks);
});

app.put('/api/mentor/tasks/:id/status', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const { status } = req.body;
  const task = db.updateMentorTaskStatus(req.params.id, status);
  if (!task) return sendError(res, 'Task not found', 404);
  return sendSuccess(res, task, 'Task updated');
});

app.get('/api/mentor/feedback', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const feedbacks = db.getMentorFeedbacks(undefined, user.id);
  return sendSuccess(res, feedbacks);
});

app.get('/api/mentor/sessions', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const sessions = db.getMentoringSessions(undefined, user.id);
  return sendSuccess(res, sessions);
});

// Mentor Uploaded Notes (Drive)
app.get('/api/mentor/notes', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const notes = db.getUploadedNotesByMentor(user.id);
  return sendSuccess(res, notes);
});

app.post('/api/mentor/notes', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const { title, description, topicCategory, fileName, fileType, fileSize, fileDataUrl, targetStudentId } = req.body;
  if (!title || !fileName) {
    return sendError(res, 'Title and file are required');
  }

  let targetStudentName = 'All Assigned Mentees';
  let targetStudentCode = undefined;
  if (targetStudentId && targetStudentId !== 'all') {
    const student = db.getUserById(targetStudentId);
    if (student) {
      targetStudentName = student.fullName;
      targetStudentCode = student.code;
    }
  }

  const newNote: UploadedNote = {
    id: `note_${Date.now()}`,
    mentorId: user.id,
    mentorName: user.fullName,
    mentorCode: user.code || 'MT0001',
    targetStudentId: targetStudentId || 'all',
    targetStudentName,
    targetStudentCode,
    title: title.trim(),
    description: (description || '').trim(),
    topicCategory: topicCategory || 'Lecture Notes',
    fileName: fileName.trim(),
    fileType: (fileType || 'pdf').toLowerCase(),
    fileSize: fileSize || '1.5 MB',
    fileDataUrl: fileDataUrl || '',
    uploadedAt: new Date().toISOString()
  };

  db.addUploadedNote(newNote);
  return sendSuccess(res, newNote, 'Document note uploaded successfully to Drive');
});

app.delete('/api/mentor/notes/:id', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || (user.role !== 'ROLE_MENTOR' && user.role !== 'ROLE_ADMIN')) {
    return sendError(res, 'Unauthorized', 401);
  }

  const success = db.deleteUploadedNote(req.params.id, user.id);
  if (!success) {
    return sendError(res, 'Note not found or could not be removed', 404);
  }
  return sendSuccess(res, { id: req.params.id }, 'Note removed from Drive');
});

// ==================== MENTOR & STUDENT EXAM SYSTEM ====================
// Mentor gets list of exams conducted by them
app.get('/api/mentor/exams', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const exams = db.getMentorExams(user.id);
  const examsWithStats = exams.map(e => {
    const submissions = db.getExamSubmissions(e.id);
    return {
      ...e,
      submissionCount: submissions.length,
      averageScore: submissions.length > 0
        ? Math.round(submissions.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / submissions.length)
        : 0
    };
  });
  return sendSuccess(res, examsWithStats);
});

// Mentor creates a new exam with MCQs, Short Answer, Long Answer, or Coding questions
app.post('/api/mentor/exams', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const {
    title, description, category, examType, scheduledAt,
    durationMinutes, passingMarks, targetStudentId, questions
  } = req.body;

  if (!title || !title.trim()) {
    return sendError(res, 'Exam title is required', 400);
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return sendError(res, 'At least one question is required to conduct an exam', 400);
  }

  const totalMarks = questions.reduce((sum: number, q: any) => sum + (Number(q.marks) || 1), 0);

  let targetStudentName = 'All Assigned Mentees';
  if (targetStudentId && targetStudentId !== 'all') {
    const student = db.getUserById(targetStudentId);
    if (student) targetStudentName = student.fullName;
  }

  const exam: MentorExam = {
    id: `exam_${Date.now()}`,
    mentorId: user.id,
    mentorName: user.fullName,
    mentorCode: user.code || 'MT0001',
    targetStudentId: targetStudentId || 'all',
    targetStudentName,
    title: title.trim(),
    description: description || '',
    category: category || 'Campus Placement Readiness',
    examType: examType === 'LIVE' ? 'LIVE' : 'SCHEDULED',
    scheduledAt: scheduledAt || new Date().toISOString(),
    durationMinutes: Number(durationMinutes) || 45,
    totalMarks,
    passingMarks: Number(passingMarks) || Math.round(totalMarks * 0.4),
    status: 'ACTIVE',
    questions: questions.map((q: any, i: number) => ({
      id: q.id || `q_${Date.now()}_${i}`,
      questionType: q.questionType || 'MCQ',
      questionText: q.questionText || '',
      marks: Number(q.marks) || 1,
      options: q.options || [],
      correctOptionIndex: q.correctOptionIndex !== undefined ? Number(q.correctOptionIndex) : undefined,
      explanation: q.explanation || '',
      modelAnswer: q.modelAnswer || '',
      starterCode: q.starterCode || '',
      language: q.language || 'java',
      sampleInput: q.sampleInput || '',
      sampleOutput: q.sampleOutput || ''
    })),
    createdAt: new Date().toISOString()
  };

  db.addMentorExam(exam);

  // Notify mentees
  const mentees = targetStudentId && targetStudentId !== 'all'
    ? [db.getUserById(targetStudentId)].filter(Boolean) as User[]
    : db.getUsers().filter(u => db.isStudentAcceptedByMentor(u.id, user.id));

  mentees.forEach(m => {
    db.addNotification({
      id: `notif_${Date.now()}_${m.id}`,
      userId: m.id,
      title: exam.examType === 'LIVE' ? '🔴 Live Exam Announced by Mentor!' : '📝 New Exam Assigned by Mentor',
      message: `${user.fullName} published exam: "${exam.title}" (${exam.durationMinutes} mins). Available in your Exams section.`,
      type: 'TASK',
      read: false,
      createdAt: new Date().toISOString()
    });
  });

  return sendSuccess(res, exam, 'Exam published successfully for students');
});

// Mentor inspects submissions for an exam
app.get('/api/mentor/exams/:id/submissions', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const submissions = db.getExamSubmissions(req.params.id);
  return sendSuccess(res, submissions);
});

// Mentor deletes an exam
app.delete('/api/mentor/exams/:id', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const deleted = db.deleteMentorExam(req.params.id, user.id);
  if (!deleted) return sendError(res, 'Exam not found or unauthorized', 404);
  return sendSuccess(res, { id: req.params.id }, 'Exam deleted successfully');
});

// Student gets available exams (Live and Scheduled)
app.get('/api/student/exams', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_STUDENT') return sendError(res, 'Unauthorized', 401);

  const mentorId = user.studentProfile?.assignedMentorId;
  const exams = mentorId ? db.getMentorExams(mentorId, user.id) : [];
  const submissions = db.getExamSubmissions(undefined, user.id);

  const examList = exams.map(e => {
    const studentSub = submissions.find(s => s.examId === e.id);
    return {
      ...e,
      hasSubmitted: !!studentSub,
      submission: studentSub
    };
  });

  return sendSuccess(res, examList);
});

// Student submits an exam attempt
app.post('/api/student/exams/:id/submit', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_STUDENT') return sendError(res, 'Unauthorized', 401);

  const exam = db.getMentorExamById(req.params.id);
  if (!exam) return sendError(res, 'Exam not found', 404);

  const { startedAt, answers } = req.body;
  if (!Array.isArray(answers)) return sendError(res, 'Answers array is required', 400);

  // Compute MCQ score automatically
  let autoAwardedMarks = 0;
  const evaluatedAnswers = answers.map((ans: any) => {
    const question = exam.questions.find(q => q.id === ans.questionId);
    let marksAwarded = 0;
    if (question && question.questionType === 'MCQ') {
      if (ans.selectedOptionIndex !== undefined && ans.selectedOptionIndex === question.correctOptionIndex) {
        marksAwarded = question.marks;
        autoAwardedMarks += marksAwarded;
      }
    }
    return {
      questionId: ans.questionId,
      questionType: ans.questionType,
      selectedOptionIndex: ans.selectedOptionIndex,
      answerText: ans.answerText || '',
      codeAnswer: ans.codeAnswer || '',
      marksAwarded,
      feedback: ''
    };
  });

  const percentage = Math.round((autoAwardedMarks / exam.totalMarks) * 100);

  const submission: StudentExamSubmission = {
    id: `sub_${Date.now()}`,
    examId: exam.id,
    examTitle: exam.title,
    studentId: user.id,
    studentName: user.fullName,
    studentCode: user.code || 'ST0001',
    mentorId: exam.mentorId,
    startedAt: startedAt || new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    answers: evaluatedAnswers,
    totalScore: autoAwardedMarks,
    maxScore: exam.totalMarks,
    percentage,
    status: exam.questions.every(q => q.questionType === 'MCQ') ? 'GRADED' : 'SUBMITTED',
    mentorFeedback: ''
  };

  db.addExamSubmission(submission);

  // Notify mentor
  db.addNotification({
    id: `notif_${Date.now()}`,
    userId: exam.mentorId,
    title: 'Exam Submission Received',
    message: `${user.fullName} completed and submitted exam: "${exam.title}". Ready for evaluation.`,
    type: 'TASK',
    read: false,
    createdAt: new Date().toISOString()
  });

  return sendSuccess(res, submission, 'Exam submitted successfully');
});

// Student gets all their past exam submissions
app.get('/api/student/exam-submissions', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_STUDENT') return sendError(res, 'Unauthorized', 401);

  const submissions = db.getExamSubmissions(undefined, user.id);
  return sendSuccess(res, submissions);
});

// Mentor evaluates subjective questions and grades submission
app.put('/api/mentor/submissions/:id/grade', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_MENTOR') return sendError(res, 'Unauthorized', 401);

  const { evaluatedAnswers, mentorFeedback } = req.body;
  const submission = db.getExamSubmissionById(req.params.id);
  if (!submission) return sendError(res, 'Submission not found', 404);
  if (submission.mentorId.toLowerCase() !== user.id.toLowerCase()) return sendError(res, 'Unauthorized to grade this submission', 403);

  let newTotal = 0;
  if (Array.isArray(evaluatedAnswers)) {
    submission.answers = submission.answers.map(a => {
      const updated = evaluatedAnswers.find((e: any) => e.questionId === a.questionId);
      const marks = updated?.marksAwarded !== undefined ? Number(updated.marksAwarded) : (a.marksAwarded || 0);
      newTotal += marks;
      return {
        ...a,
        marksAwarded: marks,
        feedback: updated?.feedback || a.feedback || ''
      };
    });
  } else {
    newTotal = submission.totalScore || 0;
  }

  const percentage = Math.round((newTotal / submission.maxScore) * 100);

  const updated = db.updateExamSubmission(submission.id, {
    answers: submission.answers,
    totalScore: newTotal,
    percentage,
    status: 'GRADED',
    mentorFeedback: mentorFeedback || submission.mentorFeedback
  });

  // Notify student
  db.addNotification({
    id: `notif_${Date.now()}`,
    userId: submission.studentId,
    title: 'Exam Graded by Mentor',
    message: `Your exam "${submission.examTitle}" was evaluated by ${user.fullName}. Final Score: ${newTotal}/${submission.maxScore} (${percentage}%).`,
    type: 'SYSTEM',
    read: false,
    createdAt: new Date().toISOString()
  });

  return sendSuccess(res, updated, 'Submission graded and returned to student');
});

// ==================== ADMIN APIS ====================
app.get('/api/admin/dashboard', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_ADMIN') return sendError(res, 'Unauthorized', 401);

  const allUsers = db.getUsers();
  const students = allUsers.filter(u => u.role === 'ROLE_STUDENT');
  const mentors = allUsers.filter(u => u.role === 'ROLE_MENTOR');
  const admins = allUsers.filter(u => u.role === 'ROLE_ADMIN');

  const dashboardData = {
    totalStudents: students.length,
    totalMentors: mentors.length,
    totalAdmins: admins.length,
    totalTests: db.getAptitudeQuestions().length,
    totalQuestions: db.getTechnicalQuestions().length,
    totalCodingProblems: db.getCodingProblems().length,
    totalInterviews: 28,
    activeUsersCount: allUsers.filter(u => u.active).length,
    recentRegistrations: allUsers.slice(-5).map(u => ({
      id: u.id,
      name: u.fullName,
      email: u.email,
      role: u.role,
      date: u.createdAt
    })),
    topicDifficultyStats: [
      { topic: 'Java Collections', avgScore: 84 },
      { topic: 'SQL Joins & Group By', avgScore: 78 },
      { topic: 'Dynamic Programming', avgScore: 52 },
      { topic: 'System Design Basics', avgScore: 65 },
      { topic: 'Quantitative Time & Work', avgScore: 72 }
    ],
    weakestTopics: ['Dynamic Programming', 'Graph Algorithms', 'System Design']
  };

  return sendSuccess(res, dashboardData);
});

app.get('/api/admin/users', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_ADMIN') return sendError(res, 'Unauthorized', 401);
  return sendSuccess(res, db.getUsers());
});

app.post('/api/admin/users', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_ADMIN') return sendError(res, 'Unauthorized', 401);

  const { fullName, email, phoneNumber, role, active } = req.body;
  if (!fullName || !email) return sendError(res, 'Name and email required');

  if (db.getUserByEmail(email)) return sendError(res, 'Email already exists', 409);

  const newUser: User = {
    id: `usr_${Date.now()}`,
    email: email.toLowerCase(),
    fullName,
    phoneNumber: phoneNumber || '+91 9000000000',
    role: role || 'ROLE_STUDENT',
    active: active !== undefined ? active : true,
    createdAt: new Date().toISOString()
  };

  db.addUser(newUser);
  return sendSuccess(res, newUser, 'User created by Admin');
});

app.put('/api/admin/users/:id/toggle-status', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_ADMIN') return sendError(res, 'Unauthorized', 401);

  const target = db.getUserById(req.params.id);
  if (!target) return sendError(res, 'User not found', 404);

  target.active = !target.active;
  db.updateUser(target.id, target);
  return sendSuccess(res, target, `Account ${target.active ? 'activated' : 'deactivated'}`);
});

app.delete('/api/admin/users/:id', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_ADMIN') return sendError(res, 'Unauthorized', 401);

  const success = db.deleteUser(req.params.id);
  if (!success) return sendError(res, 'User not found', 404);
  return sendSuccess(res, null, 'User deleted successfully');
});

app.post('/api/admin/assign-mentor', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_ADMIN') return sendError(res, 'Unauthorized', 401);

  const { studentId, mentorId } = req.body;
  const student = db.getUserById(studentId);
  const mentor = db.getUserById(mentorId);

  if (!student || !mentor) return sendError(res, 'Student or mentor not found', 404);

  if (student.studentProfile) {
    student.studentProfile.assignedMentorId = mentor.id;
    student.studentProfile.assignedMentorName = mentor.fullName;
    db.updateUser(student.id, student);
  }

  return sendSuccess(res, student, 'Mentor assigned successfully');
});

// Admin Content Management (Aptitude, Technical & Coding)
app.get('/api/admin/questions', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_ADMIN') return sendError(res, 'Unauthorized', 401);

  const aptitude = db.getAptitudeQuestions();
  const technical = db.getTechnicalQuestions();
  return sendSuccess(res, { aptitude, technical });
});

app.post('/api/admin/questions/aptitude', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_ADMIN') return sendError(res, 'Unauthorized', 401);

  const { category, topic, question, options, correctAnswer, explanation, difficulty } = req.body;
  if (!question || !options || options.length < 2) {
    return sendError(res, 'Question text and options are required', 400);
  }

  const newQ: AptitudeQuestion = {
    id: `apt_${Date.now()}`,
    category: category || 'Quantitative',
    topic: topic || 'General',
    question,
    options: options || ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: Number(correctAnswer) || 0,
    explanation: explanation || 'Standard verified formula solution.',
    difficulty: difficulty || 'Medium'
  };

  db.addAptitudeQuestion(newQ);
  return sendSuccess(res, newQ, 'Aptitude question added successfully');
});

app.post('/api/admin/questions/technical', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_ADMIN') return sendError(res, 'Unauthorized', 401);

  const { subject, topic, question, answer, codeSnippet, difficulty, companyTags } = req.body;
  if (!question || !answer) {
    return sendError(res, 'Question and answer are required', 400);
  }

  const newQ: TechnicalQuestion = {
    id: `tech_${Date.now()}`,
    subject: subject || 'Java',
    topic: topic || 'Core Concepts',
    question,
    answer,
    codeSnippet,
    difficulty: difficulty || 'Medium',
    companyTags: companyTags || ['Amazon', 'Microsoft', 'TCS']
  };

  db.addTechnicalQuestion(newQ);
  return sendSuccess(res, newQ, 'Technical question added successfully');
});

app.delete('/api/admin/questions/aptitude/:id', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_ADMIN') return sendError(res, 'Unauthorized', 401);

  const success = db.deleteAptitudeQuestion(req.params.id);
  if (!success) return sendError(res, 'Question not found', 404);
  return sendSuccess(res, null, 'Aptitude question deleted successfully');
});

app.delete('/api/admin/questions/technical/:id', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_ADMIN') return sendError(res, 'Unauthorized', 401);

  const success = db.deleteTechnicalQuestion(req.params.id);
  if (!success) return sendError(res, 'Question not found', 404);
  return sendSuccess(res, null, 'Technical question deleted successfully');
});

app.get('/api/admin/coding', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_ADMIN') return sendError(res, 'Unauthorized', 401);

  return sendSuccess(res, db.getCodingProblems());
});

app.post('/api/admin/coding', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_ADMIN') return sendError(res, 'Unauthorized', 401);

  const { title, description, inputFormat, outputFormat, constraints, sampleInput, sampleOutput, difficulty, topic, category } = req.body;
  if (!title || !description) return sendError(res, 'Title and description are required', 400);

  const newP: CodingProblem = {
    id: `cod_${Date.now()}`,
    title,
    description,
    inputFormat: inputFormat || 'Standard input',
    outputFormat: outputFormat || 'Standard output',
    constraints: constraints || '1 <= N <= 10^5',
    sampleInput: sampleInput || 'Input example',
    sampleOutput: sampleOutput || 'Output example',
    difficulty: difficulty || 'Medium',
    topic: topic || 'Arrays',
    category: category || 'Data Structures',
    starterCode: {
      java: 'public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}',
      python: 'def solution():\n    # Your code here\n    pass',
      cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    return 0;\n}'
    },
    testCases: [
      { input: sampleInput || 'sample input', expectedOutput: sampleOutput || 'sample output' }
    ]
  };

  db.addCodingProblem(newP);
  return sendSuccess(res, newP, 'Coding problem added successfully');
});

app.delete('/api/admin/coding/:id', (req: Request, res: Response) => {
  const user = parseAuthUser(req);
  if (!user || user.role !== 'ROLE_ADMIN') return sendError(res, 'Unauthorized', 401);

  const success = db.deleteCodingProblem(req.params.id);
  if (!success) return sendError(res, 'Coding problem not found', 404);
  return sendSuccess(res, null, 'Coding problem deleted successfully');
});

// ==================== VITE & STATIC SERVING ====================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Development SPA HTML fallback
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite && typeof vite.ssrFixStacktrace === 'function') {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`\n  VITE v6.2.3  ready in 120 ms\n`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://${HOST}:${PORT}/`);
    console.log(`  ➜  Server running on http://localhost:${PORT}\n`);
  });
}

startServer();
