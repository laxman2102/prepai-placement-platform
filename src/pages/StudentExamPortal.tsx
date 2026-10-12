import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MentorExam, StudentExamSubmission } from '../types';
import {
  FileSpreadsheet, Clock, CheckCircle2, AlertCircle, Play,
  ChevronRight, ArrowLeft, RefreshCw, Code2, Award, FileText,
  Radio, Check, Sparkles, Filter, Calendar, HelpCircle, Eye,
  Send, ShieldAlert, BookOpen
} from 'lucide-react';

interface StudentExamPortalProps {
  setActiveTab?: (tab: string) => void;
}

export const StudentExamPortal: React.FC<StudentExamPortalProps> = ({ setActiveTab }) => {
  const { user, token, addToast } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<StudentExamSubmission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LIVE' | 'SCHEDULED'>('ALL');
  const [currentTab, setCurrentTab] = useState<'AVAILABLE' | 'SUBMISSIONS'>('AVAILABLE');

  // Taking Exam State
  const [activeExam, setActiveExam] = useState<MentorExam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [examAnswers, setExamAnswers] = useState<{
    [qId: string]: {
      selectedOptionIndex?: number;
      answerText?: string;
      codeAnswer?: string;
    }
  }>({});
  const [examStartedAt, setExamStartedAt] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Reviewing a past submission
  const [viewingSubmission, setViewingSubmission] = useState<StudentExamSubmission | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [examRes, subRes] = await Promise.all([
        fetch('/api/student/exams', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/student/exam-submissions', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const examData = await examRes.json();
      const subData = await subRes.json();

      if (examData.success && Array.isArray(examData.data)) {
        setExams(examData.data);
      }
      if (subData.success && Array.isArray(subData.data)) {
        setSubmissions(subData.data);
      }
    } catch (e) {
      console.error('Failed to load student exams:', e);
      addToast('Error loading exams', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Handle Starting an Exam
  const handleStartExam = (exam: MentorExam) => {
    setActiveExam(exam);
    setCurrentQuestionIndex(0);
    const initialAnswers: any = {};
    exam.questions.forEach(q => {
      initialAnswers[q.id] = {
        selectedOptionIndex: undefined,
        answerText: '',
        codeAnswer: q.starterCode || ''
      };
    });
    setExamAnswers(initialAnswers);
    setExamStartedAt(new Date().toISOString());
    setSecondsRemaining((exam.durationMinutes || 45) * 60);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (!activeExam) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          addToast('Time has expired! Submitting your exam attempt automatically...', 'warning');
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeExam]);

  const handleAutoSubmit = () => {
    submitExamAttempt(true);
  };

  // Submit Exam
  const submitExamAttempt = async (isAuto = false) => {
    if (!activeExam) return;
    if (!isAuto && !confirm('Are you sure you want to finish and submit your exam?')) return;

    setIsSubmitting(true);
    try {
      const formattedAnswers = activeExam.questions.map(q => {
        const studentAns = examAnswers[q.id] || {};
        return {
          questionId: q.id,
          questionType: q.questionType,
          selectedOptionIndex: studentAns.selectedOptionIndex,
          answerText: studentAns.answerText || '',
          codeAnswer: studentAns.codeAnswer || ''
        };
      });

      const res = await fetch(`/api/student/exams/${activeExam.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          startedAt: examStartedAt,
          answers: formattedAnswers
        })
      });

      const data = await res.json();
      if (data.success) {
        if (timerRef.current) clearInterval(timerRef.current);
        setActiveExam(null);
        addToast(
          `✓ Exam submitted successfully! Score: ${data.data.totalScore}/${data.data.maxScore} (${data.data.percentage}%).`,
          'success'
        );
        await fetchData();
        setCurrentTab('SUBMISSIONS');
      } else {
        addToast(data.message || 'Failed to submit exam', 'error');
      }
    } catch (err) {
      addToast('Network error submitting exam', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredExams = exams.filter(e => {
    if (activeFilter === 'ALL') return true;
    return e.examType === activeFilter;
  });

  return (
    <div className="space-y-8 pb-24 max-w-6xl mx-auto">
      {/* ===================== ACTIVE EXAM TEST RUNNER ===================== */}
      {activeExam ? (
        <div className="bg-white border-2 border-[#1A1A1A] rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header Bar with Countdown Timer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${
                  activeExam.examType === 'LIVE'
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                }`}>
                  {activeExam.examType === 'LIVE' ? '🔴 Live Exam in Progress' : '📝 Scheduled Exam Attempt'}
                </span>
                <span className="text-xs text-[#1A1A1A]/60">
                  Mentor: <b>{activeExam.mentorName}</b>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif italic text-[#1A1A1A] mt-1">
                {activeExam.title}
              </h2>
            </div>

            {/* Timer Badge */}
            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border font-mono font-bold text-sm shrink-0 ${
              secondsRemaining < 300
                ? 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                : 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
            }`}>
              <Clock className="w-4 h-4" />
              <span>Time Remaining: {formatTimer(secondsRemaining)}</span>
            </div>
          </div>

          {/* Question Palette Navigation */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10">
            <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/60 mr-2">Questions:</span>
            {activeExam.questions.map((q, idx) => {
              const currentAns = examAnswers[q.id];
              const isAnswered =
                (q.questionType === 'MCQ' && currentAns?.selectedOptionIndex !== undefined) ||
                (q.questionType !== 'MCQ' && (currentAns?.answerText?.trim() || currentAns?.codeAnswer?.trim()));

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all ${
                    currentQuestionIndex === idx
                      ? 'bg-[#1A1A1A] text-white ring-2 ring-emerald-500 scale-105'
                      : isAnswered
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-[#1A1A1A]/20 text-[#1A1A1A]/70 hover:bg-[#EAE6DE]'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Current Question View */}
          {activeExam.questions[currentQuestionIndex] && (() => {
            const currentQ = activeExam.questions[currentQuestionIndex];
            const currentAns = examAnswers[currentQ.id] || {};

            return (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[#F9F7F2] border border-[#1A1A1A]/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
                    <span className="text-xs font-bold text-[#1A1A1A]/60">
                      Question {currentQuestionIndex + 1} of {activeExam.questions.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-white border border-[#1A1A1A]/15">
                        {currentQ.questionType}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-800">
                        {currentQ.marks} Marks
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#1A1A1A] leading-relaxed">
                    {currentQ.questionText}
                  </h3>

                  {/* MCQ OPTION SELECTION */}
                  {currentQ.questionType === 'MCQ' && (
                    <div className="grid grid-cols-1 gap-3 pt-2">
                      {(currentQ.options || []).map((opt, optIdx) => (
                        <button
                          type="button"
                          key={optIdx}
                          onClick={() => {
                            setExamAnswers({
                              ...examAnswers,
                              [currentQ.id]: {
                                ...currentAns,
                                selectedOptionIndex: optIdx
                              }
                            });
                          }}
                          className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                            currentAns.selectedOptionIndex === optIdx
                              ? 'bg-emerald-100/70 border-emerald-600 text-[#1A1A1A] shadow-sm'
                              : 'bg-white border-[#1A1A1A]/15 hover:border-[#1A1A1A]/40'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border font-mono text-xs font-bold ${
                            currentAns.selectedOptionIndex === optIdx
                              ? 'border-emerald-700 bg-emerald-700 text-white'
                              : 'border-[#1A1A1A]/30 text-[#1A1A1A]'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <span className="text-xs font-semibold text-[#1A1A1A]">{opt}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* SHORT & LONG ANSWER TEXTAREA */}
                  {(currentQ.questionType === 'SHORT_ANSWER' || currentQ.questionType === 'LONG_ANSWER') && (
                    <div className="space-y-2 pt-2">
                      <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70">
                        Your Detailed Written Response:
                      </label>
                      <textarea
                        rows={currentQ.questionType === 'SHORT_ANSWER' ? 4 : 8}
                        value={currentAns.answerText || ''}
                        onChange={(e) => {
                          setExamAnswers({
                            ...examAnswers,
                            [currentQ.id]: {
                              ...currentAns,
                              answerText: e.target.value
                            }
                          });
                        }}
                        placeholder="Type your structured technical answer here..."
                        className="w-full bg-white border border-[#1A1A1A]/20 rounded-2xl p-4 text-xs text-[#1A1A1A] leading-relaxed focus:outline-none focus:border-[#1A1A1A]"
                      />
                    </div>
                  )}

                  {/* CODING PROBLEM EDITOR */}
                  {currentQ.questionType === 'CODING' && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs text-[#1A1A1A]/70">
                        <span className="font-mono uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-white border">
                          Language: {currentQ.language || 'Java'}
                        </span>
                        {currentQ.sampleInput && (
                          <span className="font-mono text-[11px]">
                            Sample Input: <code>{currentQ.sampleInput}</code> → Output: <code>{currentQ.sampleOutput}</code>
                          </span>
                        )}
                      </div>

                      <textarea
                        rows={10}
                        value={currentAns.codeAnswer || ''}
                        onChange={(e) => {
                          setExamAnswers({
                            ...examAnswers,
                            [currentQ.id]: {
                              ...currentAns,
                              codeAnswer: e.target.value
                            }
                          });
                        }}
                        placeholder="// Write your code solution here..."
                        className="w-full bg-[#1A1A1A] text-emerald-400 font-mono text-xs rounded-2xl p-4 leading-relaxed focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Bottom Pagination & Submit */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1A1A1A]/10">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                      className="px-4 py-2.5 rounded-full border border-[#1A1A1A]/20 hover:bg-[#F9F7F2] text-xs font-bold disabled:opacity-30"
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentQuestionIndex === activeExam.questions.length - 1}
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(activeExam.questions.length - 1, prev + 1))}
                      className="px-4 py-2.5 rounded-full border border-[#1A1A1A]/20 hover:bg-[#F9F7F2] text-xs font-bold disabled:opacity-30"
                    >
                      Next →
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => submitExamAttempt(false)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Submitting Attempt...' : 'Finish & Submit Exam'}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        /* ===================== EXAM DIRECTORY (AVAILABLE & PAST) ===================== */
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-950 border border-indigo-200 text-[10px] uppercase font-bold tracking-widest mb-2">
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-700" />
                Examinations & Assessments
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif italic text-[#1A1A1A]">
                Mentor Conducted Exams
              </h1>
              <p className="text-xs text-[#1A1A1A]/60 mt-1 max-w-2xl">
                Take official examinations published by your faculty mentor. Access <b>Live Exams</b> (conducted during live slots) or <b>Scheduled Exams</b> that you can write at any time at your convenience.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTab('AVAILABLE')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  currentTab === 'AVAILABLE'
                    ? 'bg-[#1A1A1A] text-white shadow-sm'
                    : 'bg-white border border-[#1A1A1A]/20 text-[#1A1A1A]/70 hover:bg-[#F0EDE5]'
                }`}
              >
                Available Exams ({exams.length})
              </button>
              <button
                onClick={() => setCurrentTab('SUBMISSIONS')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  currentTab === 'SUBMISSIONS'
                    ? 'bg-[#1A1A1A] text-white shadow-sm'
                    : 'bg-white border border-[#1A1A1A]/20 text-[#1A1A1A]/70 hover:bg-[#F0EDE5]'
                }`}
              >
                My Submissions ({submissions.length})
              </button>
            </div>
          </div>

          {/* TAB 1: AVAILABLE EXAMS */}
          {currentTab === 'AVAILABLE' && (
            <div className="space-y-6">
              {/* Category Filter */}
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
                      {tab === 'ALL' ? 'All Exams' : tab === 'LIVE' ? '🔴 Live Exams' : '📝 Scheduled (Write Anytime)'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={fetchData}
                  className="px-3 py-1.5 rounded-full border border-[#1A1A1A]/20 hover:bg-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {filteredExams.length === 0 ? (
                <div className="p-16 text-center bg-white border border-[#1A1A1A]/15 rounded-3xl space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-lg font-serif italic text-[#1A1A1A]">No Exams Currently Assigned</h3>
                  <p className="text-xs text-[#1A1A1A]/60 max-w-md mx-auto">
                    When your mentor conducts a Live or Scheduled exam, it will appear here instantly.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredExams.map(exam => {
                    const hasSubmitted = !!exam.hasSubmitted;
                    const sub = exam.submission;

                    return (
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
                            <span className="text-xs font-mono font-bold text-[#1A1A1A]/60">
                              {exam.durationMinutes} mins
                            </span>
                          </div>

                          <div>
                            <h3 className="text-xl font-serif font-bold text-[#1A1A1A] line-clamp-1">
                              {exam.title}
                            </h3>
                            <p className="text-xs text-[#1A1A1A]/60 mt-0.5 line-clamp-2">
                              {exam.description || 'Comprehensive evaluation covering candidate placement preparation.'}
                            </p>
                            <p className="text-[11px] text-[#1A1A1A]/70 mt-2">
                              Conducted by: <b>{exam.mentorName}</b> ({exam.mentorCode || 'MT0001'})
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
                              <p className="text-[10px] uppercase font-bold text-[#1A1A1A]/50">Passing</p>
                              <p className="text-sm font-bold text-emerald-800">{exam.passingMarks}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#1A1A1A]/10">
                          {hasSubmitted ? (
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-800 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Submitted ({sub?.percentage}%)
                              </span>
                              <button
                                onClick={() => setViewingSubmission(sub)}
                                className="px-4 py-2 rounded-full border border-[#1A1A1A]/20 hover:bg-[#F9F7F2] text-xs font-bold inline-flex items-center gap-1"
                              >
                                View Results <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartExam(exam)}
                              className="w-full py-3 rounded-full bg-[#1A1A1A] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-md"
                            >
                              <Play className="w-3.5 h-3.5 text-emerald-400" />
                              {exam.examType === 'LIVE' ? 'Start Live Exam Now' : 'Write Exam (Anytime)'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY PAST SUBMISSIONS */}
          {currentTab === 'SUBMISSIONS' && (
            <div className="space-y-6">
              {submissions.length === 0 ? (
                <div className="p-16 text-center bg-white border border-[#1A1A1A]/15 rounded-3xl space-y-3">
                  <FileSpreadsheet className="w-10 h-10 text-[#1A1A1A]/30 mx-auto" />
                  <h3 className="text-lg font-serif italic text-[#1A1A1A]">No Exam Attempts Recorded</h3>
                  <p className="text-xs text-[#1A1A1A]/60 max-w-md mx-auto">
                    You haven't submitted any exams yet. Head to "Available Exams" to start your first evaluation.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {submissions.map(sub => (
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
                            {sub.status === 'GRADED' ? 'Evaluated by Mentor ✓' : 'Submitted (Awaiting Mentor Review)'}
                          </span>
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                            Score: {sub.totalScore} / {sub.maxScore} ({sub.percentage}%)
                          </span>
                        </div>

                        <h3 className="text-xl font-serif font-bold text-[#1A1A1A]">{sub.examTitle}</h3>
                        <p className="text-xs text-[#1A1A1A]/60">
                          Submitted: {new Date(sub.submittedAt).toLocaleString()}
                        </p>

                        {sub.mentorFeedback && (
                          <div className="p-3 rounded-2xl bg-[#F9F7F2] text-xs italic text-[#1A1A1A] mt-2 border border-[#1A1A1A]/10">
                            <span className="font-semibold not-italic block text-[10px] text-emerald-800 uppercase">
                              Mentor Feedback:
                            </span>
                            "{sub.mentorFeedback}"
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setViewingSubmission(sub)}
                        className="px-6 py-3 rounded-full bg-[#1A1A1A] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        Inspect Responses
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ===================== VIEW SUBMISSION DETAILS MODAL ===================== */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-[32px] max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#1A1A1A]/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800">
                  Attempt Sheet
                </span>
                <h3 className="text-2xl font-serif italic text-[#1A1A1A]">
                  {viewingSubmission.examTitle}
                </h3>
                <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                  Final Score: <b>{viewingSubmission.totalScore} / {viewingSubmission.maxScore} ({viewingSubmission.percentage}%)</b>
                </p>
              </div>

              <button
                onClick={() => setViewingSubmission(null)}
                className="p-2 rounded-full hover:bg-white text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {viewingSubmission.answers.map((ans, idx) => (
                <div key={idx} className="bg-white border border-[#1A1A1A]/15 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2">
                    <span className="text-xs font-bold text-[#1A1A1A]/70">
                      Question {idx + 1} ({ans.questionType})
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-800">
                      Marks: {ans.marksAwarded ?? 0}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F9F7F2] text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 block mb-1">
                      Your Answer:
                    </span>
                    {ans.questionType === 'MCQ' && (
                      <p className="font-mono font-bold">
                        Selected Option: {ans.selectedOptionIndex !== undefined ? String.fromCharCode(65 + ans.selectedOptionIndex) : 'None'}
                      </p>
                    )}
                    {(ans.questionType === 'SHORT_ANSWER' || ans.questionType === 'LONG_ANSWER') && (
                      <p className="whitespace-pre-wrap">{ans.answerText || 'No answer provided'}</p>
                    )}
                    {ans.questionType === 'CODING' && (
                      <pre className="p-2 bg-[#1A1A1A] text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto">
                        {ans.codeAnswer || '// No code'}
                      </pre>
                    )}
                  </div>

                  {ans.feedback && (
                    <div className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                      <span className="font-bold block text-[10px] uppercase">Mentor Comment:</span>
                      {ans.feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingSubmission(null)}
                className="px-6 py-2.5 rounded-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
