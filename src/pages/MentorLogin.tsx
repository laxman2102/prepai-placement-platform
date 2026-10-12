import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

interface MentorLoginProps {
  setActiveTab: (tab: string) => void;
}

export const MentorLogin: React.FC<MentorLoginProps> = ({ setActiveTab }) => {
  const { login, addToast } = useAuth();
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendLoginOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      addToast('Please enter your registered official institutional email ID', 'error');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'LOGIN_OTP' })
      });
      const data = await res.json();
      if (data.success) {
        setIsOtpSent(true);
        setCountdown(60);
        if (data.data?.otp) {
          setServerOtp(data.data.otp);
          setOtp(data.data.otp);
        }
        addToast(`Login verification OTP dispatched to ${email}`, 'success');
      } else {
        addToast(data.message || 'Failed to dispatch OTP', 'error');
      }
    } catch (e) {
      addToast('Network error while requesting login OTP', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter your official email address', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = authMode === 'password'
        ? { email: email.trim(), password }
        : { email: email.trim(), otp: otp.trim() };

      const res = await fetch('/api/auth/mentor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        login(data.data.token, data.data.user);
        const codeText = data.data.user.code ? ` (ID: ${data.data.user.code})` : '';
        addToast(`Welcome back, ${data.data.user.fullName}${codeText}!`, 'success');
        setActiveTab('dashboard');
      } else {
        addToast(data.message || 'Authentication failed', 'error');
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
      <div className="max-w-md w-full mb-4">
        <button
          onClick={() => setActiveTab('landing')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Portal Selection
        </button>
      </div>

      <div className="max-w-md w-full bg-[#F9F7F2] border border-[#1A1A1A] rounded-[32px] p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1A1A1A] text-[#F9F7F2] mb-3">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.25em] opacity-40 font-semibold">Mentor Workspace</p>
          <h2 className="text-3xl font-serif italic text-[#1A1A1A] mt-1">Log In as Mentor</h2>
          <p className="text-xs text-[#1A1A1A]/60 mt-1">
            Placement guidance, student tasks, and mock evaluations
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex p-1 bg-[#1A1A1A]/5 rounded-2xl mb-6 border border-[#1A1A1A]/10">
          <button
            type="button"
            onClick={() => setAuthMode('password')}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
              authMode === 'password'
                ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-sm'
                : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
            }`}
          >
            Password Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('otp')}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
              authMode === 'otp'
                ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-sm'
                : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
            }`}
          >
            Official Email OTP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1.5">
              Official Institutional Email ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                placeholder="mentor@placement.edu"
              />
            </div>
          </div>

          {authMode === 'password' ? (
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  placeholder="Enter mentor password"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {!isOtpSent ? (
                <button
                  type="button"
                  onClick={handleSendLoginOtp}
                  disabled={isSendingOtp}
                  className="w-full py-3 rounded-2xl bg-[#1A1A1A] text-[#F9F7F2] text-xs font-semibold uppercase tracking-wider hover:bg-[#333333] transition-all"
                >
                  {isSendingOtp ? 'Sending Login OTP...' : 'Send Login OTP to Official Email'}
                </button>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold">
                        <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Email Dispatch: Login Code for <b>{email}</b></span>
                      </div>
                      {countdown > 0 && (
                        <span className="text-[11px] font-medium text-amber-800 shrink-0 ml-2">
                          Resend in {countdown}s
                        </span>
                      )}
                    </div>

                    <div className="bg-white border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">Verification OTP:</span>
                        <p className="text-2xl font-mono font-bold tracking-[0.25em] text-[#1A1A1A] mt-0.5">
                          {serverOtp || otp || '••••••'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (serverOtp) setOtp(serverOtp);
                            addToast('OTP auto-filled!', 'success');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#1A1A1A] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-[#333]"
                        >
                          Auto-fill
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (serverOtp || otp) {
                              navigator.clipboard.writeText(serverOtp || otp);
                              addToast('OTP copied to clipboard', 'info');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl border border-[#1A1A1A]/30 text-[#1A1A1A] text-[11px] font-medium uppercase tracking-wider hover:bg-black/5"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1.5">
                      Enter 6-Digit Login OTP
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl pl-10 pr-4 py-3 text-sm font-mono tracking-widest text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                        placeholder="Enter 6-digit OTP"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {(authMode === 'password' || isOtpSent) && (
            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-mentor-login-submit"
              className="w-full py-3.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-[#F9F7F2] font-semibold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg mt-4"
            >
              {isSubmitting ? 'Authenticating...' : 'Log In as Mentor'} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-[#1A1A1A]/10 text-center">
          <p className="text-xs text-[#1A1A1A]/60">
            Don't have a mentor user ID?{' '}
            <button
              onClick={() => setActiveTab('mentor-register')}
              className="text-[#1A1A1A] font-serif italic font-bold hover:underline"
            >
              Sign In as Mentor (Create ID)
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
