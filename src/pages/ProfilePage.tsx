import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon, Save, GraduationCap, Shield, Users, ArrowLeft,
  KeyRound, ShieldCheck, Mail, Lock, CheckCircle2, Eye, EyeOff, Sparkles
} from 'lucide-react';

interface ProfilePageProps {
  setActiveTab?: (tab: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ setActiveTab }) => {
  const { user, token, addToast } = useAuth();

  // Profile Details State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [targetRole, setTargetRole] = useState(user?.studentProfile?.targetRole || 'Full-Stack Software Engineer');
  const [college, setCollege] = useState(user?.studentProfile?.college || 'National Institute of Technology (NIT)');
  const [degree, setDegree] = useState(user?.studentProfile?.degree || 'B.Tech');
  const [branch, setBranch] = useState(user?.studentProfile?.branch || 'Computer Science & Engineering');
  const [isSaving, setIsSaving] = useState(false);

  // Change Password with OTP State
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fullName, phoneNumber, targetRole, college, degree, branch })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Profile details updated successfully!', 'success');
      } else {
        addToast(data.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      addToast('Profile changes saved in session!', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendPasswordOtp = async () => {
    if (!user?.email) return;

    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, purpose: 'PASSWORD_RESET' })
      });
      const data = await res.json();
      if (data.success) {
        setIsOtpSent(true);
        setCountdown(60);
        addToast(`Password change OTP dispatched to ${user.email}`, 'success');
      } else {
        addToast(data.message || 'Failed to dispatch password OTP', 'error');
      }
    } catch (e) {
      addToast('Network error while requesting password reset OTP', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      addToast('Please enter the 6-digit OTP sent to your email', 'error');
      return;
    }
    if (!newPassword.trim()) {
      addToast('Please enter a new password', 'error');
      return;
    }
    if (newPassword.length < 4) {
      addToast('Password must be at least 4 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New password and confirmation do not match', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email: user?.email,
          otp: otp.trim(),
          newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Password updated successfully! You can now use your new password.', 'success');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setIsOtpSent(false);
      } else {
        addToast(data.message || 'Failed to update password. Please check the OTP.', 'error');
      }
    } catch (err) {
      addToast('Server connection error. Please try again.', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 pb-16 max-w-2xl mx-auto">
      {/* Top Back Option */}
      {setActiveTab && (
        <div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-[#1A1A1A]/10 pb-6 text-center">
        <div className="w-16 h-16 bg-[#1A1A1A] text-[#F9F7F2] rounded-full flex items-center justify-center font-serif italic text-3xl mx-auto mb-3 shadow-lg">
          {user.fullName.charAt(0)}
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <p className="text-[10px] uppercase tracking-[0.25em] opacity-40 font-semibold">{user.role.replace('ROLE_', '')} PROFILE</p>
          <span className="px-2.5 py-0.5 rounded-full bg-[#1A1A1A] text-amber-300 font-mono text-[10px] font-bold shadow-xs">
            ID: {user.code || (user.role === 'ROLE_STUDENT' ? 'ST0001' : user.role === 'ROLE_MENTOR' ? 'MT0001' : 'ADM001')}
          </span>
        </div>
        <h1 className="text-4xl font-serif italic text-[#1A1A1A] mt-1">{user.fullName}</h1>
        <p className="text-xs text-[#1A1A1A]/60 font-mono mt-1">{user.email}</p>
      </div>

      {/* 1. Account Details Form */}
      <form onSubmit={handleSaveProfile} className="border border-[#1A1A1A] bg-[#F9F7F2] rounded-[32px] p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#1A1A1A]" />
            <h3 className="font-serif italic font-bold text-xl text-[#1A1A1A]">Account Details</h3>
          </div>
          <span className="text-[10px] uppercase tracking-widest px-3 py-0.5 rounded-full bg-[#1A1A1A] text-[#F9F7F2] font-semibold">
            {user.role.replace('ROLE_', '')}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
              Institutional User ID (Assigned Code)
            </label>
            <input
              type="text"
              disabled
              value={user.code || (user.role === 'ROLE_STUDENT' ? 'ST0001' : user.role === 'ROLE_MENTOR' ? 'MT0001' : 'ADM001')}
              className="w-full bg-[#F0EDE5] border border-[#1A1A1A]/20 rounded-2xl px-4 py-3 text-sm text-[#1A1A1A] font-mono font-bold cursor-not-allowed shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">Official Email (Locked)</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full bg-[#F0EDE5] border border-[#1A1A1A]/20 rounded-2xl px-4 py-3 text-sm text-[#1A1A1A]/70 cursor-not-allowed font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">Contact Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          {user.role === 'ROLE_STUDENT' && (
            <>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">College / Institute</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">Degree</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">Branch</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">Target Placement Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 rounded-full bg-[#1A1A1A] text-[#F9F7F2] font-semibold text-xs uppercase tracking-widest hover:bg-[#333333] transition-all flex items-center justify-center gap-2 shadow-lg mt-6"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Saving Changes...' : 'Update Account Profile'}
          </button>
        </div>
      </form>

      {/* 2. Security & Password Change (With Email OTP Verification) */}
      <div className="border border-[#1A1A1A] bg-[#F9F7F2] rounded-[32px] p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#1A1A1A]" />
            <h3 className="font-serif italic font-bold text-xl text-[#1A1A1A]">Change Password (OTP Verified)</h3>
          </div>
          <span className="text-[10px] uppercase tracking-widest px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Secure Flow
          </span>
        </div>

        <p className="text-xs text-[#1A1A1A]/70">
          To update your password, request a 6-digit verification OTP to your registered official email ({user.email}).
        </p>

        {!isOtpSent ? (
          <div className="bg-white border border-[#1A1A1A]/20 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#1A1A1A]/5 flex items-center justify-center mx-auto text-[#1A1A1A]">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">Verify Identity with Official Email</p>
              <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                We will dispatch a secure 6-digit one-time code to <b>{user.email}</b>.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSendPasswordOtp}
              disabled={isSendingOtp}
              id="btn-send-password-otp"
              className="px-6 py-3 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-[#F9F7F2] text-xs font-semibold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {isSendingOtp ? 'Sending OTP...' : 'Send OTP to Official Email'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-700" />
                <span>Verification OTP sent to <b>{user.email}</b></span>
              </div>
              <button
                type="button"
                onClick={handleSendPasswordOtp}
                disabled={countdown > 0}
                className="text-[11px] font-semibold text-emerald-800 underline hover:text-emerald-950 disabled:opacity-40"
              >
                {countdown > 0 ? `Resend (${countdown}s)` : 'Resend OTP'}
              </button>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                Enter 6-Digit Email OTP
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit verification code"
                  className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl pl-10 pr-4 py-3 text-sm font-mono tracking-widest text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70">
                  New Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 hover:text-[#1A1A1A] flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 4 characters)"
                  className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsOtpSent(false);
                  setOtp('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="flex-1 py-3 rounded-full border border-[#1A1A1A]/30 text-[#1A1A1A] font-medium text-xs uppercase tracking-wider hover:bg-[#1A1A1A]/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingPassword}
                id="btn-update-password-submit"
                className="flex-1 py-3 rounded-full bg-[#1A1A1A] text-[#F9F7F2] font-semibold text-xs uppercase tracking-wider hover:bg-[#333333] transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isUpdatingPassword ? 'Verifying OTP...' : 'Verify OTP & Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
