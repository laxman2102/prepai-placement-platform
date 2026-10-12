export type UserRole = 'ROLE_STUDENT' | 'ROLE_MENTOR' | 'ROLE_ADMIN';

export interface User {
  id: string;
  code?: string; // Sequential institutional code e.g. ST0001, MT0001
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  password?: string;
  studentProfile?: StudentProfile;
  mentorProfile?: MentorProfile;
  adminProfile?: AdminProfile;
}

export interface OTPVerification {
  email: string;
  otp: string;
  expiresAt: number;
  verified: boolean;
  purpose: 'STUDENT_REGISTRATION' | 'MENTOR_REGISTRATION' | 'LOGIN_OTP';
}

export interface StudentProfile {
  id: string;
  userId: string;
  code?: string; // ST0001
  college: string;
  degree: string;
  branch: string;
  graduationYear: number;
  profileCompletion: number;
  skills: string[];
  assignedMentorId?: string;
  assignedMentorName?: string;
  assignedMentorCode?: string;
  mentorshipStatus?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'NONE';
  targetRole?: string;
  cgpa?: number;
}

export interface MentorProfile {
  id: string;
  userId: string;
  code?: string; // MT0001
  qualification: string;
  specialization: string;
  experienceYears: number;
  professionalProfile: string;
  rating?: number;
  assignedStudentCount?: number;
  company?: string;
  bio?: string;
}

export interface AdminProfile {
  id: string;
  userId: string;
  department: string;
  adminLevel: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

// Aptitude
export type AptitudeCategory = 'Quantitative' | 'Logical Reasoning' | 'Verbal Ability' | 'Data Interpretation';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface AptitudeQuestion {
  id: string;
  category: AptitudeCategory;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed index
  explanation: string;
  difficulty: DifficultyLevel;
}

export interface TestAttempt {
  id: string;
  studentId: string;
  testTitle: string;
  category: AptitudeCategory | 'Full Mock';
  totalQuestions: number;
  correctCount: number;
  score: number; // percentage
  accuracy: number; // percentage
  timeTakenSeconds: number;
  completedAt: string;
  answers: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
  }[];
}

// Coding
export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  difficulty: DifficultyLevel;
  topic: string;
  category: string; // Java, Python, C++, SQL, Data Structures, Algorithms
  starterCode: {
    java?: string;
    python?: string;
    cpp?: string;
    javascript?: string;
    sql?: string;
  };
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }[];
}

export interface AICodeCheckResult {
  hasError: boolean;
  isCompleted: boolean;
  errorTitle?: string;
  errorDescription?: string;
  hints?: string[];
  pedagogicalGuidance?: string;
  testAnalysis?: string;
  passedTestCases?: number;
  totalTestCases?: number;
}

export interface CodingSubmission {
  id: string;
  studentId: string;
  studentName?: string;
  problemId: string;
  problemTitle: string;
  language: string;
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  passedTestCases: number;
  totalTestCases: number;
  executionTimeMs: number;
  submittedAt: string;
}

export interface StudentCodingProgress {
  id: string;
  studentId: string;
  studentName?: string;
  studentCode?: string; // e.g. ST0001
  problemId: string;
  problemTitle: string;
  isCompleted: boolean;
  completedAt?: string;
  lastCode: string;
  lastLanguage: string;
  attemptsCount: number;
  aiCheckLogs?: {
    timestamp: string;
    hasError: boolean;
    errorTitle?: string;
    errorDescription?: string;
  }[];
  mentorFeedback?: string;
  updatedAt: string;
}


// Technical Questions
export interface TechnicalQuestion {
  id: string;
  subject: 'Java' | 'Python' | 'C++' | 'DBMS' | 'Operating Systems' | 'Computer Networks' | 'OOP' | 'Data Structures' | 'Algorithms' | 'SQL';
  topic: string;
  question: string;
  answer: string;
  codeSnippet?: string;
  difficulty: DifficultyLevel;
  companyTags?: string[];
}

export interface QuestionBookmark {
  userId: string;
  questionId: string;
  isCompleted: boolean;
}

// AI Mock Interview
export type InterviewType = 'Technical' | 'HR' | 'Mixed';
export type InterviewLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface InterviewQuestionItem {
  id: string;
  question: string;
  category: string;
  hint?: string;
  studentAnswer?: string;
}

export interface InterviewEvaluation {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  answerQuality: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  recommendedTopics: string[];
}

export interface MockInterview {
  id: string;
  studentId: string;
  interviewType: InterviewType;
  difficulty: InterviewLevel;
  targetRole: string;
  questions: InterviewQuestionItem[];
  evaluation?: InterviewEvaluation;
  status: 'In Progress' | 'Completed';
  createdAt: string;
  completedAt?: string;
}

// Resume Analysis
export interface ResumeAnalysis {
  id: string;
  studentId: string;
  fileName: string;
  resumeScore: number;
  detectedSkills: string[];
  missingSkills: string[];
  formattingSuggestions: string[];
  keywordSuggestions: string[];
  projectSuggestions: string[];
  placementImprovementSuggestions: string[];
  analyzedAt: string;
  summary: string;
}

// Personalized AI Learning Path
export interface LearningWeek {
  weekNumber: number;
  title: string;
  focusArea: string;
  topics: {
    name: string;
    type: 'Aptitude' | 'Coding' | 'Technical' | 'Interview' | 'Resume';
    description: string;
    completed: boolean;
  }[];
}

export interface LearningPath {
  id: string;
  studentId: string;
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  targetRole: string;
  weeks: LearningWeek[];
  generatedAt: string;
}

// Mentoring
export interface MentorTask {
  id: string;
  mentorId: string;
  mentorName: string;
  studentId: string;
  studentName?: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedAt: string;
}

export interface MentorFeedback {
  id: string;
  mentorId: string;
  mentorName: string;
  studentId: string;
  category: 'General' | 'Interview' | 'Coding' | 'Resume';
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface MentorshipRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentCode: string;
  studentCollege?: string;
  studentBranch?: string;
  studentGraduationYear?: number;
  studentTargetRole?: string;
  mentorId: string;
  mentorName: string;
  mentorCode: string;
  mentorSpecialization?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  requestedAt: string;
  respondedAt?: string;
  message?: string;
}

export type SessionType = 'ONE_TO_ONE' | 'GROUP';
export type SessionStatus = 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';

export interface MentoringSession {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorCode?: string;
  sessionType: SessionType; // 'ONE_TO_ONE' or 'GROUP'
  studentId?: string; // For 1-on-1: specific student; For GROUP: 'all'
  studentName?: string;
  studentCode?: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string;
  status: SessionStatus;
  notes?: string;
  createdAt?: string;
}

// Exam System
export type ExamType = 'LIVE' | 'SCHEDULED';
export type QuestionType = 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'CODING';

export interface ExamQuestion {
  id: string;
  questionType: QuestionType;
  questionText: string;
  marks: number;
  // For MCQ
  options?: string[];
  correctOptionIndex?: number;
  explanation?: string;
  // For Short & Long Answer
  modelAnswer?: string;
  // For Coding
  starterCode?: string;
  language?: string;
  sampleInput?: string;
  sampleOutput?: string;
}

export interface MentorExam {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorCode?: string;
  targetStudentId?: string; // 'all' or specific student id
  targetStudentName?: string;
  title: string;
  description?: string;
  category?: string;
  examType: ExamType; // 'LIVE' | 'SCHEDULED'
  scheduledAt?: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  questions: ExamQuestion[];
  createdAt: string;
}

export interface StudentExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentCode?: string;
  mentorId: string;
  startedAt: string;
  submittedAt: string;
  answers: {
    questionId: string;
    questionType: QuestionType;
    selectedOptionIndex?: number;
    answerText?: string;
    codeAnswer?: string;
    marksAwarded?: number;
    feedback?: string;
  }[];
  totalScore?: number;
  maxScore: number;
  percentage?: number;
  status: 'SUBMITTED' | 'GRADED';
  mentorFeedback?: string;
}

export interface UploadedNote {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorCode?: string;
  targetStudentId?: string; // 'all' or student userId
  targetStudentName?: string;
  targetStudentCode?: string;
  title: string;
  description?: string;
  topicCategory: string; // 'Lecture Notes' | 'Presentation (PPT)' | 'PDF Reference' | 'Code Samples' | 'Interview Questions' | 'Other'
  fileName: string;
  fileType: string; // 'pdf' | 'ppt' | 'pptx' | 'doc' | 'docx' | 'txt' | 'zip' | 'code' | 'other'
  fileSize: string;
  fileDataUrl?: string; // base64 or download string
  uploadedAt: string;
}

// Student Submissions and Mentor Approvals with Voice Notes
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REVISION_REQUESTED';
export type SubmissionItemType = 'MOCK_INTERVIEW' | 'CODING_LAB' | 'APTITUDE_TEST' | 'PROJECT_REVIEW';

export interface MentorApprovalItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  mentorId?: string;
  mentorName?: string;
  itemType: SubmissionItemType;
  title: string;
  submittedAt: string;
  status: ApprovalStatus;
  reviewedAt?: string;
  details: {
    score?: number;
    interviewType?: string;
    targetRole?: string;
    questionsAndAnswers?: {
      question: string;
      studentAnswer: string;
      category?: string;
    }[];
    questions?: any[];
    evaluationSummary?: string;
    problemTitle?: string;
    language?: string;
    code?: string;
    testCasesPassed?: string;
    category?: string;
    correctCount?: number;
    totalQuestions?: number;
    accuracy?: number;
    problemId?: string;
    interviewId?: string;
    studentNotes?: string;
    submittedTimestamp?: string;
    [key: string]: any;
  };
  mentorNotes?: string;
  mentorVoiceNoteUrl?: string;
  mentorVoiceDuration?: number;
}

// Gamification & Badges
export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  progressPercentage: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'TASK' | 'TEST' | 'SESSION' | 'FEEDBACK' | 'AI' | 'ACHIEVEMENT' | 'SYSTEM';
  read: boolean;
  createdAt: string;
}

// Dashboard Summaries
export interface PlacementReadinessScore {
  overall: number;
  aptitude: number;
  coding: number;
  technical: number;
  communication: number;
  interview: number;
  resume: number;
}

export interface StudentDashboardData {
  profile: StudentProfile;
  readinessScore: PlacementReadinessScore;
  totalAptitudeTests: number;
  totalCodingSolved: number;
  totalInterviews: number;
  currentStreakDays: number;
  assignedMentor?: {
    name: string;
    email: string;
    qualification: string;
    specialization: string;
  };
  recentActivities: {
    id: string;
    type: string;
    title: string;
    score?: number;
    date: string;
  }[];
  upcomingSessions: MentoringSession[];
  pendingTasks: MentorTask[];
  achievements: Achievement[];
}

export interface MentorDashboardData {
  mentorProfile: MentorProfile;
  totalStudents: number;
  activeStudents: number;
  completedTasksCount: number;
  pendingTasksCount: number;
  averageStudentScore: number;
  upcomingSessions: MentoringSession[];
  assignedStudents: {
    studentId: string;
    userId: string;
    name: string;
    email: string;
    college: string;
    branch: string;
    gradYear: number;
    readinessScore: number;
    codingSolved: number;
    testsTaken: number;
  }[];
}

export interface AdminDashboardData {
  totalStudents: number;
  totalMentors: number;
  totalAdmins: number;
  totalTests: number;
  totalQuestions: number;
  totalCodingProblems: number;
  totalInterviews: number;
  activeUsersCount: number;
  recentRegistrations: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    date: string;
  }[];
  topicDifficultyStats: {
    topic: string;
    avgScore: number;
  }[];
  weakestTopics: string[];
}
