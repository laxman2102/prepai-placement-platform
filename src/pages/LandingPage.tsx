import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, ArrowRight, Brain, Code2, Bot, FileText,
  Shield, Users, GraduationCap, Trophy, BarChart3, Lock, CheckCircle2,
  KeyRound, Mail, X, User as UserIcon
} from 'lucide-react';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
}

interface RegisteredUserSummary {
  id: string;
  email: string;
  fullName: string;
  role: string;
  college?: string;
  branch?: string;
  createdAt: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab }) => {
  const { login, addToast } = useAuth();
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredUserSummary[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);

  // Password Prompt Modal State
  const [selectedUser, setSelectedUser] = useState<RegisteredUserSummary | null>(null);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isVerifyingPassword, setIsVerifyingPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>('');

  const fetchRegisteredUsers = async () => {
    try {
      setLoadingAccounts(true);
      const res = await fetch('/api/auth/registered-users');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRegisteredAccounts(data.data);
      }
    } catch (e) {
      console.error('Failed to load registered accounts', e);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchRegisteredUsers();
  }, []);

  const handleAccountClick = (acc: RegisteredUserSummary) => {
    setSelectedUser(acc);
    setPasswordInput('');
    setPasswordError('');
  };

  const handleVerifyPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!passwordInput.trim()) {
      setPasswordError('Please enter the password for this account.');
      return;
    }

    setIsVerifyingPassword(true);
    setPasswordError('');

    try {
      const endpoint = selectedUser.role === 'ROLE_ADMIN'
        ? '/api/auth/admin/login'
        : selectedUser.role === 'ROLE_MENTOR'
        ? '/api/auth/mentor/login'
        : '/api/auth/student/login';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedUser.email, password: passwordInput })
      });

      const data = await res.json();
      if (data.success) {
        login(data.data.token, data.data.user);
        addToast(`Authenticated successfully as ${data.data.user.fullName}`, 'success');
        setSelectedUser(null);
        setActiveTab('dashboard');
      } else {
        setPasswordError(data.message || 'Incorrect password. Authentication failed.');
        addToast(data.message || 'Authentication failed', 'error');
      }
    } catch (e) {
      setPasswordError('Network connection error while validating credentials.');
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const visibleAccounts = registeredAccounts.filter(acc => acc.role !== 'ROLE_ADMIN');

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-[#F9F7F2]">
      {/* Option Selection Hero Section */}
      <section className="relative pt-12 pb-16 border-b border-[#1A1A1A]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1A1A1A]/20 bg-[#1A1A1A]/5 text-[#1A1A1A] text-[11px] font-semibold tracking-[0.2em] uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#1A1A1A]" /> Official Placement Preparation & Intelligence Platform
            </div>

            <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-[#1A1A1A] leading-[1.08] font-serif">
              Prepare with Intelligence. <br />
              <span className="italic font-normal border-b-2 border-[#1A1A1A] pb-1">Perform with Confidence</span>
            </h1>

            <p className="text-[#1A1A1A]/70 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Choose your institutional role below to sign in or register with your official college email and OTP verification.
            </p>
          </div>

          {/* 2 Main Role Option Cards */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* 1. Student Portal Option Card */}
            <div className="bg-[#1A1A1A] text-[#F9F7F2] rounded-[32px] p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group border border-[#1A1A1A]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#F9F7F2]/10 border border-[#F9F7F2]/20 flex items-center justify-center text-[#F9F7F2]">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest px-3.5 py-1 rounded-full bg-[#F9F7F2] text-[#1A1A1A]">
                    Student Portal
                  </span>
                </div>

                <div>
                  <h3 className="font-serif italic text-3xl text-white">Student Workspace</h3>
                  <p className="text-xs text-[#F9F7F2]/75 mt-2 leading-relaxed">
                    Aptitude practice tests, real-time code IDE, AI mock interviews, ATS resume auditing, and dynamic placement roadmaps.
                  </p>
                </div>

                <div className="pt-2 space-y-2 text-[11px] text-[#F9F7F2]/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Official College Email & OTP Sign-in
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Quantitative & Coding Labs
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> AI Behavioral & Technical Mock Panels
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3 pt-6 border-t border-[#F9F7F2]/15">
                <button
                  onClick={() => setActiveTab('student-login')}
                  id="btn-option-student-login"
                  className="w-full py-3.5 rounded-full bg-[#F9F7F2] text-[#1A1A1A] text-xs font-semibold uppercase tracking-wider hover:bg-white transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Log In as Student <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('student-register')}
                  id="btn-option-student-register"
                  className="w-full py-3 rounded-full border border-[#F9F7F2]/40 text-[#F9F7F2] text-xs font-semibold uppercase tracking-wider hover:bg-[#F9F7F2]/10 transition-all flex items-center justify-center gap-2"
                >
                  Sign In as Student
                </button>
              </div>
            </div>

            {/* 2. Mentor Workspace Option Card */}
            <div className="bg-[#F0EDE5] border border-[#1A1A1A] rounded-[32px] p-8 flex flex-col justify-between shadow-xl relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A]/10 border border-[#1A1A1A]/20 flex items-center justify-center text-[#1A1A1A]">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#1A1A1A] text-[#1A1A1A]">
                    Faculty & Mentors
                  </span>
                </div>

                <div>
                  <h3 className="font-serif italic text-3xl text-[#1A1A1A]">Mentor Workspace</h3>
                  <p className="text-xs text-[#1A1A1A]/75 mt-2 leading-relaxed">
                    Review student test telemetry, schedule 1-on-1 counseling sessions, assign customized prep tasks, and track batch readiness.
                  </p>
                </div>

                <div className="pt-2 space-y-2 text-[11px] text-[#1A1A1A]/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1A1A1A]" /> Official Institution Email & OTP
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1A1A1A]" /> Student Task & Guidance Control
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1A1A1A]" /> 1-on-1 Counseling Sessions
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3 pt-6 border-t border-[#1A1A1A]/15">
                <button
                  onClick={() => setActiveTab('mentor-login')}
                  id="btn-option-mentor-login"
                  className="w-full py-3.5 rounded-full bg-[#1A1A1A] text-[#F9F7F2] text-xs font-semibold uppercase tracking-wider hover:bg-[#333333] transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Log In as Mentor <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('mentor-register')}
                  id="btn-option-mentor-register"
                  className="w-full py-3 rounded-full border border-[#1A1A1A]/40 text-[#1A1A1A] text-xs font-semibold uppercase tracking-wider hover:bg-[#1A1A1A]/5 transition-all flex items-center justify-center gap-2"
                >
                  Sign In as Mentor
                </button>
              </div>
            </div>
          </div>

          {/* Registered Accounts Section (Only shows created/registered users, asks for password on click) */}
          <div className="mt-16 border border-[#1A1A1A] bg-[#F9F7F2] rounded-[32px] p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b border-[#1A1A1A]/10 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] opacity-40 font-semibold mb-1">
                  Registered Institutional Accounts
                </p>
                <h2 className="text-2xl font-serif italic text-[#1A1A1A]">
                  Active System Profiles ({visibleAccounts.length})
                </h2>
              </div>
              <p className="text-xs italic text-[#1A1A1A]/60 mt-2 sm:mt-0">
                Click any profile to authenticate with its respective password
              </p>
            </div>

            {loadingAccounts ? (
              <div className="py-8 text-center text-xs opacity-50 uppercase tracking-widest">
                Loading registered accounts...
              </div>
            ) : visibleAccounts.length === 0 ? (
              <div className="py-8 text-center text-xs opacity-60">
                No student or mentor profiles registered yet. Use the "Sign In" options above to create a profile with OTP.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {visibleAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => handleAccountClick(acc)}
                    className="cursor-pointer border border-[#1A1A1A]/20 hover:border-[#1A1A1A] rounded-[24px] p-5 bg-white hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-semibold uppercase tracking-widest px-3 py-0.5 rounded-full ${
                          acc.role === 'ROLE_ADMIN'
                            ? 'bg-[#1A1A1A] text-[#F9F7F2]'
                            : acc.role === 'ROLE_MENTOR'
                            ? 'bg-[#F0EDE5] border border-[#1A1A1A] text-[#1A1A1A]'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        }`}>
                          {acc.role.replace('ROLE_', '')}
                        </span>
                        <KeyRound className="w-3.5 h-3.5 text-[#1A1A1A]/40 group-hover:text-[#1A1A1A] transition-colors" />
                      </div>

                      <h4 className="font-serif italic text-lg font-bold text-[#1A1A1A]">{acc.fullName}</h4>
                      <p className="text-xs font-mono text-[#1A1A1A]/60 truncate mt-0.5">{acc.email}</p>
                      {acc.college && (
                        <p className="text-[11px] text-[#1A1A1A]/75 mt-2 line-clamp-1">{acc.college}</p>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A]/70 group-hover:text-[#1A1A1A]">
                      <span>Enter Password</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Password Authentication Modal for clicked profile */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#F9F7F2] border border-[#1A1A1A] rounded-[32px] p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute right-6 top-6 p-2 rounded-full hover:bg-[#1A1A1A]/10 text-[#1A1A1A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.25em] opacity-40 font-semibold">Account Authentication</p>
              <h3 className="text-2xl font-serif italic text-[#1A1A1A] mt-1">{selectedUser.fullName}</h3>
              <p className="text-xs font-mono text-[#1A1A1A]/60 mt-1">{selectedUser.email}</p>
              <span className="inline-block mt-2 text-[10px] font-semibold uppercase tracking-widest px-3 py-0.5 rounded-full bg-[#1A1A1A]/10 text-[#1A1A1A]">
                {selectedUser.role.replace('ROLE_', '')}
              </span>
            </div>

            <form onSubmit={handleVerifyPasswordLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1.5">
                  Enter Password for this Account
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    autoFocus
                    required
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Enter security password"
                    className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifyingPassword}
                className="w-full py-3.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-[#F9F7F2] font-semibold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {isVerifyingPassword ? 'Authenticating...' : 'Verify Password & Sign In'} <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-xs text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:underline"
                >
                  Cancel and choose another portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Platform Pillars Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-[#1A1A1A] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] opacity-40 font-semibold">Core Architecture</p>
            <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Placement Intelligence Engine</h2>
          </div>
          <span className="text-xs uppercase tracking-widest opacity-50 mt-2 sm:mt-0 font-semibold">6 Modular Pillars</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border-t border-[#1A1A1A] pt-6 space-y-3">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-semibold">Module 01</div>
            <h3 className="text-xl font-serif italic text-[#1A1A1A] flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#1A1A1A]" /> Aptitude Engine
            </h3>
            <p className="text-xs leading-relaxed opacity-70">
              Quantitative Aptitude, Logical Reasoning, Verbal Ability & Data Interpretation with step-by-step logic and timed test series.
            </p>
          </div>

          <div className="border-t border-[#1A1A1A] pt-6 space-y-3">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-semibold">Module 02</div>
            <h3 className="text-xl font-serif italic text-[#1A1A1A] flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#1A1A1A]" /> Coding IDE
            </h3>
            <p className="text-xs leading-relaxed opacity-70">
              DSA & Algorithm problem suite supporting Java, Python, C++, and SQL with execution logs and test cases.
            </p>
          </div>

          <div className="border-t border-[#1A1A1A] pt-6 space-y-3">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-semibold">Module 03</div>
            <h3 className="text-xl font-serif italic text-[#1A1A1A] flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#1A1A1A]" /> AI Interviewer
            </h3>
            <p className="text-xs leading-relaxed opacity-70">
              Generates role-tailored technical & HR mock interviews with detailed score breakdowns for Technical, Communication, and Confidence.
            </p>
          </div>

          <div className="border-t border-[#1A1A1A] pt-6 space-y-3">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-semibold">Module 04</div>
            <h3 className="text-xl font-serif italic text-[#1A1A1A] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1A1A1A]" /> ATS Resume Audit
            </h3>
            <p className="text-xs leading-relaxed opacity-70">
              Evaluates resume keywords, missing tech stacks, formatting flaws, and role match percentage with actionable feedback.
            </p>
          </div>

          <div className="border-t border-[#1A1A1A] pt-6 space-y-3">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-semibold">Module 05</div>
            <h3 className="text-xl font-serif italic text-[#1A1A1A] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#1A1A1A]" /> AI Learning Roadmap
            </h3>
            <p className="text-xs leading-relaxed opacity-70">
              Personalized 3-week learning schedule adapting dynamically to weak topics identified during tests and mock interviews.
            </p>
          </div>

          <div className="border-t border-[#1A1A1A] pt-6 space-y-3">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-semibold">Module 06</div>
            <h3 className="text-xl font-serif italic text-[#1A1A1A] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#1A1A1A]" /> Readiness Gauge
            </h3>
            <p className="text-xs leading-relaxed opacity-70">
              Consolidated readiness score gauge evaluating preparedness for Tier-1 Product, Service & Consulting corporate recruiters.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

