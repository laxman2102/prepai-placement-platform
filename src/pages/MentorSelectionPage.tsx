import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserCheck, Search, Filter, CheckCircle2, Award, Mail, Phone,
  Building, GraduationCap, ChevronRight, ArrowLeft, RefreshCw,
  Sparkles, Bot, Code2, BookOpenCheck, ShieldCheck, Send, Clock,
  Key, AlertCircle, Check, Calendar
} from 'lucide-react';

interface MentorItem {
  id: string;
  code?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  department: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  company?: string;
  bio?: string;
  assignedStudentsCount: number;
  isCurrentlyAssigned: boolean;
  status: string;
}

interface MentorSelectionPageProps {
  setActiveTab?: (tab: string) => void;
}

export const MentorSelectionPage: React.FC<MentorSelectionPageProps> = ({ setActiveTab }) => {
  const { user, token, addToast, updateUser } = useAuth();
  const [mentors, setMentors] = useState<MentorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchName, setSearchName] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [isSelecting, setIsSelecting] = useState<string | null>(null);

  // Send request by Mentor ID state
  const [mentorIdInput, setMentorIdInput] = useState<string>('');
  const [mentorMsgInput, setMentorMsgInput] = useState<string>('');
  const [isSendingRequest, setIsSendingRequest] = useState<boolean>(false);

  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/student/mentors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMentors(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch mentors list:', e);
      addToast('Could not load mentors directory', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [token]);

  const handleSendMentorRequest = async (targetIdOrCode: string, msg?: string) => {
    if (!targetIdOrCode.trim()) {
      addToast('Please enter a Mentor ID or Code (e.g. MT0001)', 'error');
      return;
    }

    setIsSendingRequest(true);
    try {
      const res = await fetch('/api/student/request-mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mentorIdOrCode: targetIdOrCode.trim(),
          message: msg || mentorMsgInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(
          data.message || 'Mentorship request sent! Your mentor will receive this in their Student Approvals portal.',
          'success'
        );
        if (data.data?.user) {
          updateUser(data.data.user);
        }
        setMentorIdInput('');
        setMentorMsgInput('');
        await fetchMentors();
      } else {
        addToast(data.message || 'Failed to send mentorship request', 'error');
      }
    } catch (err) {
      addToast('Network error while sending mentorship request', 'error');
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleSelectMentor = async (mentor: MentorItem) => {
    setIsSelecting(mentor.id);
    await handleSendMentorRequest(mentor.code || mentor.id);
    setIsSelecting(null);
  };

  // Get unique departments for filter dropdown
  const departmentOptions = ['ALL', ...Array.from(new Set(mentors.map(m => m.specialization || m.department).filter(Boolean)))];

  // Filter mentors based on student input name or department
  const filteredMentors = mentors.filter(m => {
    const matchesName = searchName.trim() === '' ||
      m.fullName.toLowerCase().includes(searchName.toLowerCase().trim()) ||
      m.email.toLowerCase().includes(searchName.toLowerCase().trim());
    
    const matchesDept = selectedDept === 'ALL' ||
      (m.specialization && m.specialization.toLowerCase() === selectedDept.toLowerCase()) ||
      (m.department && m.department.toLowerCase() === selectedDept.toLowerCase());

    return matchesName && matchesDept;
  });

  const currentlyAssignedMentor = mentors.find(m => m.isCurrentlyAssigned);

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      {/* Back Button & Top Navigation */}
      {setActiveTab && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors py-2 px-3 rounded-full hover:bg-[#1A1A1A]/5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </button>

          <button
            onClick={() => setActiveTab('mentor-sessions')}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 hover:text-emerald-950 transition-colors py-2 px-4 rounded-full bg-emerald-100/70 border border-emerald-300"
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            View Mentor Sessions
          </button>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[#1A1A1A]/10 pb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-[10px] uppercase font-bold tracking-widest mb-3">
            <UserCheck className="w-3.5 h-3.5 text-blue-700" />
            Institutional Mentor Assignment
          </div>
          <h1 className="text-4xl sm:text-5xl font-light font-serif text-[#1A1A1A]">
            Faculty Mentor Selection
          </h1>
          <p className="text-xs text-[#1A1A1A]/70 max-w-2xl mt-2 leading-relaxed">
            Select a verified faculty mentor from your institution to inspect your technical assessments, evaluate AI mock interview sessions, provide voice guidance notes, and grant verified <b>Green Tick approvals</b>.
          </p>
        </div>

        <button
          onClick={fetchMentors}
          disabled={isLoading}
          className="p-3 rounded-full border border-[#1A1A1A]/20 hover:border-[#1A1A1A] hover:bg-[#1A1A1A]/5 text-[#1A1A1A] transition-all self-start sm:self-auto shrink-0"
          title="Refresh mentors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Currently Assigned Mentor Highlight */}
      {currentlyAssignedMentor && (
        <div className="border-2 border-emerald-600/40 bg-gradient-to-br from-emerald-50/60 to-white rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-md">
                {currentlyAssignedMentor.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    Currently Assigned Mentor
                  </span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-[#1A1A1A]/10 text-[#1A1A1A]">
                    {currentlyAssignedMentor.specialization || currentlyAssignedMentor.department}
                  </span>
                </div>
                <h3 className="text-2xl font-serif text-[#1A1A1A] font-bold">
                  {currentlyAssignedMentor.fullName}
                </h3>
                <p className="text-xs text-[#1A1A1A]/70 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>{currentlyAssignedMentor.qualification}</span>
                  <span>•</span>
                  <span>{currentlyAssignedMentor.experienceYears}+ Years Faculty Experience</span>
                  <span>•</span>
                  <span className="font-mono">{currentlyAssignedMentor.email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {setActiveTab && (
                <button
                  onClick={() => setActiveTab('mentor-sessions')}
                  className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-[#1A1A1A] text-[#F9F7F2] text-xs uppercase font-bold tracking-wider hover:bg-[#333333] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  View Mentor Sessions
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="border border-[#1A1A1A]/15 bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-serif italic text-[#1A1A1A]">Search Available Mentors</h2>
            <p className="text-xs text-[#1A1A1A]/60">
              Enter mentor name or choose department to view institutional mentors registered in this app.
            </p>
          </div>
          <div className="text-xs text-[#1A1A1A]/60 font-mono">
            Showing {filteredMentors.length} of {mentors.length} registered mentors
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Mentor Name Search Input */}
          <div className="md:col-span-2 relative">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1.5">
              Enter Mentor Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Enter mentor name (e.g. addepalli laxman)..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#1A1A1A]/20 bg-[#F9F7F2] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] focus:bg-white transition-all placeholder:text-[#1A1A1A]/35"
              />
              <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-3.5" />
              {searchName && (
                <button
                  onClick={() => setSearchName('')}
                  className="absolute right-3 top-3 text-xs text-[#1A1A1A]/40 hover:text-[#1A1A1A] px-2 py-0.5 rounded-full bg-[#1A1A1A]/5"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Department / Specialization Selector */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1.5">
              Select Department
            </label>
            <div className="relative">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full pl-10 pr-8 py-3 rounded-2xl border border-[#1A1A1A]/20 bg-[#F9F7F2] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] focus:bg-white transition-all appearance-none cursor-pointer"
              >
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'ALL' ? 'All Departments / Specializations' : dept}
                  </option>
                ))}
              </select>
              <Filter className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Available Mentors List */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif italic text-[#1A1A1A] flex items-center gap-2">
          <span>Available Faculty Mentors</span>
          <span className="text-xs font-sans not-italic font-bold px-2 py-0.5 bg-[#1A1A1A]/10 rounded-full text-[#1A1A1A]">
            {filteredMentors.length}
          </span>
        </h2>

        {isLoading ? (
          <div className="p-12 text-center bg-white border border-[#1A1A1A]/10 rounded-3xl">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#1A1A1A]/40 mb-3" />
            <p className="text-xs text-[#1A1A1A]/60 uppercase tracking-wider">Loading registered mentors...</p>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#1A1A1A]/20 rounded-3xl space-y-3">
            <Search className="w-10 h-10 mx-auto text-[#1A1A1A]/30" />
            <h3 className="text-lg font-serif italic text-[#1A1A1A]">No Mentors Found Matching "{searchName || selectedDept}"</h3>
            <p className="text-xs text-[#1A1A1A]/60 max-w-md mx-auto">
              Only mentors who are registered or created in this application can be selected. Try searching with a different name like <b>laxman</b> or selecting <b>All Departments</b>.
            </p>
            <button
              onClick={() => { setSearchName(''); setSelectedDept('ALL'); }}
              className="mt-2 px-4 py-2 rounded-full border border-[#1A1A1A] text-xs font-semibold uppercase tracking-wider hover:bg-[#1A1A1A] hover:text-[#F9F7F2] transition-all"
            >
              Reset Search Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMentors.map((mentor) => {
              const isAssigned = mentor.isCurrentlyAssigned;

              return (
                <div
                  key={mentor.id}
                  className={`border rounded-3xl p-6 transition-all shadow-sm flex flex-col justify-between ${
                    isAssigned
                      ? 'border-emerald-600/50 bg-emerald-50/30 ring-1 ring-emerald-500/30'
                      : 'border-[#1A1A1A]/15 bg-white hover:border-[#1A1A1A]/40'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Avatar & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-serif text-xl font-bold shrink-0 ${
                          isAssigned
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#1A1A1A] text-[#F9F7F2]'
                        }`}>
                          {mentor.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-lg font-serif font-bold text-[#1A1A1A]">
                              {mentor.fullName}
                            </h3>
                            {isAssigned && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" title="Assigned Mentor" />
                            )}
                          </div>
                          <p className="text-xs text-[#1A1A1A]/60 font-mono">
                            {mentor.email}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A] border border-[#1A1A1A]/10 shrink-0">
                        {mentor.specialization || mentor.department}
                      </span>
                    </div>

                    {/* Faculty Profile Details */}
                    <div className="space-y-2 text-xs text-[#1A1A1A]/80 border-t border-b border-[#1A1A1A]/10 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#1A1A1A]/60 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Qualification
                        </span>
                        <span className="font-semibold text-[#1A1A1A]">{mentor.qualification}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#1A1A1A]/60 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5" />
                          Experience
                        </span>
                        <span className="font-semibold text-[#1A1A1A]">{mentor.experienceYears}+ Years</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#1A1A1A]/60 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5" />
                          Department
                        </span>
                        <span className="font-semibold text-[#1A1A1A]">{mentor.department}</span>
                      </div>
                    </div>

                    {/* Mentorship Focus Summary */}
                    <p className="text-[11px] text-[#1A1A1A]/70 leading-relaxed italic">
                      "{mentor.bio || 'Provides candidate inspection, technical mock interview verification, and personalized voice recordings for placement readiness.'}"
                    </p>
                  </div>

                  {/* Selection Button */}
                  <div className="pt-5 mt-auto">
                    {isAssigned ? (
                      <div className="w-full py-3 px-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        Selected as Your Mentor
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectMentor(mentor)}
                        disabled={isSelecting === mentor.id}
                        className="w-full py-3 px-4 rounded-2xl bg-[#1A1A1A] text-[#F9F7F2] text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        {isSelecting === mentor.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Connecting Mentor...
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 text-blue-400" />
                            Select as My Mentor
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Help / Guidance Card */}
      <div className="border border-[#1A1A1A]/10 bg-[#F0EDE5] rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#1A1A1A] text-[#F9F7F2]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif italic text-[#1A1A1A]">How Mentor Guidance & Inspection Works</h3>
            <p className="text-xs text-[#1A1A1A]/60">Complete lifecycle from practice to institutional verification</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white border border-[#1A1A1A]/10 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[10px]">1</span>
              Practice Submissions
            </div>
            <p className="text-[11px] text-[#1A1A1A]/70">
              When you take an AI Mock Interview or solve Coding Labs, your results are automatically sent to your selected mentor.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#1A1A1A]/10 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[10px]">2</span>
              Faculty Review & Voice Notes
            </div>
            <p className="text-[11px] text-[#1A1A1A]/70">
              Your mentor inspects your answers, leaves detailed notes, and records spoken voice guidance for improvements.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#1A1A1A]/10 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">3</span>
              Verified Green Tick
            </div>
            <p className="text-[11px] text-[#1A1A1A]/70">
              Approved sessions receive the official Green Tick in your <b>Mentor Approval</b> tab, validating your placement readiness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
