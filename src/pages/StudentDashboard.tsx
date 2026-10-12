import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StudentDashboardData } from '../types';
import { ArrowUpRight, BookOpen, Brain, Code, Bot, Calendar, MessageSquare, Award, CheckCircle2, Clock, Volume2, FolderArchive, HardDrive, FileSpreadsheet } from 'lucide-react';

interface StudentDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ setActiveTab }) => {
  const { user, token } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [approvalsCount, setApprovalsCount] = useState<{ approved: number; pending: number }>({ approved: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, apprRes] = await Promise.all([
          fetch('/api/student/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/approvals', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const result = await dashRes.json();
        if (result.success) {
          setData(result.data);
        }

        const apprData = await apprRes.json();
        if (apprData.success && Array.isArray(apprData.data)) {
          const approved = apprData.data.filter((a: any) => a.status === 'APPROVED').length;
          const pending = apprData.data.filter((a: any) => a.status === 'PENDING').length;
          setApprovalsCount({ approved, pending });
        }
      } catch (e) {
        console.error('Failed to load dashboard:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const studentName = user?.fullName || 'Student';
  const readiness = data?.readinessScore?.overall || 0;
  const codingSolved = data?.totalCodingSolved || 0;
  const streak = data?.currentStreakDays || 0;
  const targetRole = data?.profile?.targetRole || user?.profile?.targetRole || 'Select Target Career Role in Profile';

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-[#1A1A1A]/10 pb-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <p className="text-[11px] uppercase tracking-[0.25em] opacity-40 font-semibold">Editorial Placement Overview</p>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1A1A1A] text-amber-300 font-mono text-[10px] font-bold tracking-wider shadow-xs">
              <HardDrive className="w-3 h-3 text-amber-400" />
              Student ID: {user?.code || 'ST0001'}
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-light leading-none font-serif text-[#1A1A1A]">
            {getTimeGreeting()}, <br />
            <span className="italic font-normal">{studentName}</span>
          </h1>
        </div>

        <div className="text-left md:text-right">
          <p className="text-[11px] uppercase tracking-[0.2em] opacity-40 mb-1 font-semibold">Target Career Role</p>
          <p className="text-xl font-serif italic border-b border-[#1A1A1A] pb-1 inline-block text-[#1A1A1A]">
            {targetRole}
          </p>
        </div>
      </header>

      {/* Main Grid Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-10">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="border-t border-[#1A1A1A] pt-4">
              <p className="text-[11px] uppercase tracking-[0.2em] opacity-40 mb-2 font-semibold">Coding Solved</p>
              <p className="text-3xl font-light font-serif text-[#1A1A1A]">
                {data?.totalCodingSolved || 18} <span className="text-lg opacity-40">/ 50</span>
              </p>
              <div className="mt-4 h-[2px] w-full bg-[#1A1A1A]/10">
                <div
                  className="h-full bg-[#1A1A1A]"
                  style={{ width: `${Math.min(100, ((data?.totalCodingSolved || 18) / 50) * 100)}%` }}
                />
              </div>
            </div>

            <div className="border-t border-[#1A1A1A] pt-4">
              <p className="text-[11px] uppercase tracking-[0.2em] opacity-40 mb-2 font-semibold">Aptitude Score</p>
              <p className="text-3xl font-light font-serif text-[#1A1A1A]">
                {data?.readinessScore?.aptitude || 82}<span className="text-lg opacity-40">%</span>
              </p>
              <p className="text-[10px] mt-2 italic text-emerald-800 font-semibold tracking-wide">+4.2% from last week</p>
            </div>

            <div className="border-t border-[#1A1A1A] pt-4 col-span-2 sm:col-span-1">
              <p className="text-[11px] uppercase tracking-[0.2em] opacity-40 mb-2 font-semibold">Current Streak</p>
              <p className="text-3xl font-light font-serif text-[#1A1A1A]">
                {data?.currentStreakDays || 5} <span className="text-lg opacity-40">Days</span>
              </p>
              <p className="text-[10px] mt-2 italic text-[#1A1A1A]/60 font-semibold">Daily practice active</p>
            </div>
          </div>

          {/* AI Banner Card */}
          <div className="bg-[#1A1A1A] text-[#F9F7F2] p-8 sm:p-10 rounded-[40px] flex flex-col sm:flex-row items-start sm:items-center justify-between relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-md">
              <p className="text-[11px] uppercase tracking-[0.2em] opacity-60 mb-2 font-semibold">Next Recommended Focus</p>
              <h3 className="text-3xl sm:text-4xl font-serif italic mb-6 text-white leading-tight">
                Dynamic Programming <br />& SQL Optimization
              </h3>
              <button
                onClick={() => setActiveTab('coding')}
                className="bg-[#F9F7F2] text-[#1A1A1A] px-7 py-3 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-white transition-all shadow-md"
              >
                Launch Practice Lab
              </button>
            </div>
            <div className="text-[140px] font-serif italic opacity-10 leading-none absolute -right-6 -bottom-6 select-none pointer-events-none text-[#F9F7F2]">
              01
            </div>
          </div>

          {/* Recent Assessments List */}
          <div className="border-t border-[#1A1A1A]/20 pt-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[11px] uppercase tracking-[0.2em] opacity-40 font-semibold">Recent Assessment Logs</h4>
              <button
                onClick={() => setActiveTab('aptitude')}
                className="text-xs font-serif italic underline hover:opacity-70 text-[#1A1A1A]"
              >
                View all tests
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-[#1A1A1A]/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                  <span className="font-serif italic text-base text-[#1A1A1A]">Quantitative Aptitude Mock #02</span>
                </div>
                <span className="font-bold text-[#1A1A1A]">85%</span>
              </div>

              <div className="flex justify-between items-center text-sm border-b border-[#1A1A1A]/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                  <span className="font-serif italic text-base text-[#1A1A1A]">Coding Lab: Two Sum & Binary Trees</span>
                </div>
                <span className="font-semibold text-emerald-800 italic">Passed (2/2)</span>
              </div>

              <div className="flex justify-between items-center text-sm border-b border-[#1A1A1A]/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                  <span className="font-serif italic text-base text-[#1A1A1A]">ATS Resume Insight Audit</span>
                </div>
                <span className="font-bold text-[#1A1A1A]">Score: 82</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-8">
          {/* Readiness Gauge */}
          <div className="border border-[#1A1A1A] p-8 flex flex-col items-center justify-center text-center rounded-[32px] bg-[#F9F7F2]">
            <p className="text-[11px] uppercase tracking-[0.2em] opacity-40 mb-6 font-semibold">Placement Readiness</p>

            <div className="relative w-44 h-44 flex items-center justify-center mb-6">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#1A1A1A"
                  strokeWidth="0.5"
                  strokeDasharray="4 2"
                  opacity="0.2"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#1A1A1A"
                  strokeWidth="3.5"
                  strokeDasharray="282.7"
                  strokeDashoffset={282.7 - (282.7 * readiness) / 100}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              </svg>
              <span className="text-6xl font-light italic font-serif text-[#1A1A1A]">{readiness}</span>
            </div>

            <p className="text-xs leading-relaxed opacity-70">
              You are in the <span className="font-bold italic text-[#1A1A1A]">Top 8%</span> of candidate applicants for Tier-1 technology companies.
            </p>
          </div>

          {/* Mentor Approval Status Card */}
          <div className="border border-[#1A1A1A] bg-white p-6 rounded-[28px] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.2em] opacity-50 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Mentor Approvals
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                {approvalsCount.approved} Approved ✓
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10">
                <span className="text-[10px] uppercase tracking-wider opacity-50 block">Green Tick Verified</span>
                <span className="text-2xl font-serif italic text-emerald-800 font-bold">{approvalsCount.approved}</span>
              </div>
              <div className="p-3 bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10">
                <span className="text-[10px] uppercase tracking-wider opacity-50 block">Pending Review</span>
                <span className="text-2xl font-serif italic text-amber-800 font-bold">{approvalsCount.pending}</span>
              </div>
            </div>

            <p className="text-xs text-[#1A1A1A]/70 leading-relaxed italic">
              Attend live 1-on-1 calls and group masterclasses scheduled by your mentor, or review task approvals.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('mentor-sessions')}
                id="btn-view-mentor-sessions"
                className="flex-1 bg-[#1A1A1A] text-[#F9F7F2] py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-[#333] transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Mentor Sessions
              </button>
              <button
                onClick={() => setActiveTab('exams')}
                id="btn-view-mentor-exams"
                className="flex-1 bg-white border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A] py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                Exams
              </button>
            </div>
          </div>

          {/* Assigned Mentor Box */}
          <div className="bg-[#F0EDE5] border border-[#1A1A1A]/15 p-6 rounded-[28px] space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-[11px] uppercase tracking-[0.2em] opacity-40 font-semibold">Assigned Campus Mentor</h5>
              <span className="text-[10px] font-mono font-bold bg-[#1A1A1A]/10 text-[#1A1A1A] px-2 py-0.5 rounded-full">
                Code: {data?.assignedMentor?.code || 'MT0001'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-serif italic text-xl border border-[#1A1A1A]/20 shrink-0 text-[#1A1A1A]">
                {data?.assignedMentor?.name ? data.assignedMentor.name.charAt(0) : 'L'}
              </div>
              <div>
                <p className="font-bold text-sm text-[#1A1A1A] font-serif italic">{data?.assignedMentor?.name || 'addepalli laxman'}</p>
                <p className="text-[10px] opacity-60 uppercase tracking-wider">{data?.assignedMentor?.specialization || 'AIML Lead'}</p>
              </div>
            </div>

            {/* Drive Notes Quick Banner */}
            <div className="p-3 bg-white/90 rounded-2xl border border-[#1A1A1A]/10 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <FolderArchive className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-bold text-[#1A1A1A] truncate">Mentor Notes (Drive)</p>
                  <p className="text-[10px] text-[#1A1A1A]/60 truncate">Lecture PPTs & PDF handouts</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('mentoring')}
                className="shrink-0 px-3 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider transition-all shadow-xs"
              >
                Drive
              </button>
            </div>

            <p className="text-xs italic leading-snug text-[#1A1A1A]/70">
              "Access your mentor's live calls and scheduled guidance in the Mentor Sessions section."
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('mentor')}
                className="flex-1 bg-white border border-[#1A1A1A] py-2.5 rounded-full text-[11px] uppercase tracking-wider font-semibold hover:bg-[#1A1A1A] hover:text-[#F9F7F2] transition-all"
              >
                Change Mentor
              </button>
              <button
                onClick={() => setActiveTab('mentor-sessions')}
                className="flex-1 bg-[#1A1A1A] text-[#F9F7F2] py-2.5 rounded-full text-[11px] uppercase tracking-wider font-semibold hover:bg-[#333] transition-all"
              >
                Sessions
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
