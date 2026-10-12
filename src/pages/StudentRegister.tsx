import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, ArrowLeft, Mail, Lock, CheckCircle2, RefreshCw, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

interface StudentRegisterProps {
  setActiveTab: (tab: string) => void;
}

export const StudentRegister: React.FC<StudentRegisterProps> = ({ setActiveTab }) => {
  const { login, addToast } = useAuth();

  // OTP Verification State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpFeedback, setOtpFeedback] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // Profile Form Data
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    college: '',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    graduationYear: 2026
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer countdown
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      addToast('Please enter a valid official college email ID', 'error');
      return;
    }

    setIsSendingOtp(true);
    setOtpFeedback(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'STUDENT_REGISTRATION' })
      });
      const data = await res.json();
      if (data.success) {
        setIsOtpSent(true);
        setCountdown(60);
        if (data.data?.otp) {
          setServerOtp(data.data.otp);
          setOtp(data.data.otp);
        }
        addToast(`6-Digit OTP dispatched to ${email}`, 'success');
      } else {
        addToast(data.message || 'Failed to dispatch OTP', 'error');
      }
    } catch (e) {
      addToast('Network error while requesting OTP', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.trim().length !== 6) {
      setOtpFeedback('Please enter the 6-digit numeric OTP sent to your college email.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpFeedback(null);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setIsOtpVerified(true);
        addToast('Official college email successfully verified!', 'success');
      } else {
        setOtpFeedback(data.message || 'Invalid verification OTP entered.');
        addToast(data.message || 'OTP verification failed', 'error');
      }
    } catch (e) {
      setOtpFeedback('Network error during verification.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpVerified) {
      addToast('Please verify your official college email with OTP first.', 'error');
      return;
    }

    if (formData.password.length < 4) {
      addToast('Password must be at least 4 characters long.', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/student/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          college: formData.college,
          degree: formData.degree,
          branch: formData.branch,
          graduationYear: formData.graduationYear,
          otp: otp.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        login(data.data.token, data.data.user);
        const assignedId = data.data.user?.code || 'ST0001';
        addToast(`✓ Account created! Your official Student ID is ${assignedId}.`, 'success');
        setActiveTab('dashboard');
      } else {
        addToast(data.message || 'Registration failed', 'error');
      }
    } catch (err) {
      addToast('Server connection error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 bg-[#F9F7F2]">
      {/* Back to Home / Portals */}
      <div className="max-w-2xl w-full mb-4">
        <button
          onClick={() => setActiveTab('landing')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Portal Selection
        </button>
      </div>

      <div className="max-w-2xl w-full bg-[#F9F7F2] border border-[#1A1A1A] rounded-[32px] p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1A1A1A] text-[#F9F7F2] mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.25em] opacity-40 font-semibold">Student Account Creation</p>
          <h2 className="text-3xl font-serif italic text-[#1A1A1A] mt-1">Sign In as Student (Create New User ID)</h2>
          <p className="text-xs text-[#1A1A1A]/60 mt-1 max-w-md mx-auto">
            Create your new student account with your official college email and OTP verification.
          </p>
        </div>

        {/* STEP 1: Official Email & OTP Verification Card */}
        <div className="mb-8 border border-[#1A1A1A]/20 bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-[#1A1A1A]/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-[#F9F7F2] text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">
                Institutional Email Verification
              </h3>
            </div>
            {isOtpVerified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1.5">
                Official College Email ID *
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    disabled={isOtpVerified}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student.name@college.edu or institutional mail"
                    className="w-full bg-[#F9F7F2]/50 border border-[#1A1A1A]/30 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] disabled:bg-gray-100 disabled:opacity-70"
                  />
                </div>
                {!isOtpVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || countdown > 0}
                    className="px-6 py-3 rounded-2xl bg-[#1A1A1A] text-[#F9F7F2] text-xs font-semibold uppercase tracking-wider hover:bg-[#333333] transition-all whitespace-nowrap disabled:opacity-50"
                  >
                    {isSendingOtp ? 'Sending OTP...' : countdown > 0 ? `Resend in ${countdown}s` : isOtpSent ? 'Resend OTP' : 'Send Verification OTP'}
                  </button>
                )}
              </div>
            </div>

            {/* Official Email Notification banner */}
            {isOtpSent && !isOtpVerified && (
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Official Email Dispatch: Verification Code for <b>{email}</b></span>
                  </div>
                  {countdown > 0 && (
                    <span className="text-[11px] font-medium text-amber-800 shrink-0 ml-2">
                      Resend in {countdown}s
                    </span>
                  )}
                </div>

                <div className="bg-white border border-amber-200/90 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">Your 6-Digit Verification Code:</span>
                    <p className="text-2xl font-mono font-bold tracking-[0.25em] text-[#1A1A1A] mt-0.5">
                      {serverOtp || otp || '••••••'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (serverOtp) setOtp(serverOtp);
                        addToast('OTP auto-filled into verification input!', 'success');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1A1A1A] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-[#333333] transition-all shadow-sm"
                    >
                      Auto-Fill Code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (serverOtp || otp) {
                          navigator.clipboard.writeText(serverOtp || otp);
                          addToast('Verification code copied to clipboard', 'info');
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-[#1A1A1A]/30 text-[#1A1A1A] text-[11px] font-medium uppercase tracking-wider hover:bg-[#1A1A1A]/5 transition-all"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-amber-900/80 leading-relaxed">
                  We have dispatched this verification email to <b>{email}</b>. If your email server delays external mail or filters it to spam, you can use the auto-filled code above to verify immediately.
                </p>
              </div>
            )}

            {/* OTP Input and Verify Action */}
            {isOtpSent && !isOtpVerified && (
              <div className="pt-2">
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1.5">
                  Enter 6-Digit Verification OTP *
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <ShieldCheck className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="e.g. 749201"
                      className="w-full bg-[#F9F7F2]/50 border border-[#1A1A1A]/30 rounded-2xl pl-10 pr-4 py-3 text-sm font-mono tracking-widest text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp}
                    className="px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    {isVerifyingOtp ? 'Verifying...' : 'Verify OTP Code'}
                  </button>
                </div>
                {otpFeedback && (
                  <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {otpFeedback}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: Profile Credentials & Academic Details */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-[#F9F7F2] text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">
              Profile Details & Security Password
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Rahul Sharma"
                className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl px-4 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl px-4 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                Create Account Password *
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl px-4 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl px-4 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
              College / University Name *
            </label>
            <input
              type="text"
              name="college"
              required
              value={formData.college}
              onChange={handleChange}
              placeholder="e.g. National Institute of Technology (NIT)"
              className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl px-4 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                Degree Program
              </label>
              <select
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              >
                <option value="B.Tech">B.Tech</option>
                <option value="B.E.">B.E.</option>
                <option value="M.Tech">M.Tech</option>
                <option value="MCA">MCA</option>
                <option value="B.Sc CS">B.Sc CS</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                Department / Branch
              </label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="Computer Science"
                className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl px-4 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                Graduation Year
              </label>
              <input
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl px-4 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isOtpVerified}
            id="btn-student-register-submit"
            className="w-full py-4 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-[#F9F7F2] font-semibold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-6 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Profile...' : 'Sign In as Student (Create ID)'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#1A1A1A]/10 text-center">
          <p className="text-xs text-[#1A1A1A]/60">
            Already have an active student profile?{' '}
            <button
              onClick={() => setActiveTab('student-login')}
              className="text-[#1A1A1A] font-serif italic font-bold hover:underline"
            >
              Log In here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

