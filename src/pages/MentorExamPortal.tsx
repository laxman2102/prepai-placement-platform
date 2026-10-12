import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MentorExam, QuestionType, ExamQuestion, StudentExamSubmission } from '../types';
import {
  FileSpreadsheet, Plus, Trash2, CheckCircle2, Clock, Users,
  Award, ChevronRight, ArrowLeft, RefreshCw, AlertCircle, Eye,
  Code2, Check, Radio, FileText, Sparkles, Filter, Calendar,
  BarChart3, CheckSquare, Edit3, Send
} from 'lucide-react';

interface MentorExamPortalProps {
  setActiveTab?: (tab: string) => void;
}

export const MentorExamPortal: React.FC<MentorExamPortalProps> = ({ setActiveTab }) => {
  const { user, token, addToast } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LIVE' | 'SCHEDULED'>('ALL');
  const [currentView, setCurrentView] = useState<'LIST' | 'CREATE' | 'SUBMISSIONS'>('LIST');

  // Selected Exam for Submissions Inspection & Grading
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [submissions, setSubmissions] = useState<StudentExamSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<StudentExamSubmission | null>(null);
  const [gradingMarks, setGradingMarks] = useState<{ [qId: string]: number }>({});
  const [gradingFeedbacks, setGradingFeedbacks] = useState<{ [qId: string]: string }>({});
  const [overallFeedback, setOverallFeedback] = useState<string>('');
  const [isSubmittingGrade, setIsSubmittingGrade] = useState<boolean>(false);

  // New Exam Form State
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [examCategory, setExamCategory] = useState('Campus Placement Readiness');
  const [examType, setExamType] = useState<'LIVE' | 'SCHEDULED'>('SCHEDULED');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 16));
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [targetStudentId, setTargetStudentId] = useState('all');
  const [passingMarks, setPassingMarks] = useState(15);
  const [isPublishingExam, setIsPublishingExam] = useState(false);

  // Questions builder list
  const [questions, setQuestions] = useState<Array<Partial<ExamQuestion>>>([
    {
      id: `q_${Date.now()}_0`,
      questionType: 'MCQ',
      questionText: 'What is the worst-case time complexity of quicksort?',
      marks: 5,
      options: ['O(N log N)', 'O(N^2)', 'O(N)', 'O(log N)'],
      correctOptionIndex: 1,
      explanation: 'When the partition produces unbalanced subproblems (e.g. already sorted array with naive pivot), worst-case is O(N^2).'
    }
  ]);

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const [examRes, studentRes] = await Promise.all([
        fetch('/api/mentor/exams', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/mentor/students', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const examData = await examRes.json();
      const studentData = await studentRes.json();

      if (examData.success && Array.isArray(examData.data)) {
        setExams(examData.data);
      }
      if (studentData.success && Array.isArray(studentData.data)) {
        setAssignedStudents(studentData.data);
      }
    } catch (e) {
      console.error('Failed to load mentor exams:', e);
      addToast('Error fetching exams list', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [token]);

  // Total Marks calculated
  const totalCalculatedMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  // Add Question Helpers
  const addQuestion = (type: QuestionType) => {
    const newId = `q_${Date.now()}_${questions.length}`;
    if (type === 'MCQ') {
      setQuestions([
        ...questions,
        {
          id: newId,
          questionType: 'MCQ',
          questionText: '',
          marks: 5,
          options: ['', '', '', ''],
          correctOptionIndex: 0,
          explanation: ''
        }
      ]);
    } else if (type === 'SHORT_ANSWER') {
      setQuestions([
        ...questions,
        {
          id: newId,
          questionType: 'SHORT_ANSWER',
          questionText: '',
          marks: 5,
          modelAnswer: ''
        }
      ]);
    } else if (type === 'LONG_ANSWER') {
      setQuestions([
        ...questions,
        {
          id: newId,
          questionType: 'LONG_ANSWER',
          questionText: '',
          marks: 10,
          modelAnswer: ''
        }
      ]);
    } else if (type === 'CODING') {
      setQuestions([
        ...questions,
        {
          id: newId,
          questionType: 'CODING',
          questionText: '',
          marks: 15,
          language: 'java',
          starterCode: 'public class Solution {\n    // Write your solution here\n}',
          sampleInput: '',
          sampleOutput: ''
        }
      ]);
    }
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) {
      addToast('An exam must contain at least 1 question', 'error');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, updates: Partial<ExamQuestion>) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], ...updates };
    setQuestions(updated);
  };

  // Submit & Publish Exam
  const handlePublishExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      addToast('Please enter an exam title', 'error');
      return;
    }

    if (questions.length === 0) {
      addToast('Please add at least 1 question', 'error');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText?.trim()) {
        addToast(`Question #${i + 1} prompt cannot be empty`, 'error');
        return;
      }
      if (q.questionType === 'MCQ') {
        const filledOptions = (q.options || []).filter(o => o.trim());
        if (filledOptions.length < 2) {
          addToast(`MCQ Question #${i + 1} must have at least 2 options`, 'error');
          return;
        }
      }
    }

    setIsPublishingExam(true);
    try {
      const res = await fetch('/api/mentor/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: examTitle.trim(),
          description: examDescription.trim(),
          category: examCategory,
          examType,
          scheduledAt: scheduledDate,
          durationMinutes: Number(durationMinutes) || 45,
          targetStudentId,
          passingMarks: Number(passingMarks) || Math.round(totalCalculatedMarks * 0.4),
          questions
        })
      });

      const data = await res.json();
      if (data.success) {
        addToast(`✓ Exam "${examTitle}" published successfully! Assigned students notified.`, 'success');
        // Reset form
        setExamTitle('');
        setExamDescription('');
        setCurrentView('LIST');
        await fetchExams();
      } else {
        addToast(data.message || 'Failed to publish exam', 'error');
      }
    } catch (err) {
      addToast('Network error while publishing exam', 'error');
    } finally {
      setIsPublishingExam(false);
    }
  };

  // Delete Exam
  const handleDeleteExam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam? All student submissions will also be deleted.')) return;
    try {
      const res = await fetch(`/api/mentor/exams/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addToast('Exam deleted successfully', 'success');
        fetchExams();
      } else {
        addToast(data.message || 'Failed to delete exam', 'error');
      }
    } catch (err) {
      addToast('Network error while deleting exam', 'error');
    }
  };

  // Inspect Submissions for Exam
  const handleInspectSubmissions = async (exam: any) => {
    setSelectedExam(exam);
    setCurrentView('SUBMISSIONS');
    try {
      const res = await fetch(`/api/mentor/exams/${exam.id}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSubmissions(data.data);
      }
    } catch (err) {
      addToast('Failed to load submissions for exam', 'error');
    }
  };

  // Open Grading Drawer for Student Submission
  const handleOpenGrading = (sub: StudentExamSubmission) => {
    setSelectedSubmission(sub);
    const marksMap: { [qId: string]: number } = {};
    const feedbackMap: { [qId: string]: string } = {};
    sub.answers.forEach(a => {
      marksMap[a.questionId] = a.marksAwarded || 0;
      feedbackMap[a.questionId] = a.feedback || '';
    });
    setGradingMarks(marksMap);
    setGradingFeedbacks(feedbackMap);
    setOverallFeedback(sub.mentorFeedback || '');
  };

  // Submit Final Grade
  const handleSaveGrading = async () => {
    if (!selectedSubmission) return;
    setIsSubmittingGrade(true);
    try {
      const evaluatedAnswers = selectedSubmission.answers.map(a => ({
        questionId: a.questionId,
        marksAwarded: Number(gradingMarks[a.questionId] ?? a.marksAwarded ?? 0),
        feedback: gradingFeedbacks[a.questionId] || ''
      }));

      const res = await fetch(`/api/mentor/submissions/${selectedSubmission.id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          evaluatedAnswers,
          mentorFeedback: overallFeedback
        })
      });

      const data = await res.json();
      if (data.success) {
        addToast('✓ Submission evaluation saved! Student has been notified.', 'success');
        setSelectedSubmission(null);
        if (selectedExam) {
          handleInspectSubmissions(selectedExam);
        }
        fetchExams();
      } else {
        addToast(data.message || 'Failed to save grade', 'error');
      }
    } catch (err) {
      addToast('Network error saving evaluation', 'error');
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  const filteredExams = exams.filter(e => {
    if (activeFilter === 'ALL') return true;
    return e.examType === activeFilter;
  });

  return (
    <div className="space-y-8 pb-24 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-950 border border-indigo-200 text-[10px] uppercase font-bold tracking-widest mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-700" />
            Mentor Exam Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif italic text-[#1A1A1A]">
            Conduct Student Exams & Assessments
          </h1>
          <p className="text-xs text-[#1A1A1A]/60 mt-1 max-w-2xl">
            Design and conduct <b>Live Exams</b> (real-time test calls) or <b>Scheduled Exams</b> (flexible window, student writes at any time). Choose from MCQs, Short Answers, Long Answers, and Coding challenges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentView !== 'CREATE' ? (
            <button
              onClick={() => setCurrentView('CREATE')}
              className="px-5 py-3 rounded-full bg-[#1A1A1A] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              Conduct New Exam
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('LIST')}
              className="px-5 py-3 rounded-full bg-white hover:bg-[#F0EDE5] border border-[#1A1A1A]/20 text-[#1A1A1A] text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Exam Directory
            </button>
          )}
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#1A1A1A]/10 shadow-sm space-y-1">
          <p className="text-[10px] uppercase font-semibold tracking-wider text-[#1A1A1A]/50">Total Exams</p>
          <p className="text-3xl font-serif font-bold text-[#1A1A1A]">{exams.length}</p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-[#1A1A1A]/10 shadow-sm space-y-1">
          <p className="text-[10px] uppercase font-semibold tracking-wider text-[#1A1A1A]/50">Live Exams</p>
          <p className="text-3xl font-serif font-bold text-rose-700">
            {exams.filter(e => e.examType === 'LIVE').length}
          </p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-[#1A1A1A]/10 shadow-sm space-y-1">
          <p className="text-[10px] uppercase font-semibold tracking-wider text-[#1A1A1A]/50">Scheduled Exams</p>
          <p className="text-3xl font-serif font-bold text-indigo-700">
            {exams.filter(e => e.examType === 'SCHEDULED').length}
          </p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-[#1A1A1A]/10 shadow-sm space-y-1">
          <p className="text-[10px] uppercase font-semibold tracking-wider text-[#1A1A1A]/50">Total Submissions</p>
          <p className="text-3xl font-serif font-bold text-emerald-700">
            {exams.reduce((sum, e) => sum + (e.submissionCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* ===================== VIEW 1: EXAM LIST ===================== */}
      {currentView === 'LIST' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A1A1A]/10 pb-4">
            <div className="flex items-center gap-2">
              {(['ALL', 'LIVE', 'SCHEDULED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all ${
                    activeFilter === tab
                      ? 'bg-[#1A1A1A] text-white'
                      : 'bg-white border border-[#1A1A1A]/15 text-[#1A1A1A]/70 hover:bg-[#F0EDE5]'
                  }`}
                >
                  {tab === 'ALL' ? 'All Exams' : tab === 'LIVE' ? '🔴 Live Exams' : '📝 Scheduled (Anytime)'}
                </button>
              ))}
            </div>

            <button
              onClick={fetchExams}
              className="px-3 py-1.5 rounded-full border border-[#1A1A1A]/20 hover:bg-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {filteredExams.length === 0 ? (
            <div className="p-16 text-center bg-white border border-[#1A1A1A]/15 rounded-3xl space-y-4">
              <FileSpreadsheet className="w-12 h-12 text-[#1A1A1A]/30 mx-auto" />
              <h3 className="text-xl font-serif italic text-[#1A1A1A]">No Exams Found in this Category</h3>
              <p className="text-xs text-[#1A1A1A]/60 max-w-md mx-auto">
                Conduct an exam by clicking the button below. You can create multiple choice, subjective, or coding questions.
              </p>
              <button
                onClick={() => setCurrentView('CREATE')}
                className="px-6 py-3 rounded-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#333]"
              >
                Conduct New Exam Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredExams.map(exam => (
                <div
                  key={exam.id}
                  className="bg-white border border-[#1A1A1A]/15 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          exam.examType === 'LIVE'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        }`}
                      >
                        {exam.examType === 'LIVE' ? '🔴 Live Exam' : '📝 Scheduled Exam (Write Anytime)'}
                      </span>
                      <span className="text-[10px] font-mono text-[#1A1A1A]/50">
                        {exam.durationMinutes} mins
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#1A1A1A] line-clamp-1">{exam.title}</h3>
                      <p className="text-xs text-[#1A1A1A]/60 mt-0.5 line-clamp-2">
                        {exam.description || 'Comprehensive evaluation covering candidate placement preparation.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1A1A1A]/10 text-center">
                      <div className="p-2 rounded-2xl bg-[#F9F7F2]">
                        <p className="text-[10px] uppercase font-bold text-[#1A1A1A]/50">Questions</p>
                        <p className="text-sm font-bold text-[#1A1A1A]">{exam.questions?.length || 0}</p>
                      </div>
                      <div className="p-2 rounded-2xl bg-[#F9F7F2]">
                        <p className="text-[10px] uppercase font-bold text-[#1A1A1A]/50">Total Marks</p>
                        <p className="text-sm font-bold text-[#1A1A1A]">{exam.totalMarks}</p>
                      </div>
                      <div className="p-2 rounded-2xl bg-[#F9F7F2]">
                        <p className="text-[10px] uppercase font-bold text-[#1A1A1A]/50">Submissions</p>
                        <p className="text-sm font-bold text-emerald-700">{exam.submissionCount || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#1A1A1A]/10">
                    <button
                      onClick={() => handleInspectSubmissions(exam)}
                      className="px-4 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Submissions ({exam.submissionCount || 0})
                    </button>

                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="p-2.5 rounded-full text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== VIEW 2: CONDUCT / CREATE EXAM BUILDER ===================== */}
      {currentView === 'CREATE' && (
        <form onSubmit={handlePublishExam} className="space-y-8">
          {/* STEP 1: EXAM METADATA */}
          <div className="bg-white border border-[#1A1A1A]/15 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-[#1A1A1A]/10 pb-4">
              <span className="text-[10px] uppercase tracking-widest text-indigo-700 font-bold">Step 1 of 2</span>
              <h2 className="text-2xl font-serif italic text-[#1A1A1A]">Exam Information & Scheduling</h2>
              <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                Define the exam structure, timing window, and assign either to all mentees or a specific candidate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1.5">
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. Data Structures & System Design Placement Readiness Exam"
                  className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-4 py-3 text-xs text-[#1A1A1A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1.5">
                  Exam Mode / Schedule Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExamType('LIVE')}
                    className={`p-3.5 rounded-2xl text-xs font-bold border transition-all text-left flex flex-col justify-between ${
                      examType === 'LIVE'
                        ? 'bg-rose-50 border-rose-500 text-rose-950 shadow-sm'
                        : 'bg-[#F9F7F2] border-[#1A1A1A]/15 text-[#1A1A1A]/70 hover:bg-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                      Live Exam
                    </span>
                    <span className="text-[10px] font-normal opacity-70 mt-1">Real-time synchronized exam call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExamType('SCHEDULED')}
                    className={`p-3.5 rounded-2xl text-xs font-bold border transition-all text-left flex flex-col justify-between ${
                      examType === 'SCHEDULED'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-sm'
                        : 'bg-[#F9F7F2] border-[#1A1A1A]/15 text-[#1A1A1A]/70 hover:bg-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-indigo-700" />
                      Scheduled Exam
                    </span>
                    <span className="text-[10px] font-normal opacity-70 mt-1">Student can write exam at any time</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1.5">
                  Category / Subject
                </label>
                <select
                  value={examCategory}
                  onChange={(e) => setExamCategory(e.target.value)}
                  className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-4 py-3 text-xs text-[#1A1A1A]"
                >
                  <option value="Campus Placement Readiness">Campus Placement Readiness</option>
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Core CS & Operating Systems">Core CS & Operating Systems</option>
                  <option value="Database Systems & SQL">Database Systems & SQL</option>
                  <option value="System Design & Architecture">System Design & Architecture</option>
                  <option value="Quantitative Aptitude & Logic">Quantitative Aptitude & Logic</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1.5">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-4 py-3 text-xs text-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1.5">
                    Passing Marks
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(Number(e.target.value))}
                    className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-4 py-3 text-xs text-[#1A1A1A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1.5">
                  Target Student Mentee
                </label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-4 py-3 text-xs text-[#1A1A1A]"
                >
                  <option value="all">All Assigned Mentees (Accepted Cohort)</option>
                  {assignedStudents.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.code || 'ST0001'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1.5">
                  Brief Instructions / Description
                </label>
                <textarea
                  rows={2}
                  value={examDescription}
                  onChange={(e) => setExamDescription(e.target.value)}
                  placeholder="Outline topics covered, negative marking guidelines, or compiler expectations..."
                  className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl p-4 text-xs text-[#1A1A1A]"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: QUESTION BUILDER */}
          <div className="bg-white border border-[#1A1A1A]/15 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-indigo-700 font-bold">Step 2 of 2</span>
                <h2 className="text-2xl font-serif italic text-[#1A1A1A]">
                  Choose & Compose Questions ({questions.length})
                </h2>
                <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                  Add questions choosing from <b>MCQs</b>, <b>Short Ans</b>, <b>Long Ans</b>, or <b>Coding</b> problems. Total Calculated Marks: <b>{totalCalculatedMarks}</b>.
                </p>
              </div>

              {/* Action buttons to add types of questions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => addQuestion('MCQ')}
                  className="px-3.5 py-2 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold hover:bg-blue-100 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> + MCQ
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion('SHORT_ANSWER')}
                  className="px-3.5 py-2 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> + Short Ans
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion('LONG_ANSWER')}
                  className="px-3.5 py-2 rounded-full bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold hover:bg-purple-100 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> + Long Ans
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion('CODING')}
                  className="px-3.5 py-2 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> + Coding Problem
                </button>
              </div>
            </div>

            {/* Questions list */}
            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div
                  key={q.id || qIndex}
                  className="border border-[#1A1A1A]/20 bg-[#F9F7F2]/60 rounded-3xl p-5 sm:p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-mono font-bold">
                        {qIndex + 1}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${
                          q.questionType === 'MCQ'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : q.questionType === 'SHORT_ANSWER'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : q.questionType === 'LONG_ANSWER'
                            ? 'bg-purple-100 text-purple-900 border-purple-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {q.questionType === 'MCQ'
                          ? 'Multiple Choice (MCQ)'
                          : q.questionType === 'SHORT_ANSWER'
                          ? 'Short Answer'
                          : q.questionType === 'LONG_ANSWER'
                          ? 'Long Answer'
                          : 'Coding Challenge'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] uppercase font-bold opacity-60">Marks:</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={q.marks || 5}
                          onChange={(e) => updateQuestion(qIndex, { marks: Number(e.target.value) })}
                          className="w-14 bg-white border border-[#1A1A1A]/20 rounded-xl px-2 py-1 text-xs font-mono font-bold text-center"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                      Question Prompt / Problem Statement *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={q.questionText || ''}
                      onChange={(e) => updateQuestion(qIndex, { questionText: e.target.value })}
                      placeholder={
                        q.questionType === 'CODING'
                          ? 'e.g. Write a function to check if a binary tree is a valid Binary Search Tree (BST)...'
                          : 'Write the question statement clearly...'
                      }
                      className="w-full bg-white border border-[#1A1A1A]/20 rounded-2xl p-3.5 text-xs text-[#1A1A1A]"
                    />
                  </div>

                  {/* TYPE SPECIFIC FIELDS: MCQ */}
                  {q.questionType === 'MCQ' && (
                    <div className="space-y-3 pt-2">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/70">
                        Options (Pick the radio button for the correct answer):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(q.options || ['', '', '', '']).map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-2.5 rounded-2xl border transition-all ${
                              q.correctOptionIndex === optIdx
                                ? 'bg-emerald-50 border-emerald-500'
                                : 'bg-white border-[#1A1A1A]/15'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`mcq_correct_${qIndex}`}
                              checked={q.correctOptionIndex === optIdx}
                              onChange={() => updateQuestion(qIndex, { correctOptionIndex: optIdx })}
                              className="accent-emerald-700 w-4 h-4 cursor-pointer"
                            />
                            <span className="text-xs font-mono font-bold opacity-60">
                              {String.fromCharCode(65 + optIdx)}:
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...(q.options || [])];
                                newOpts[optIdx] = e.target.value;
                                updateQuestion(qIndex, { options: newOpts });
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              className="w-full bg-transparent text-xs text-[#1A1A1A] focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                          Explanation / Solution Rationale (Optional)
                        </label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                          placeholder="Why is this option correct? Shown to students after test completion."
                          className="w-full bg-white border border-[#1A1A1A]/20 rounded-2xl px-4 py-2 text-xs text-[#1A1A1A]"
                        />
                      </div>
                    </div>
                  )}

                  {/* TYPE SPECIFIC FIELDS: SHORT & LONG ANSWER */}
                  {(q.questionType === 'SHORT_ANSWER' || q.questionType === 'LONG_ANSWER') && (
                    <div className="pt-2">
                      <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                        Model Answer / Key Evaluation Criteria (For grading guidance)
                      </label>
                      <textarea
                        rows={2}
                        value={q.modelAnswer || ''}
                        onChange={(e) => updateQuestion(qIndex, { modelAnswer: e.target.value })}
                        placeholder="Key concepts or keywords expected in student response..."
                        className="w-full bg-white border border-[#1A1A1A]/20 rounded-2xl p-3 text-xs text-[#1A1A1A]"
                      />
                    </div>
                  )}

                  {/* TYPE SPECIFIC FIELDS: CODING */}
                  {q.questionType === 'CODING' && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                            Programming Language
                          </label>
                          <select
                            value={q.language || 'java'}
                            onChange={(e) => updateQuestion(qIndex, { language: e.target.value })}
                            className="w-full bg-white border border-[#1A1A1A]/20 rounded-2xl px-3 py-2 text-xs text-[#1A1A1A]"
                          >
                            <option value="java">Java</option>
                            <option value="python">Python</option>
                            <option value="cpp">C++</option>
                            <option value="javascript">JavaScript</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                            Sample Input
                          </label>
                          <input
                            type="text"
                            value={q.sampleInput || ''}
                            onChange={(e) => updateQuestion(qIndex, { sampleInput: e.target.value })}
                            placeholder='e.g. root = [2,1,3]'
                            className="w-full bg-white border border-[#1A1A1A]/20 rounded-2xl px-3 py-2 text-xs font-mono text-[#1A1A1A]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                            Sample Output
                          </label>
                          <input
                            type="text"
                            value={q.sampleOutput || ''}
                            onChange={(e) => updateQuestion(qIndex, { sampleOutput: e.target.value })}
                            placeholder='e.g. true'
                            className="w-full bg-white border border-[#1A1A1A]/20 rounded-2xl px-3 py-2 text-xs font-mono text-[#1A1A1A]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                          Starter Code Template
                        </label>
                        <textarea
                          rows={4}
                          value={q.starterCode || ''}
                          onChange={(e) => updateQuestion(qIndex, { starterCode: e.target.value })}
                          className="w-full bg-[#1A1A1A] text-emerald-400 font-mono text-xs rounded-2xl p-3.5 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Publish Button */}
            <div className="pt-6 border-t border-[#1A1A1A]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#1A1A1A]/70">
                Total <b>{questions.length}</b> questions • Total Marks: <b>{totalCalculatedMarks}</b>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentView('LIST')}
                  className="px-6 py-3 rounded-full border border-[#1A1A1A]/20 text-xs font-bold uppercase tracking-wider hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishingExam}
                  className="px-8 py-3.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isPublishingExam ? 'Publishing Exam...' : 'Conduct & Publish Exam'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ===================== VIEW 3: SUBMISSIONS & GRADING ===================== */}
      {currentView === 'SUBMISSIONS' && selectedExam && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4">
            <div>
              <button
                onClick={() => setCurrentView('LIST')}
                className="inline-flex items-center gap-1.5 text-xs text-[#1A1A1A]/60 hover:text-[#1A1A1A] mb-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Exam Directory
              </button>
              <h2 className="text-2xl font-serif italic text-[#1A1A1A]">
                Submissions for: {selectedExam.title}
              </h2>
              <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                Inspect candidate answers and evaluate Short Answer, Long Answer, and Coding solutions.
              </p>
            </div>

            <span className="text-xs font-mono font-bold px-3 py-1 bg-[#1A1A1A] text-white rounded-full">
              {submissions.length} Submissions
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="p-16 text-center bg-white border border-[#1A1A1A]/15 rounded-3xl space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-serif italic text-[#1A1A1A]">No Student Submissions Yet</h3>
              <p className="text-xs text-[#1A1A1A]/60 max-w-md mx-auto">
                Assigned students will write and submit their attempts here. Check back soon or remind mentees in the session schedule.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white border border-[#1A1A1A]/15 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${
                          sub.status === 'GRADED'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {sub.status === 'GRADED' ? 'Graded ✓' : 'Awaiting Mentor Evaluation'}
                      </span>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                        Score: {sub.totalScore} / {sub.maxScore} ({sub.percentage}%)
                      </span>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-[#1A1A1A]">
                      {sub.studentName} ({sub.studentCode || 'ST0001'})
                    </h3>
                    <p className="text-xs text-[#1A1A1A]/60">
                      Submitted on: {new Date(sub.submittedAt).toLocaleString()}
                    </p>

                    {sub.mentorFeedback && (
                      <div className="p-3 rounded-2xl bg-[#F9F7F2] text-xs italic text-[#1A1A1A] mt-2">
                        <span className="font-semibold not-italic block text-[10px] text-emerald-800 uppercase">
                          Mentor Remark:
                        </span>
                        "{sub.mentorFeedback}"
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenGrading(sub)}
                    className="w-full md:w-auto px-6 py-3 rounded-full bg-[#1A1A1A] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-sm shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                    {sub.status === 'GRADED' ? 'Review & Re-grade' : 'Grade Submission'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== GRADING MODAL ===================== */}
      {selectedSubmission && selectedExam && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-[32px] max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#1A1A1A]/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800">
                  Evaluation Sheet
                </span>
                <h3 className="text-2xl font-serif italic text-[#1A1A1A]">
                  Grading: {selectedSubmission.studentName} ({selectedSubmission.studentCode || 'ST0001'})
                </h3>
                <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                  Exam: {selectedSubmission.examTitle}
                </p>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 rounded-full hover:bg-white text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
              >
                ✕
              </button>
            </div>

            {/* Questions Evaluation */}
            <div className="space-y-6">
              {selectedSubmission.answers.map((ans, idx) => {
                const questionMeta = selectedExam.questions?.find((q: any) => q.id === ans.questionId);
                const maxMarks = questionMeta?.marks || 5;

                return (
                  <div
                    key={ans.questionId || idx}
                    className="bg-white border border-[#1A1A1A]/15 rounded-3xl p-6 space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-mono font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#1A1A1A]/5">
                          {ans.questionType}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[10px] uppercase font-bold text-[#1A1A1A]/70">
                          Award Marks (Max {maxMarks}):
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={maxMarks}
                          value={gradingMarks[ans.questionId] ?? ans.marksAwarded ?? 0}
                          onChange={(e) =>
                            setGradingMarks({
                              ...gradingMarks,
                              [ans.questionId]: Number(e.target.value)
                            })
                          }
                          className="w-16 bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-xl px-2 py-1 text-xs font-mono font-bold text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[#1A1A1A]">
                        Question: {questionMeta?.questionText || 'Question prompt'}
                      </p>
                    </div>

                    {/* Student's answer display */}
                    <div className="p-4 rounded-2xl bg-[#F9F7F2] border border-[#1A1A1A]/10 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/60 block">
                        Candidate's Response:
                      </span>

                      {ans.questionType === 'MCQ' && (
                        <div className="text-xs">
                          {ans.selectedOptionIndex !== undefined && questionMeta?.options ? (
                            <p className="font-mono font-bold">
                              Selected: {String.fromCharCode(65 + ans.selectedOptionIndex)} - {questionMeta.options[ans.selectedOptionIndex]}
                            </p>
                          ) : (
                            <p className="italic text-rose-600">No option selected</p>
                          )}
                          <p className="text-[10px] text-emerald-800 font-semibold mt-1">
                            Correct Option: {String.fromCharCode(65 + (questionMeta?.correctOptionIndex || 0))} - {questionMeta?.options?.[questionMeta?.correctOptionIndex || 0]}
                          </p>
                        </div>
                      )}

                      {(ans.questionType === 'SHORT_ANSWER' || ans.questionType === 'LONG_ANSWER') && (
                        <p className="text-xs text-[#1A1A1A] whitespace-pre-wrap leading-relaxed">
                          {ans.answerText || <span className="italic text-rose-500">Unanswered</span>}
                        </p>
                      )}

                      {ans.questionType === 'CODING' && (
                        <pre className="p-3 bg-[#1A1A1A] text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto whitespace-pre-wrap">
                          {ans.codeAnswer || '// No code provided'}
                        </pre>
                      )}
                    </div>

                    {/* Feedback input for this question */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                        Question Feedback / Critique
                      </label>
                      <input
                        type="text"
                        value={gradingFeedbacks[ans.questionId] || ''}
                        onChange={(e) =>
                          setGradingFeedbacks({
                            ...gradingFeedbacks,
                            [ans.questionId]: e.target.value
                          })
                        }
                        placeholder="e.g. Good time complexity analysis, but missing null pointer check."
                        className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-4 py-2 text-xs text-[#1A1A1A]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall Feedback */}
            <div className="bg-white border border-[#1A1A1A]/15 rounded-3xl p-6 space-y-2">
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70">
                Overall Mentor Feedback & Action Points
              </label>
              <textarea
                rows={3}
                value={overallFeedback}
                onChange={(e) => setOverallFeedback(e.target.value)}
                placeholder="Summarize candidate placement readiness, key strengths, and revision targets..."
                className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl p-4 text-xs text-[#1A1A1A]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-6 py-3 rounded-full border border-[#1A1A1A]/20 text-xs font-bold uppercase tracking-wider hover:bg-white"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isSubmittingGrade}
                onClick={handleSaveGrading}
                className="px-8 py-3 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {isSubmittingGrade ? 'Saving Grade...' : 'Submit Evaluation & Notify Mentee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
